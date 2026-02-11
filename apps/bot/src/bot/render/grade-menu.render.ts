import { InlineKeyboard } from "gramio";
import { RENDER_CALLBACKS } from "@/bot/render/render.types";
import { KEYBOARD_COMMANDS } from "../keyboards";

/**
 * Build a reply with an inline keyboard for selecting a grade for a homework submission.
 *
 * @param homeworkId - Identifier of the homework whose submission is being graded
 * @param userId - Telegram user identifier of the student whose submission is being graded
 * @returns An object containing `text` prompt ("Выберите оценку:") and `reply_markup` set to an InlineKeyboard with grade buttons (2, 3, 4, 5), a "Проверено" button, and a back button
 */
export function renderGradeMenu(homeworkId: number, userId: bigint) {
	const kbd = new InlineKeyboard();

	[2, 3, 4, 5].forEach((g) => {
		kbd.add({
			text: String(g),
			callback_data: RENDER_CALLBACKS.management.setGrade.call(
				homeworkId,
				userId,
				String(g)
			),
		});
	});

	kbd.row().add({
		text: "Проверено",
		callback_data: RENDER_CALLBACKS.management.setGrade.call(
			homeworkId,
			userId,
			"checked"
		),
	});

	kbd.row().add({
		text: KEYBOARD_COMMANDS.back,
		callback_data: RENDER_CALLBACKS.management.homeworkUsers.call(homeworkId),
	});

	const text = "Выберите оценку:";
	return { text, reply_markup: kbd };
}
