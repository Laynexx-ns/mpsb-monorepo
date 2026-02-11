import { getRelativeKeyboard } from "@/bot/helpers/get-relative-kbd";
import { pl } from "@/bot/helpers/parse-locale";
import { registerStep } from "../../flow-registry";

export const registerReadClassNumber = () => {
	registerStep("registration", "getClassNumber", async ({ ctx, state }) => {
		if (ctx.text === "Репетиторство") {
			state.data.studyGroup = { title: "Репетиторство" };
			await ctx.send("Ждем принятия заявки", {
				reply_markup: ctx.access.keyboard,
			});
			return "registration_done";
		}

		if (!ctx.text) {
			await ctx.send(ctx.t(pl(ctx), "textCantBeEmpty"));
			return "getClassNumber";
		}

		const parsed = Number.parseInt(ctx.text);
		if (Number.isNaN(parsed)) {
			await ctx.send(ctx.t(pl(ctx), "incorrectClassNumberFormat"));
			return "getClassNumber";
		}
		if (parsed < 1 || parsed > 11) {
			await ctx.send(ctx.t(pl(ctx), "incorrectClassNumberValue"));
			return "getClassNumber";
		}

		state.data.classNumber = parsed;
		await ctx.send(ctx.t(pl(ctx), "enterClassLetter"));
		return "getClassLetter";
	});
};

export const registerReadClassLetter = () => {
	registerStep("registration", "getClassLetter", async ({ ctx, state }) => {
		if (!ctx.text) {
			await ctx.send(ctx.t(pl(ctx), "textCantBeEmpty"));
			return "getClassLetter";
		}

		if (ctx.text.toUpperCase() == "МАТОЛ") {
		} else if (ctx.text.length > 1 || !isNaN(Number.parseInt(ctx.text))) {
			await ctx.send(ctx.t(pl(ctx), "wrongClassLetterFormat"));
			return "getClassLetter";
		}

		state.data.classLetter = ctx.text.trim().toUpperCase();

		state.data.studyGroup = {
			grade: state.data.classNumber,
			letter: state.data.classLetter,
			title: `${state.data.classNumber}${state.data.classLetter}`,
		};

		await ctx.send(
			"Регистрация завершена!\nПожалуйста ожидайте принятия заявки или отправьте новую",
			{
				reply_markup: getRelativeKeyboard(ctx.access.role),
			}
		);
		return "registration_done";
	});
};
