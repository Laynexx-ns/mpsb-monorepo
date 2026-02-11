import { InlineKeyboard } from "gramio";
import { buildUserFullname } from "@/bot/helpers/build-user-fullname";
import { RENDER_CALLBACKS } from "@/bot/render/render.types";
import type { Homework, User } from "@/prisma/client";
import { KEYBOARD_COMMANDS } from "../keyboards";

/**
 * Build an inline keyboard page listing users who completed a homework with a short header.
 *
 * The keyboard includes a top delete button, one button per user that opens that user's grade menu, and a back button to the group's homework list.
 *
 * @param users - Array of users to render as individual buttons; each button opens the grade menu for that user
 * @param homework - Homework record used to construct callback data and the header text
 * @param page - Optional zero-based page index for navigation (currently not used by the layout)
 * @returns An object with `text` set to "Выполнили: {homework.name}\nВсего: {users.length}" and `reply_markup` containing an InlineKeyboard with the described buttons
 */
export function renderHomeworkUsersPage(
	users: User[],
	homework: Homework,
	page = 0
) {
	const kbd = new InlineKeyboard();

	kbd
		.row()
		.add({
			text: KEYBOARD_COMMANDS.delete,
			callback_data: RENDER_CALLBACKS.management.deleteHomework.call(
				homework.id
			),
		})
		.row();

	for (const u of users) {
		kbd.add({
			text: buildUserFullname(u),
			callback_data: RENDER_CALLBACKS.management.gradeMenu.call(
				homework.id,
				u.id
			),
		});
		kbd.row();
	}

	kbd.row().add({
		text: KEYBOARD_COMMANDS.back,
		callback_data: RENDER_CALLBACKS.management.groupHomeworks.call(
			homework.studyGroupId
		),
	});

	const text = `Выполнили: ${homework.name}\nВсего: ${users.length}`;
	return { text, reply_markup: kbd };
}
