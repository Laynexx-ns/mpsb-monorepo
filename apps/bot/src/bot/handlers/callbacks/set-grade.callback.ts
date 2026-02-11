import { pl } from "@/bot/helpers/parse-locale";
import { renderHomeworkUsersPage } from "@/bot/render/homework-users.render";
import { extractItemFromQuery } from "@/bot/render/paginator";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQuerySetGradeProps extends CallbackQueryProps {
	homeworkRepo: HomeworkRepository;
	userRepo: UserRepository;
}

/**
 * Handle a callback query to assign a grade or mark a user's homework as checked, notify the student, and refresh the homework users list.
 *
 * Parses homework ID, user ID, and grade from the callback data, persists the score (treating "checked" as a checked-only mark), notifies the affected user about the result, and updates the message showing users who completed the homework. If the callback data is invalid, no changes are made; if the homework cannot be loaded, sends a generic error message instead of updating the view.
 *
 * @param props - Handler dependencies and context, including:
 *   - ctx: the callback query context
 *   - bot: bot utilities for logging and notifications
 *   - homeworkRepo: repository with methods to set scores and fetch homework
 *   - userRepo: repository to fetch users who completed the homework
 */
export async function CallbackQuerySetGrade(props: CallbackQuerySetGradeProps) {
	const hwId = Number.parseInt(extractItemFromQuery(props.ctx, 1) || "");
	const userId = BigInt(extractItemFromQuery(props.ctx, 2) || "");
	const gradeStr = extractItemFromQuery(props.ctx, 3);
	if (Number.isNaN(hwId) || !userId || !gradeStr) {
		props.bot.logger.error("number is Nan or !userId or !gradeStr ");
		return;
	}

	if (gradeStr === "checked") {
		await props.homeworkRepo.SetUserHomeworkScore(hwId, userId, 0);
	} else {
		const score = Number.parseInt(gradeStr);
		if (![2, 3, 4, 5].includes(score)) {
		}
		await props.homeworkRepo.SetUserHomeworkScore(hwId, userId, score, true);
	}

	const homework = await props.homeworkRepo.GetHomework(hwId);
	await props.bot.notify(
		[userId],
		`⚠️ Преподаватель проверил вашу работу (${homework?.name}),\nоценка: ${gradeStr == "checked" ? "Проверено" : gradeStr}`
	);
	await props.ctx.answerCallbackQuery({ text: "Оценка сохранена" });

	if (!homework) {
		await props.ctx.send(props.ctx.t(pl(props.ctx), "smthWentWrong"));
		return;
	}
	const users = await props.userRepo.GetUsersCompletedHomework(hwId);
	const { text, reply_markup } = renderHomeworkUsersPage(users, homework);
	await props.ctx.editText(text, { reply_markup });
}
