import { InlineKeyboard } from "gramio";
import { buildUserFullname } from "@/bot/helpers/build-user-fullname";
import {
	extractItemFromQuery,
	extractPageFromQuery,
} from "@/bot/render/paginator";
import { RENDER_CALLBACKS } from "@/bot/render/render.types";
import { renderRequestsPage } from "@/bot/render/requests-render";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryRequestsUpdatePageProps
	extends CallbackQueryProps {
	userRepo: UserRepository;
}

/**
 * Update the displayed pending requests list for the current page.
 *
 * Fetches pending request users, renders the requests page for the page extracted from the callback query, and updates the callback message with the rendered text and inline keyboard.
 *
 * @param props - Callback properties containing the Telegram callback context (`ctx`) and a `userRepo` used to load pending request users
 */
export async function CallbackQueryRequestsUpdatePage(
	props: CallbackQueryRequestsUpdatePageProps
): Promise<void> {
	const page = extractPageFromQuery(props.ctx);
	const users = await props.userRepo.GetUsersFromPendingRequests();

	const { text, reply_markup } = renderRequestsPage({
		page,
		users,
	});

	await props.ctx.editText(text, {
		reply_markup,
		parse_mode: "Markdown",
	});
}

export interface CallbackQueryRequestsOpenRequestProps
	extends CallbackQueryProps {
	userRepo: UserRepository;
}

/**
 * Open the details for a pending user request and replace the message with request-specific actions.
 *
 * Renders the requester's name and username, builds an inline keyboard with profile, accept, reject, and back actions, and edits the current Telegram message with that content.
 *
 * @param props - Callback properties containing the Telegram context and a userRepo used to fetch the requested user
 * @throws Error If the request user id is missing ("userId is empty")
 * @throws Error If the requested user does not exist ("user not exist")
 */
export async function CallbackQueryRequestsOpenRequest(
	props: CallbackQueryRequestsOpenRequestProps
) {
	const page = extractPageFromQuery(props.ctx);
	const requestUserId = extractItemFromQuery(props.ctx, 2);
	if (!requestUserId) {
		throw new Error("userId is empty");
	}

	const user = await props.userRepo.GetUser(BigInt(requestUserId));
	if (!user) {
		throw new Error("user not exist");
	}

	// TODO: add i18n and requested class
	const message =
		`ℹ️ Запрос от: ${buildUserFullname(user)}\n` +
		`Аккаунт: @${user.username}\n\n` +
		"──────────────\n" +
		"_Выберите действие ниже_";

	const kbd = new InlineKeyboard()
		.add({
			text: "👤 Profile",
			url: `t.me/${user.username}`,
		})
		.row()
		.add(
			{
				text: "✅ Accept",
				callback_data: `Approve:${requestUserId}`,
			},
			{
				text: "🚫 Reject",
				callback_data: `Disapprove:${requestUserId}`,
			}
		)
		.row()
		.add({
			text: "← Back",
			callback_data: RENDER_CALLBACKS.requestsRender.updatePage.call(page),
		});

	await props.ctx.editText(message, {
		reply_markup: kbd,
		parse_mode: "Markdown",
	});
}
