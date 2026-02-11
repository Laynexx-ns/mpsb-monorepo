import { getStepHandler } from "./state/flow-registry";
import type { AppState } from "./state/state.types";
import type { GramioMessageContext } from "./types/bot.types";

/**
 * Executes the current flow step handler and advances `state.step` when the handler yields a next step.
 *
 * @param ctx - The message context for the current invocation.
 * @param state - The application state that contains `currentFlow` and `step`; `state.step` will be updated when a next step is returned.
 * @returns The next step identifier returned by the handler, or `undefined` if no handler was found or no next step was returned.
 */
export async function runStep(ctx: GramioMessageContext, state: AppState) {
	const handler = getStepHandler(state.currentFlow, state.step);
	if (!handler) return;

	const nextStep = await handler({ ctx, state });
	if (!nextStep) return;

	state.step = nextStep;

	return nextStep;
}
