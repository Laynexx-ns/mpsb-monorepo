import type { User } from "@/prisma/client";
import { GetPagesControl } from "./paginator";
import { RENDER_CALLBACKS } from "./render.types";

interface renderRequestPageProps {
	users: User[];
	page: number;
	pageSize?: number;
}

/**
 * Render a paginated Telegram inline keyboard listing user requests.
 *
 * @param props - Rendering options: `users` is the array of users to paginate; `page` is the zero-based page index to display; `pageSize` overrides number of users per page (defaults to 5).
 * @returns An object with `text` (caption shown above the keyboard) and `reply_markup` (Telegram inline keyboard containing one button per user on the page and pagination controls)
 */
export function renderRequestsPage(props: renderRequestPageProps): {
	text: string;
	reply_markup: any;
} {
	const pageSize = props.pageSize ? props.pageSize : 5;
	const totalPages = Math.max(1, Math.ceil(props.users.length / pageSize));
	const safePage = Math.min(props.page, totalPages - 1);

	const start = safePage * pageSize;
	const end = start + pageSize;

	const slice = props.users.slice(start, end);

	const text = "✉️ Запросы: | Нажмите на запрос, чтобы принять или отклонить";
	const pageText = `📄 ${safePage + 1}/${totalPages}`;

	const kbd: any = { inline_keyboard: [] };

	for (const u of slice) {
		const label = `${u.name + " " + u.last_name} | ${u.username}`;

		kbd.inline_keyboard.push([
			{
				text: label,
				callback_data: RENDER_CALLBACKS.requestsRender.openRequest.call(
					safePage,
					u.id
				),
			},
		]);
	}
	kbd.inline_keyboard.push(
		GetPagesControl({
			callbackName: RENDER_CALLBACKS.requestsRender.updatePage.name,
			pageText,
			safePage,
			totalPages,
		})
	);

	return { text, reply_markup: kbd };
}
