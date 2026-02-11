import { pl } from "@/bot/helpers/parse-locale";
import { registerStep } from "@/bot/state/flow-registry";

export const registerEnterName = () => {
	registerStep("registration", "enterName", async ({ ctx, bot, state }) => {
		if (!ctx.text) {
			await ctx.send(ctx.t(pl(ctx), "textCantBeEmpty"));
			return "confirmName";
		}

		const text = ctx.text;

		const parts = text
			.trim()
			.split(" ")
			.filter((i) => i !== "")
			.map((part) => part.trim());

		if (parts.length !== 3) {
			await ctx.send("Неправильный формат. Пример: Иванов Иван Иванович");
			return null;
		}

		state.data.name = text;

		await ctx.send(`Подтвердите имя ${parts.join(" ")}`, {
			reply_markup: {
				keyboard: [[{ text: "✅ Принять" }, { text: "✏️ Изменить" }]],
				resize_keyboard: true,
			},
		});

		return "confirmName";
	});
};
