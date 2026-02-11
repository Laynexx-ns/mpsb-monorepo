import { pl } from "@/bot/helpers/parse-locale";
import type { AppState } from "@/bot/state/state.types";
import type { MessageHandlerProps } from "./messages-handlers.types";

export interface HandlerStartProps extends MessageHandlerProps {}

/**
 * Initiates the registration flow for the current user or notifies them if they are already registered.
 *
 * If a user record exists for the incoming context user, sends the localized "alreadyRegistered" message and stops.
 * Otherwise sets an AppState for the registration flow (step "enterName"), persists it, and sends a localized greeting while removing the keyboard.
 *
 * @param props - Handler properties providing the bot helpers and the incoming context (`ctx`) for the current update
 */
export async function HandlerStart(props: HandlerStartProps) {
	const id = props.ctx.from!.id;

	const user = await props.bot.getUser(id);

	// if users registered -> throw from this action, else -> registration
	if (user)
		return props.ctx.send(props.ctx.t(pl(props.ctx), "alreadyRegistered"), {
			reply_markup: props.ctx.access.keyboard,
		});

	const state: AppState = {
		currentFlow: "registration",
		step: "enterName",
		data: {},
	};

	await props.bot.setState(id, state);

	props.ctx.send(
		props.ctx.t(pl(props.ctx), "greeting", props.ctx.access.user?.name),
		{
			reply_markup: { remove_keyboard: true },
		}
	);
}
