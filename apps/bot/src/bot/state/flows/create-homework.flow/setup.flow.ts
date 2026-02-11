import { registerEnterHomeworkDeadlineStep } from "./enter-homework-deadline.step";
import { registerEnterHomeworkNameStep } from "./enter-homework-name.step";
import { registerReadHomeworkNameStep } from "./read-homework-name.step";

export type CreateHomeworkFlowStep =
	| "readName"
	| "enterName"
	| "enterDeadline"
	| "createHomework_done";

export const setupCreateHomeworkFlow = (): void => {
	registerEnterHomeworkDeadlineStep();
	registerReadHomeworkNameStep();
	registerEnterHomeworkNameStep();
};
