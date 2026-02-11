import { renderGradeMenu } from "@/bot/render/grade-menu.render";
import { extractItemFromQuery } from "@/bot/render/paginator";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryGradeMenuProps extends CallbackQueryProps {
	homeworkRepo: HomeworkRepository;
}

/**
 * Handle a callback query by rendering and displaying a grade selection menu.
 *
 * Extracts homework and user identifiers from the callback query, validates them,
 * renders the grade menu, and updates the message with the resulting text and reply markup.
 * If the identifiers are invalid, the function returns early without modifying the message.
 *
 * @param props - Handler properties containing the callback context and homework repository
 */
export async function CallbackQueryGradeMenu(
	props: CallbackQueryGradeMenuProps
) {
	const hwId = Number.parseInt(extractItemFromQuery(props.ctx, 1) || "");
	const userId = BigInt(extractItemFromQuery(props.ctx, 2) || "");
	if (Number.isNaN(hwId) || !userId) {
		console.error("is nan");
		return;
	}

	const { text, reply_markup } = renderGradeMenu(hwId, userId);
	await props.ctx.editText(text, { reply_markup });
}
