import type { Bot, Keyboard } from "gramio";
import type { Role } from "@/prisma/enums";
import type { GramioBot } from "../bot.factory";
import { extractUserId } from "../helpers/extract-user-id";
import { getRelativeKeyboard } from "../helpers/get-relative-kbd";

/**
 * Register a derive handler for incoming messages that injects access info (user, role, keyboard) into the context.
 *
 * The handler extracts the user ID from the incoming context, resolves the user via `gbot.getUser`,
 * determines the user's role (defaults to "GUEST" if not found), computes a relative keyboard for that role,
 * and adds an `access` object containing `user`, `role`, and `keyboard` to the derived context.
 *
 * @param gbot - GramioBot instance used to resolve user data
 * @param bot - Bot instance on which the "message" derive handler will be registered
 */
export function DeriveMessageAccessMiddleware(gbot: GramioBot, bot: Bot) {
	bot.derive("message", async (ctx) => {
		const userId = extractUserId(ctx);
		const user = await gbot.getUser(userId);

		let role: Role;
		let keyboard: Keyboard;

		role = user ? user.role : "GUEST";
		keyboard = getRelativeKeyboard(role);

		return {
			access: {
				user,
				role,
				keyboard,
			},
		};
	});
}

/**
 * Registers a derive handler for "callback_query" events that injects access information into the context.
 *
 * The handler resolves the current user and determines their role and appropriate keyboard, then attaches an
 * `access` object containing `{ user, role, keyboard }` to the derived context for callback_query processing.
 *
 * @param gbot - Application-level bot helper used to fetch user data
 * @param bot - Gramio Bot instance on which to register the derive handler
 */
export function DeriveCallbackQueryeAccessMiddleware(
	gbot: GramioBot,
	bot: Bot
) {
	bot.derive("callback_query", async (ctx) => {
		const userId = extractUserId(ctx);
		const user = await gbot.getUser(userId);

		let role: Role;
		let keyboard: Keyboard;

		role = user ? user.role : "GUEST";
		keyboard = getRelativeKeyboard(role);

		return {
			access: {
				user,
				role,
				keyboard,
			},
		};
	});
}
