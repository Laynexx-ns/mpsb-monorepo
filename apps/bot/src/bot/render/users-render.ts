import type { User } from "@/prisma/client";
import { GetPagesControl } from "./paginator";
import { RENDER_CALLBACKS } from "./render.types";

interface renderUsersPageProps {
	users: User[];
	page: number;
	pageSize?: number;
}

/**
 * Builds message text and an inline keyboard for a paginated list of users.
 *
 * @param props - Render options:
 *   - users: array of users to display
 *   - page: zero-based current page index
 *   - pageSize: optional number of users per page (defaults to 5)
 * @returns An object with `text` (message header) and `reply_markup` (a Telegram-style `inline_keyboard` whose rows link to each user's Telegram profile and include pagination controls)
 */
export function renderUsersPage(props: renderUsersPageProps): {
	text: string;
	reply_markup: any;
} {
	const pageSize = props.pageSize ? props.pageSize : 5;
	const totalPages = Math.max(1, Math.ceil(props.users.length / pageSize));
	const safePage = Math.min(props.page, totalPages - 1);

	const start = safePage * pageSize;
	const end = start + pageSize;

	const slice = props.users.slice(start, end);

	const text = "👥 Студенты | Нажмите на пользователя чтобы перейти в лс";
	const pageText = `📄 ${safePage + 1}/${totalPages}`;

	const kbd: any = { inline_keyboard: [] };

	for (const u of slice) {
		const label = `${u.name + " " + u.last_name} | ${u.username}`;

		kbd.inline_keyboard.push([
			{
				text: label,
				url: `https://t.me/${u.username}`,
			},
		]);
	}
	kbd.inline_keyboard.push(
		GetPagesControl({
			totalPages,
			safePage,
			pageText,
			callbackName: RENDER_CALLBACKS.usersRender.updatePage,
		})
	);

	return { text, reply_markup: kbd };
}
