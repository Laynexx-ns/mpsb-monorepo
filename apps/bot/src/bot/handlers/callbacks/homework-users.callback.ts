import { pl } from "@/bot/helpers/parse-locale";
import { renderHomeworkUsersPage } from "@/bot/render/homework-users.render";
import { extractItemFromQuery } from "@/bot/render/paginator";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryHomeworkUsersProps extends CallbackQueryProps {
	homeworkRepo: HomeworkRepository;
	userRepo: UserRepository;
}

/**
 * Handle a callback that displays users who completed a specific homework.
 *
 * Extracts the homework ID from the callback query, loads the homework and the users who completed it,
 * renders the users list page, and updates the callback message with the rendered content.
 * If the extracted ID is invalid or the homework cannot be found, an error is logged and the message is not updated.
 *
 * @param props - Callback properties containing `ctx`, `bot`, `homeworkRepo`, and `userRepo` used to process the callback and update the chat message
 */
export async function CallbackQueryHomeworkUsers(
	props: CallbackQueryHomeworkUsersProps
) {
	const hwIdStr = extractItemFromQuery(props.ctx, 1);
	const hwId = Number.parseInt(hwIdStr || "");
	if (Number.isNaN(hwId)) {
		props.bot.logger.error("hw is NaN");
	}

	const homework = await props.homeworkRepo.GetHomework(hwId);
	if (!homework) {
		props.bot.logger.error(props.ctx.t(pl(props.ctx), "smthWentWrong"));
		return;
	}

	const users = await props.userRepo.GetUsersCompletedHomework(hwId);
	const { text, reply_markup } = renderHomeworkUsersPage(users, homework);
	await props.ctx.editText(text, { reply_markup });
}
