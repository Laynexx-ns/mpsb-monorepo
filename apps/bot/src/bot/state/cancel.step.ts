import { registerStep } from "./flow-registry";

export const registerCancelStep = () => {
	registerStep("cancel", "cancel", async ({ ctx, state }) => {
		await ctx.send("Отменено.", {
			reply_markup: ctx.access.keyboard,
		});
		(state.currentFlow = "idle"), (state.step = "idle"), (state.data = {});
		return "idle";
	});
};
