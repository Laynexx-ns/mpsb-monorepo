import { wrap } from "@bogeychan/elysia-logger";
import cors from "@elysiajs/cors";
import type { GramioBot } from "@mpsb-monorepo/bot";
import { bootstrap } from "@mpsb-monorepo/bot/bootstrap";
import prisma from "@mpsb-monorepo/db";
import { env } from "@mpsb-monorepo/env/server";
import { LoggerFactory, loggerConfigs } from "@mpsb-monorepo/logger";
import { HomeworkRepository, UserRepository } from "@mpsb-monorepo/repository";
import * as yAPI from "@mpsb-monorepo/yandex-api";
import { Elysia, t } from "elysia";
import { AuthMiddleware } from "./auth";

const LISTEN_PORT = 3000;

const logger = LoggerFactory.instance()
	.initialize(loggerConfigs.development)
	.child({});

export type ElysiaLogger = ReturnType<typeof wrap>;
const elysiaLogger: ElysiaLogger = wrap(logger);

// for some reason I need to explicitly define bot's type
const bot = (await bootstrap(prisma)) as GramioBot;
const CORS = env.CORS.split(",");

logger.warn(CORS);

const userRepository = new UserRepository(prisma);
const homeworkRepository = new HomeworkRepository(prisma);

// This is just a simple almost one-file app, so I think there's no reason to work on it's architecture
const app = new Elysia()
	.use(
		cors({
			origin: CORS,
		})
	)
	.use(elysiaLogger)
	.get("/ping", () => "Meow")
	.use(AuthMiddleware);

app.get("/verify", ({ jwtpayload, status, log }) => {
	log.info({ jwtpayload }, "user verified");
	status(200, "OK");
	return {
		jwtpayload,
	};
});

app.post(
	"/homework",
	async ({ jwtpayload, body, status, log }) => {
		const file = body.file;

		if (!file) {
			return status(400, "File is missing");
		}

		log.info(
			{
				name: file.name,
				size: file.size,
				type: file.type,
			},
			"received file"
		);

		try {
			await yAPI.uploadHomeworkToDisk({
				file,
				groupTitle: jwtpayload.groupTitle,
				userName: jwtpayload.userName,
				homeworkName: jwtpayload.homeworkName,
			});
		} catch (e) {
			log.error({ err: e }, "failed to upload homework");
			return status(523, "Yandex origin is unreachable");
		}

		bot.botInst.api.sendMessage({
			text: `✅ Файл для ${jwtpayload.groupTitle} успешно отправлен в облако`,
			chat_id: jwtpayload.userId.toString(),
		});

		const adminIds = await userRepository.GetAdminIds();

		// TODO: add to i18n
		await bot.notify(
			adminIds,
			`*${jwtpayload.userName}* | ${jwtpayload.groupTitle} загрузил домашнее задание для ${jwtpayload.homeworkName}`,
			{
				parse_mode: "Markdown",
			}
		);
		log.info(
			{
				userId: jwtpayload.userId,
				homeworkName: jwtpayload.homeworkName,
				group: jwtpayload.groupTitle,
			},
			"sendHomework_done:success"
		);

		homeworkRepository.CompleteHomework({
			userId: jwtpayload.userId,
			homeworkId: jwtpayload.homeworkId,
		});

		return status(200, "OK");
	},
	{
		body: t.Object({
			file: t.File(),
		}),
	}
);

app.listen({
	port: LISTEN_PORT,
	hostname: "0.0.0.0",
});

logger.info(`Server started on port: ${LISTEN_PORT}`);
