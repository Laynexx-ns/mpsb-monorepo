import { bold, format, InlineKeyboard } from "gramio";
import { extractUserId } from "@/bot/helpers/extract-user-id";
import { isExpired } from "@/bot/helpers/is-expired";
import { KEYBOARD_COMMANDS } from "@/bot/keyboards";
import { renderHomeworksPage } from "@/bot/render/homeworks-render";
import {
	extractItemFromQuery,
	extractPageFromQuery,
} from "@/bot/render/paginator";
import { RENDER_CALLBACKS } from "@/bot/render/render.types";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryHomeworksRenderProps extends CallbackQueryProps {
	homeworkRepo: HomeworkRepository;
	userRepo: UserRepository;
}

/**
 * Render a paginated list of the current user's completed homeworks and update the callback message with the page content and inline keyboard.
 *
 * @param props - Callback context and dependencies (including `homeworkRepo`) used to fetch completed homeworks and edit the callback message
 */
export async function CallbackQueryHomeworksRender(
	props: CallbackQueryHomeworksRenderProps
) {
	const page = extractPageFromQuery(props.ctx);
	const userId = extractUserId(props.ctx);

	const userGroups = await props.userRepo.GetUserGroups(userId).catch((e) => {
		throw new Error("Failed to get user GroupsIds", { cause: e });
	});

	const hws = await props.homeworkRepo.GetCompletedHomeworks(
		userId,
		userGroups.map((g) => g.id),
		props.ctx.access.role
	);

	const { text, reply_markup } = renderHomeworksPage(hws, page);

	await props.ctx.editText(text, {
		reply_markup,
		parse_mode: "Markdown",
	});
}

export interface CallbackQuerySelectHomework extends CallbackQueryProps {
	homeworkRepo: HomeworkRepository;
}

/**
 * Show details for a selected homework and update the callback message with an action keyboard.
 *
 * Builds an inline keyboard based on the homework's existence, deadline, and whether the user has completed it,
 * then edits the current chat message to display the homework name, dates, and the user's score/status.
 *
 * @throws Error "id is null" when the homework id is not present in the query
 * @throws Error "id not number" when the homework id cannot be parsed as an integer
 * @throws Error "hw is empty" when no homework is found for the provided id
 */
export async function CallbackQuerySelectHomework(
	props: CallbackQuerySelectHomework
) {
	const page = extractPageFromQuery(props.ctx);
	const userId = extractUserId(props.ctx);
	const homeworkIdString = extractItemFromQuery(props.ctx, 2);
	if (!homeworkIdString) throw new Error("id is null");

	const homeworkId = Number.parseInt(homeworkIdString);
	if (Number.isNaN(homeworkId)) throw new Error("id not number");

	const hw = await props.homeworkRepo.GetHomework(homeworkId);
	if (!hw) {
		throw new Error("hw is empty");
	}
	const completed = await props.homeworkRepo.CheckCompleted(homeworkId, userId);

	const kbd = new InlineKeyboard();

	const expired = isExpired(hw.deadline);

	if (!expired) {
		if (completed) {
			kbd
				.add({
					text: KEYBOARD_COMMANDS.update,
					callback_data: RENDER_CALLBACKS.homeworksRender.sendHomework.call(
						homeworkId,
						hw.name,
						completed
					),
				})
				.add({
					text: KEYBOARD_COMMANDS.delete,
					callback_data:
						RENDER_CALLBACKS.homeworksRender.deleteUserHomework.call(hw.id),
				});
		} else {
			kbd.add({
				text: KEYBOARD_COMMANDS.send,
				callback_data: RENDER_CALLBACKS.homeworksRender.sendHomework.call(
					homeworkId,
					hw.name,
					completed
				),
			});
		}
	}

	kbd.row().add({
		text: KEYBOARD_COMMANDS.back,
		callback_data: RENDER_CALLBACKS.homeworksRender.updatePage.call(page),
	});

	const userHomework = await props.homeworkRepo.GetUserHomework(
		homeworkId,
		userId
	);
	const group = await props.homeworkRepo.GetHomeworkGroup(homeworkId);

	const text =
		format`Домашнее задание ${bold`${hw?.name}\n`}` +
		`Задано для: ${group ? group.title : ""}\n` +
		`Задано: ${hw?.created_at.toLocaleDateString()}\n` +
		`${hw.deadline ? `Сделать до ${hw?.deadline?.toLocaleDateString()}` : ""}\n` +
		`Оценка: ${userHomework?.checked ? (userHomework.score ? userHomework.score : "проверено") : "нет"}\n` +
		`${expired && !completed ? "🚫 Просрочено" : ""}`;

	await props.ctx.editText(text, {
		reply_markup: kbd,
	});
}
