import { Keyboard } from "gramio";
import { pl } from "@/bot/helpers/parse-locale";
import { registerStep } from "../../flow-registry";

export const registerConfirmEmail = () => {
	registerStep("registration", "confirmEmail", async ({ ctx, state }) => {
		const t = ctx.text as string;

		if (t === "✏️ Изменить") {
			await ctx.send("Введите почту заново", {
				reply_markup: {
					remove_keyboard: true,
				},
			});
			return "enterEmail";
		}

		if (t !== "✅ Принять") {
			await ctx.send("Используйте кнопки");
			return "confirmEmail";
		}

		const kbd = new Keyboard().add({ text: "Репетиторство" });
		await ctx.send(ctx.t(pl(ctx), "enterClassNumber"), {
			reply_markup: kbd,
		});

		return "getClassNumber";
	});
};
