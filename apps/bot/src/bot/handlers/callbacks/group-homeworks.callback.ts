import { renderGroupHomeworksPage } from "@/bot/render/group-homeworks-render";
import { extractItemFromQuery } from "@/bot/render/paginator";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryGroupHomeworksProps extends CallbackQueryProps {
	homeworkRepo: HomeworkRepository;
}

/**
 * Handles a callback query that displays the homeworks for a specified group.
 *
 * If the group id extracted from the callback data is invalid, logs an error and sends a short error message to the user. Otherwise retrieves the group's homeworks, renders the page content and reply markup, and updates the callback message with the rendered result.
 *
 * @param props - Callback properties including `ctx` (callback context), `bot` (logger), and `homeworkRepo` used to fetch group homeworks
 */
export async function CallbackQueryGroupHomeworks(
	props: CallbackQueryGroupHomeworksProps
) {
	const groupIdStr = extractItemFromQuery(props.ctx, 1);
	const groupId = Number.parseInt(groupIdStr || "");
	if (Number.isNaN(groupId)) {
		props.bot.logger.error("is NaN");
		await props.ctx.send("Что-то пошло не так");
		return;
	}

	const homeworks = await props.homeworkRepo.GetGroupHomeworks(groupId);
	const { text, reply_markup } = renderGroupHomeworksPage(homeworks);
	await props.ctx.editText(text, { reply_markup });
}
