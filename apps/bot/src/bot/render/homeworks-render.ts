import dateFormat from "dateformat";
import type { UserHomeworkDTO } from "@/dto/homework.dto";
import { GetPagesControl } from "./paginator";
import { RENDER_CALLBACKS } from "./render.types";

/**
 * Builds a paginated Telegram inline keyboard listing homeworks with completion status and formatted deadlines.
 *
 * Each visible homework is rendered as a single inline button that triggers an "open homework" callback for that item.
 *
 * @param homeworks - Array of user homeworks to display; the array will be reversed before pagination.
 * @param page - Zero-based page index to display (clamped to available pages).
 * @param pageSize - Number of items per page (default: 5).
 * @returns An object with `text` (header) and `reply_markup` containing the assembled `inline_keyboard` and pagination controls.
 */
export function renderHomeworksPage(
	homeworks: UserHomeworkDTO[],
	page: number,
	pageSize = 5
) {
	const totalPages = Math.max(1, Math.ceil(homeworks.length / pageSize));
	const safePage = Math.min(page, totalPages - 1);

	homeworks.reverse();
	const start = safePage * pageSize;
	const end = start + pageSize;
	const slice = homeworks.slice(start, end);

	// TODO: add 18n
	const text = "📚 Домашние задания | Нажмите на дз чтобы отправить";
	const pageText = `📄 ${safePage + 1}/${totalPages}`;

	const keyboard: any = { inline_keyboard: [] };

	for (const hw of slice) {
		const label = `${hw.name}${hw.completed ? " | ✅" : ""}${
			hw.deadline ? " | " + dateFormat(hw.deadline, "yyyy-mm-dd HH:MM") : ""
		}`;

		keyboard.inline_keyboard.push([
			{
				text: `${hw.deleted ? "🗑️" : ""} ${label}`,
				callback_data: RENDER_CALLBACKS.homeworksRender.openHomework.call(
					hw.id,
					safePage
				),
			},
		]);
	}

	keyboard.inline_keyboard.push(
		GetPagesControl({
			callbackName: RENDER_CALLBACKS.homeworksRender.updatePage.name,
			pageText,
			safePage,
			totalPages,
		})
	);

	return { text, reply_markup: keyboard };
}
