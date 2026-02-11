import { registerConfirmEmail } from "./confirm-email.step";
import { registerConfirmName } from "./confirm-name.step";
import { registerEnterEmail } from "./enter-email.step";
import { registerEnterName } from "./enter-name.step";
import {
	registerReadClassLetter,
	registerReadClassNumber,
} from "./get-class.step";
import { registerNotifyOfRegister } from "./notify-of-register.step";

export const setupRegisterFlow = (): void => {
	registerNotifyOfRegister();
	registerConfirmEmail();
	registerConfirmName();
	registerEnterEmail();
	registerEnterName();
	registerReadClassLetter();
	registerReadClassNumber();
};
