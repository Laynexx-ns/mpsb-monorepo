import { expandableBlockquote, format, InlineKeyboard } from "gramio";
import { buildUserFullname } from "@/bot/helpers/build-user-fullname";
import { KEYBOARD_COMMANDS } from "@/bot/keyboards";
import {
	extractItemFromQuery,
	extractPageFromQuery,
} from "@/bot/render/paginator";
import { RENDER_CALLBACKS } from "@/bot/render/render.types";
import { renderStudyGroupsPage } from "@/bot/render/study-groups-render";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryChooseClassOpenProps extends CallbackQueryProps {
	userRepo: UserRepository;
}

/**
 * Open a study group's detail view and update the current message with its student list and action keyboard.
 *
 * @param props - Callback query context and repositories used to read the study group, its users, and edit the message.
 * @throws Error - If the callback query does not contain an id ("id is null").
 * @throws Error - If the id parsed from the callback is not a number ("id not number").
 * @throws Error - If the study group for the parsed id does not exist ("study group doesn't exist").
 */
export async function CallbackQueryOpenClass(
	props: CallbackQueryChooseClassRenderProps
) {
	const page = extractPageFromQuery(props.ctx);
	const stringId = extractItemFromQuery(props.ctx, 2);
	if (!stringId) {
		throw new Error("id is null");
	}
	const id = Number.parseInt(stringId);
	if (Number.isNaN(stringId)) {
		throw new Error("id not number");
	}
	const studyGroup = await props.userRepo.GetStudyGroupById(id);
	if (!studyGroup) {
		throw new Error("study group doesn't exist");
	}
	const users = await props.userRepo.GetStudyGroupUsers(id);

	const kbd = new InlineKeyboard()
		.text(
			"📋 Проверить домашки",
			RENDER_CALLBACKS.management.groupHomeworks.call(id)
		)
		.row()
		.text(
			"➕ Создать ДЗ",
			RENDER_CALLBACKS.studyGroupsRender.selectGroup.call(id)
		)
		.row()
		.add({
			text: KEYBOARD_COMMANDS.back,
			callback_data: RENDER_CALLBACKS.studyGroupsRender.updatePage.call(page),
		});

	let usersText = "";
	users.forEach((u) => (usersText += `\n${buildUserFullname(u)}`));

	const text = format`Ученики ${studyGroup.title}: \n${expandableBlockquote`${usersText}`}`;

	await props.ctx.editText(text, {
		reply_markup: kbd,
	});
}

export interface CallbackQueryChooseClassRenderProps
	extends CallbackQueryProps {
	userRepo: UserRepository;
}

/**
 * Update the current chat message to display the study groups list for the extracted page.
 *
 * @param props - Handler properties containing the callback query context (`ctx`) and `userRepo` used to fetch study groups
 */
export async function CallbackQueryClassUpdatePage(
	props: CallbackQueryChooseClassRenderProps
) {
	const page = extractPageFromQuery(props.ctx);
	const groups = await props.userRepo.GetStudyGroups();

	const { text, reply_markup } = renderStudyGroupsPage({ groups, page });

	await props.ctx.editText(text, {
		reply_markup,
		parse_mode: "Markdown",
	});
}
