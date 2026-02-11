import { readHomeworkStep } from "./read-homework-file.step";
import { sendHomeworkStep } from "./send-homework.step";

export const SetupSendHomeworkSteps = {
	sendHomework: "sendHomework",
	chooseHomework: "chooseHomework",
	readHomework: "readHomework",
	done: "sendHomework_done",
} as const;

export type SetupSendHomeworkFlowStep =
	(typeof SetupSendHomeworkSteps)[keyof typeof SetupSendHomeworkSteps];

export const setupSendHomeworkFlow = () => {
	sendHomeworkStep();
	readHomeworkStep();
};
