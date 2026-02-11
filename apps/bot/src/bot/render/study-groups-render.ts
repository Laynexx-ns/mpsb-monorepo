import type { StudyGroup } from "@/prisma/client";
import { GetPagesControl } from "./paginator";
import { RENDER_CALLBACKS } from "./render.types";

interface renderRequestPageProps {
	groups: StudyGroup[];
	page: number;
	pageSize?: number;
}

/**
 * Render a paginated inline keyboard for selecting study groups.
 *
 * @param props - Rendering options:
 *   - groups: array of StudyGroup items to display
 *   - page: zero-based page index to render (will be clamped to valid range)
 *   - pageSize: optional number of groups per page (defaults to 5)
 * @returns An object with:
 *   - `text`: prompt shown above the keyboard
 *   - `reply_markup`: Telegram-style inline keyboard containing one button per group on the page and pagination controls
 */
export function renderStudyGroupsPage(props: renderRequestPageProps): {
	text: string;
	reply_markup: any;
} {
	// TODO: make as slice func in render.types.ts class
	const pageSize = props.pageSize ? props.pageSize : 5;
	const totalPages = Math.max(1, Math.ceil(props.groups.length / pageSize));
	const safePage = Math.min(props.page, totalPages - 1);

	const start = safePage * pageSize;
	const end = start + pageSize;

	const slice = props.groups.slice(start, end);

	const text = "👥 Выберите группу";
	const pageText = `📄 ${safePage + 1}/${totalPages}`;

	const kbd: any = { inline_keyboard: [] };

	for (const u of slice) {
		const label = u.title;
		kbd.inline_keyboard.push([
			{
				text: `👥 ${label}`,
				callback_data: RENDER_CALLBACKS.studyGroupsRender.openGroup.call(
					safePage,
					u.id
				),
			},
		]);
	}
	kbd.inline_keyboard.push(
		GetPagesControl({
			callbackName: RENDER_CALLBACKS.studyGroupsRender.updatePage.name,
			pageText,
			safePage,
			totalPages,
		})
	);

	return { text, reply_markup: kbd };
}
