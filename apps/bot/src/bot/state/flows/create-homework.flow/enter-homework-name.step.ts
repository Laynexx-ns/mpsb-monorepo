import { KEYBOARD_ANSWERS } from "@/bot/keyboards";
import { registerStep } from "../../flow-registry";

export const registerEnterHomeworkNameStep = () => {
	registerStep("createHomework", "enterName", async ({ ctx, state }) => {
		await ctx.send("Введите название домашки", {
			reply_markup: {
				keyboard: [[{ text: KEYBOARD_ANSWERS.cancel }]],
				resize_keyboard: true,
			},
		});
		return "readName";
	});
};
