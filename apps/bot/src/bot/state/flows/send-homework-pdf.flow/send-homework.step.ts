import { KEYBOARD_ANSWERS } from "@/bot/keyboards";
import { registerStep } from "../../flow-registry";

export const sendHomeworkStep = () => {
	registerStep("sendHomework", "sendHomework", async ({ ctx, state }) => {
		await ctx.send("Отправьте домашку в PDF файле", {
			reply_markup: {
				keyboard: [[{ text: KEYBOARD_ANSWERS.cancel }]],
				resize_keyboard: true,
			},
		});

		return "readHomework";
	});
};
