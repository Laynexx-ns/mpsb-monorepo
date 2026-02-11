import { KEYBOARD_ANSWERS } from "@/bot/keyboards";
import { registerStep } from "../../flow-registry";

export const registerNotifyStudentsInit = () => {
	registerStep(
		"notifyStudents",
		"notifyStudents_init",
		async ({ ctx, state }) => {
			await ctx.send("Введите текст, который вы хотите отправить студентам", {
				reply_markup: {
					keyboard: [[{ text: KEYBOARD_ANSWERS.cancel }]],
					resize_keyboard: true,
				},
			});

			return "notifyStudents_enterText";
		}
	);
};
