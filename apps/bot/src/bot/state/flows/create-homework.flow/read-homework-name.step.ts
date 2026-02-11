import { KEYBOARD_ANSWERS } from "@/bot/keyboards";
import { registerStep } from "../../flow-registry";

export const registerReadHomeworkNameStep = () => {
	registerStep("createHomework", "readName", async ({ ctx, state }) => {
		const t = ctx.text;

		if (t == KEYBOARD_ANSWERS.cancel) {
			return "cancel";
		}
		let exists = false;

		for (const i of state.data.homeworks) {
			if (i.name == t && state.data.studyGroupId == i.studyGroupId) {
				exists = true;
				await ctx.send(
					"Такая домашка уже существует. Выберите другое название"
				);
				break;
			}
		}

		if (exists) {
			return "readName";
		}

		state.data.homeworkName = t;
		state.step = "enterDeadline";
		await ctx.send(
			`Введите дедлайн для домашки ${t} \n Пример 15.08.2008 15:30`,
			{
				reply_markup: {
					keyboard: [
						[{ text: "Дедлайна нет" }, { text: KEYBOARD_ANSWERS.cancel }],
					],
					resize_keyboard: true,
				},
			}
		);

		return "enterDeadline";
	});
};
