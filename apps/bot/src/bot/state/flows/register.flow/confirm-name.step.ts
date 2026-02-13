import { registerStep } from "../../flow-registry";

export const registerConfirmName = () => {
	registerStep("registration", "confirmName", async ({ ctx, state }) => {
		const t = ctx.text;

		if (t === "✏️ Изменить") {
			await ctx.send("Введите имя заново:", {
				reply_markup: { remove_keyboard: true },
			});
			return "enterName";
		}

		if (t !== "✅ Принять") {
			await ctx.send("Используйте кнопки: ");
			return null;
		}

		await ctx.send("Введите вашу почту: ", {
			reply_markup: { remove_keyboard: true },
		});
		return "enterEmail";
	});
};
