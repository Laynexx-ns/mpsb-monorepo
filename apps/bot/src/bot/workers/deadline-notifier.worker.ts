import prisma from "@mpsb-monorepo/db";
import { Bot, type SuppressedAPIMethods } from "gramio";
import { exit } from "process";
import { HomeworkRepository } from "@/repository/homework.repository";
import { UserRepository } from "@/repository/user.repository";
import { LoggerFactory } from "@/utils/logger/logger-factory";
import { SCORE_TRANSACTIONS } from "../constants/score-transactions";

export interface DeadlineNotifierWorkerProps {
	botapi: SuppressedAPIMethods;
	userRepository: UserRepository;
	homeworkRepository: HomeworkRepository;
}

const CHECKING_PERIOD = 60_000;

export class DeadlineNotifierWorker {
	private botapi: SuppressedAPIMethods;
	private userRepository: UserRepository;
	private homeworksRepository: HomeworkRepository;
	constructor(props: DeadlineNotifierWorkerProps) {
		this.userRepository = props.userRepository;
		this.homeworksRepository = props.homeworkRepository;
		this.botapi = props.botapi;

		setInterval(async () => {
			try {
				await this.notifyExpiredHomeworks();
			} catch (e) {
				console.error("Deadline worker failed:", e);
			}
		}, CHECKING_PERIOD);
	}

	async notifyExpiredHomeworks() {
		const now = new Date();

		try {
			const expiredHomeworks =
				await this.homeworksRepository.GetExpiredHomeworks(now);

			for (const hw of expiredHomeworks) {
				try {
					let users;
					const groupId = hw.studyGroupId;
					if (groupId) {
						users =
							await this.userRepository.GetUsersNotCompletedHomeworkWithGroupId(
								hw.id,
								groupId
							);
					} else {
						users = await this.userRepository.GetUsersNotCompletedHomework(
							hw.id
						);
					}

					await this.homeworksRepository.ExpireHomework(hw.id);

					for (const user of users) {
						try {
							await this.userRepository.ChangeScore(
								user.id,
								SCORE_TRANSACTIONS.EXPIRED_HOMEWORK
							);

							// TODO: add to i18n
							await this.botapi.sendMessage({
								chat_id: user.id.toString(),
								text: `⏰ Дедлайн истек: ${hw.name}, ваш score изменился и теперь он равен ${user.score + SCORE_TRANSACTIONS.EXPIRED_HOMEWORK}`,
							});
						} catch (e) {
							logger.error("failed to update user score or send message");
						}
					}
				} catch (e) {
					logger.error(e);
				}
			}
		} catch (e) {
			logger.error(e);
		}
	}
}

// start logic
const logger = LoggerFactory.instance()
	.initialize()
	.child({ environment: "worker" });

if (!(process.env.DATABASE_URL && process.env.TELEGRAM_BOT_TOKEN)) {
	logger.error("Missing required env variables for worker");
	exit();
}

const botapi = new Bot(process.env.TELEGRAM_BOT_TOKEN).api;

const props: DeadlineNotifierWorkerProps = {
	botapi,
	userRepository: new UserRepository(prisma),
	homeworkRepository: new HomeworkRepository(prisma),
};

new DeadlineNotifierWorker(props);
