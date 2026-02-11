import { registerNotifyStudentsEnterText } from "./read-text-notify.step";
import { registerNotifyStudentsInit } from "./send-text-notify.step";

export const SetupNotifyStudentsFlow = () => {
	registerNotifyStudentsInit();
	registerNotifyStudentsEnterText();
};
