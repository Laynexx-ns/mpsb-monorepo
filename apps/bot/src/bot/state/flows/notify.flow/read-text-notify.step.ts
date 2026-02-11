import { KEYBOARD_ANSWERS } from "@/bot/keyboards";
import { registerStep } from "../../flow-registry";

export const registerNotifyStudentsEnterText = () => {
	registerStep(
		"notifyStudents",
		"notifyStudents_enterText",
		async ({ ctx, state }) => {
			const t = ctx.text;

			if (t == KEYBOARD_ANSWERS.cancel) {
				return "cancel";
			}
			state.data.notifyStudentsText = t;

			return "notifyStudents_done";
		}
	);
};
