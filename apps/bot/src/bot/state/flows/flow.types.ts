export const FLOW_STEPS = {
	idle: ["idle"],
	registration: [
		"notifyOfRegister",
		"enterName",
		"confirmName",
		"enterEmail",
		"confirmEmail",
		"getClassNumber",
		"getClassLetter",
		"registration_done",
		"cancel",
	],
	notifyStudents: [
		"notifyStudents_init",
		"notifyStudents_enterText",
		"notifyStudents_done",
		"cancel",
	],
	createHomework: [
		"enterName",
		"readName",
		"confirmName",
		"enterDeadline",
		"confirmDeadline",
		"createHomework_done",
		"cancel",
	],
	sendHomework: ["sendHomework", "readHomework", "sendHomework_done", "cancel"],
	cancel: ["cancel", "idle"],
	completed: "completed",
} as const;

export type FlowName = keyof typeof FLOW_STEPS;

export type StepName<F extends FlowName> = (typeof FLOW_STEPS)[F][number];
