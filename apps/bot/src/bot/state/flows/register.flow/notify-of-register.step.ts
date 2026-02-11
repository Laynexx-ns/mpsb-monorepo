import { registerStep } from "../../flow-registry";

export const registerNotifyOfRegister = () => {
	registerStep("registration", "notifyOfRegister", async ({ ctx, state }) => {
		await ctx.send(
			"Сперва необходимо зарегистрироваться, введите свое имя в формате Ф И О",
			{
				reply_markup: { remove_keyboard: true },
			}
		);

		return "enterName";
	});
};
