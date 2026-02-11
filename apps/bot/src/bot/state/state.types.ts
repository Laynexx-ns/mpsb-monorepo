import type { GramioBot } from "../bot.factory";
import type { GramioMessageContext } from "../types/bot.types";
import type { FlowName, StepName } from "./flows/flow.types";

export interface StepContext {
	ctx: GramioMessageContext;
	bot: GramioBot;
	state: AppState;
}

export type StepHandler<F extends FlowName> = (
	c: StepContext
) => Promise<StepName<F> | null>;

export interface AppState<F extends FlowName = FlowName> {
	currentFlow: F;
	step: StepName<F>;
	data: Record<string, any>;
}
