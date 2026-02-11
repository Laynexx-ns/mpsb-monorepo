import type { Keyboard } from "gramio";
import type { Role } from "@/prisma/enums";
import { buildKeyboard, KEYBOARD_LAYOUTS } from "../keyboards";

/**
 * Selects the keyboard layout for the given role and returns a built Keyboard.
 *
 * @param role - Role that determines which layout to use: `"GUEST"` → guest layout, `"ADMIN"` → teacher layout, `"USER"` → student layout
 * @returns A `Keyboard` constructed from the layout associated with `role`
 */
export function getRelativeKeyboard(role: Role): Keyboard {
	let kbd;
	switch (role) {
		case "GUEST":
			kbd = KEYBOARD_LAYOUTS.guest;
			break;
		case "ADMIN":
			kbd = KEYBOARD_LAYOUTS.teacher;
			break;
		case "USER":
			kbd = KEYBOARD_LAYOUTS.student;
			break;
	}

	return buildKeyboard(kbd);
}
