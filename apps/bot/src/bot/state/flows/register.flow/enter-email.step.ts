import { registerStep } from "../../flow-registry";

export const registerEnterEmail = () => {
	registerStep("registration", "enterEmail", async ({ ctx, state }) => {
		state.data.email = ctx.text.trim();

		if (!state.data.email.includes("@")) {
			await ctx.send("Почта должна содержать символ '@'");
			return null;
		}

		await ctx.send(`Подтвердите почту: ${state.data.email}`, {
			reply_markup: {
				keyboard: [[{ text: "✅ Принять" }, { text: "✏️ Изменить" }]],
				resize_keyboard: true,
			},
		});

		return "confirmEmail";
	});
};
