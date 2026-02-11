import { KEYBOARD_ANSWERS } from "@/bot/keyboards";
import { parseDeadline } from "@/utils/date-parser";
import { registerStep } from "../../flow-registry";

export const registerEnterHomeworkDeadlineStep = () => {
	registerStep(
		"createHomework",
		"enterDeadline",
		async ({ ctx, bot, state }) => {
			const t = ctx.text!.trim();

			if (t === KEYBOARD_ANSWERS.cancel) {
				return "cancel";
			}

			if (t === "Дедлайна нет") {
				state.data.homeworkDeadline = null;
			} else {
				const parsed = parseDeadline(t);

				if (!parsed) {
					await ctx.send(
						"❌ Неправильный формат дедлайна.\nПример: *15.08.2008 15:30*\nРазрешённые форматы:\n- DD.MM.YYYY\n- DD.MM.YYYY HH:mm"
					);
					return "enterDeadline";
				}

				state.data.homeworkDeadline = parsed.toISOString();
			}

			await ctx.send("Создаем домашку...", {
				reply_markup: { remove_keyboard: true },
			});

			return "createHomework_done";
		}
	);
};
