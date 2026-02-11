import { InlineKeyboard } from "gramio";
import { pl } from "@/bot/helpers/parse-locale";
import { extractItemFromQuery } from "@/bot/render/paginator";
import { RENDER_CALLBACKS } from "@/bot/render/render.types";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";
import { CallbackQueryGroupHomeworks } from "./group-homeworks.callback";

export interface CallbackQueryDeleteHomeworkProps extends CallbackQueryProps {
	homeworkRepository: HomeworkRepository;
	userRepository: UserRepository;
}

/**
 * Confirm and execute deletion of a homework, notify the study group, and update the chat message with the result.
 *
 * @param props - Handler properties containing the callback context, bot, and repositories used to validate, delete the homework, and notify users
 */
export async function CallbackQueryConfirmDeleteHomework(
	props: CallbackQueryDeleteHomeworkProps
) {
	const homeworkIdStr = extractItemFromQuery(props.ctx, 1);
	const homeworkId = Number(homeworkIdStr);

	if (!homeworkIdStr || Number.isNaN(homeworkId)) {
		await props.ctx.send("Ошибка удаления");
		return;
	}

	const homework = await props.homeworkRepository.GetHomework(homeworkId);
	if (!homework) {
		await props.ctx.editText(
			"❌ Домашняя работа уже удалена или произошла ошибка"
		);
		return;
	}

	try {
		const ids = await props.userRepository.GetStudyGroupUserIds(
			homework.studyGroupId
		);
		await props.homeworkRepository.DeleteHomework(homeworkId);
		await props.bot.notify(
			ids,
			`🗑️ Преподаватель удалил работу ${homework.name}`
		);

		await props.ctx.editText("✅ Домашняя работа успешно удалена");
	} catch (e) {
		props.bot.logger.error(e);
		await props.ctx.editText(
			"❌ Домашняя работа уже удалена или произошла ошибка"
		);
	}
}

/**
 * Presents a confirmation prompt to delete a specific homework and attaches an inline keyboard with "Delete" and "Cancel" actions.
 *
 * If the provided homework identifier is invalid, sends a translated generic error message. If the homework does not exist, notifies the user that the homework was not found.
 *
 * @param props - Callback context and dependencies; includes `ctx` for messaging and UI updates and `homeworkRepository` for fetching the homework to confirm deletion.
 */
export async function CallbackQueryDeleteHomework(
	props: CallbackQueryDeleteHomeworkProps
) {
	const homeworkIdStr = extractItemFromQuery(props.ctx, 1);
	const homeworkId = Number(homeworkIdStr);

	if (!homeworkIdStr || Number.isNaN(homeworkId)) {
		await props.ctx.send(props.ctx.t(pl(props.ctx), "smthWentWrong"));
		return;
	}

	const hw = await props.homeworkRepository.GetHomework(homeworkId);
	if (!hw) {
		await props.ctx.send("Домашняя работа не найдена");
		return;
	}

	const kbd = new InlineKeyboard()
		.add({
			text: "✅ Удалить",
			callback_data:
				RENDER_CALLBACKS.management.confirmDeleteHomework.call(homeworkId),
		})
		.add({
			text: "❌ Отмена",
			callback_data:
				RENDER_CALLBACKS.management.cancelDeleteHomework.call(homeworkId),
		});

	await props.ctx.editText(
		`⚠️ Вы уверены, что хотите удалить домашнюю работу:\n\n*${hw.name}*`,
		{
			reply_markup: kbd,
			parse_mode: "Markdown",
		}
	);
}

/**
 * Cancel the delete operation and display the group's homeworks view using the provided repositories.
 *
 * @param props - Callback query properties; `homeworkRepository` from `props` will be used to render the group homeworks view
 */
export async function CallbackQueryCancelDeleteHomework(
	props: CallbackQueryDeleteHomeworkProps
) {
	await CallbackQueryGroupHomeworks({
		...props,
		homeworkRepo: props.homeworkRepository,
	});
}
