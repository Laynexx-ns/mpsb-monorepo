import { rm } from "node:fs/promises";
import path from "node:path/win32";
import { uploadHomeworkToDisk } from "@/bot/api/yandex/upload-document";
import type { GramioBot } from "@/bot/bot.factory";
import { pl } from "@/bot/helpers/parse-locale";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { UserRepository } from "@/repository/user.repository";
import { registerStep } from "../../flow-registry";

export interface SendHomeworkDoneStepProps {
	bot: GramioBot;
	homeworkRepo: HomeworkRepository;
	userRepo: UserRepository;
}

export const SendHomeworkDoneStep = (props: SendHomeworkDoneStepProps) => {
	registerStep("sendHomework", "sendHomework_done", async ({ ctx, state }) => {
		const userId = BigInt(ctx.from!.id);

		const loadingMsg = await ctx.send("⌛", {
			reply_markup: {
				remove_keyboard: true,
			},
		});
		const kbd = await props.bot.GetKeyboard(userId);

		let err: Error | null | unknown = null;
		try {
			const homeworkId = state.data.homeworkId;
			const groupId = state.data.groupIdl;
			const homework = await props.homeworkRepo.GetHomework(homeworkId);
			const homeworks = await props.homeworkRepo.GetCompletedHomeworks(
				userId,
				groupId
			);

			if (!homework) {
				props.bot.logger.error("homework doesn't exist");
				// TODO: add to i18n
				await ctx.send("Домашки не существует, что-то пошло не так:(", {
					reply_markup: kbd,
				});
				return "cancel";
			}
			const homeworkCompleted = homeworks.some(
				(hw) => hw.id == homework.id && hw.completed
			);
			const homeworkPath = state.data.homeworkPath;

			props.bot.logger.info(`homework path: ${homeworkPath}`);

			const user = await props.bot.getUser(userId);

			if (!user) {
				// TODO: add to i18n
				await ctx.send("Something went wrong, please try again", {
					reply_markup: kbd,
				});
				props.bot.logger.error("user doesn't exist");
				return "cancel";
			}

			const group = await props.userRepo.GetStudyGroupById(user.studyGroupId);
			if (!group) {
				await ctx.send(ctx.t(pl(ctx), "smthWentWrong"), {
					reply_markup: kbd,
				});
				return "cancel";
			}

			const ok = await uploadHomeworkToDisk({
				filepath: homeworkPath,
				homeworkName: homework?.name,
				user,
				group,
			});

			if (!ok) {
				// TODO: add to i18n
				const errorText = "failed to load homework, please try again";
				props.bot.logger.error(errorText);
				await ctx.send(errorText, { reply_markup: kbd });
			}

			if (!homeworkCompleted) {
				await props.homeworkRepo
					.CompleteHomework({
						homeworkId,
						userId,
					})
					.catch(async (e) => {
						props.bot.logger.error(e);
						// TODO: add to i18n
						await ctx.send("failed to upload homework, please report a bug");
					});
			}

			const file = Bun.file(homeworkPath);
			await file.delete();
			const folderPath = path.dirname(homeworkPath);
			await rm(folderPath, { recursive: true, force: true });

			// TODO: add to i18n
			await ctx.send(
				`Домашка ${homework.name ? `для ${homework.name}` : ""} успешно ${homeworkCompleted ? "изменена" : "загружена"}`,
				{ reply_markup: kbd }
			);

			const ids = await props.userRepo.GetAdminIds();
			// TODO: add to i18n
			await props.bot.notify(
				ids,
				`*${user.name + " " + user.last_name} (${user.username ? `@${user.username}` : ""})* загрузил домашнее задание для ${homework.name}`,
				{
					parse_mode: "Markdown",
				}
			);
		} catch (e) {
			props.bot.logger.error(e);
			err = e;
			// TODO: add to i18n
			await ctx.send("Что-то пошло не так", { reply_markup: kbd });
		} finally {
			ctx.deleteMessages([loadingMsg.id]);
		}

		if (err) {
			await ctx.send("Что-то пошло не так");
		}

		return "cancel";
	});
};
