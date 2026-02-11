import type { AppState } from "../state/state.types";

export const resetState = (state: AppState) => {
	state.currentFlow = "idle";
	state.step = "idle";
	state.data = {};
};
