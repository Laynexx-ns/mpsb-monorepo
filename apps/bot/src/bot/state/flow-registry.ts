import type { FlowName, StepName } from "./flows/flow.types";
import type { StepHandler } from "./state.types";

const stepRegistry: Record<string, Record<string, StepHandler<any>>> = {};

export function registerStep<F extends FlowName>(
	flow: F,
	step: StepName<F>,
	handler: StepHandler<F>
): void {
	if (!stepRegistry[flow]) stepRegistry[flow] = {};
	stepRegistry[flow][step] = handler;
}

export function getStepHandler<F extends FlowName>(
	flow: F,
	step: StepName<F>
): StepHandler<F> | null {
	return (stepRegistry[flow]?.[step] as StepHandler<F>) || null;
}
