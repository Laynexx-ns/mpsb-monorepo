import { InlineKeyboard } from "gramio";
import { RENDER_CALLBACKS } from "@/bot/render/render.types";
import type { Homework } from "@/prisma/client";
import { KEYBOARD_COMMANDS } from "../keyboards";

/**
 * Creates message text and an inline keyboard with one button per homework (labeled "✔️ {name}") and a Back button.
 *
 * @param homeworks - Array of homework objects to render as individual buttons
 * @returns Object containing `text` "Домашние задания группы:" and `reply_markup` with the constructed InlineKeyboard
 */
export function renderGroupHomeworksPage(homeworks: Homework[]) {
	const kbd = new InlineKeyboard();

	for (const hw of homeworks) {
		kbd.add({
			text: `✔️ ${hw.name}`,
			callback_data: RENDER_CALLBACKS.management.homeworkUsers.call(hw.id),
		});
		kbd.row();
	}

	kbd.row().add({
		text: KEYBOARD_COMMANDS.back,
		callback_data: RENDER_CALLBACKS.studyGroupsRender.updatePage.call(0),
	});

	const text = "Домашние задания группы:";
	return { text, reply_markup: kbd };
}
