import type { GramioBot } from "@/bot/bot.factory";
import { getRelativeKeyboard } from "@/bot/helpers/get-relative-kbd";
import type { AppState } from "@/bot/state/state.types";
import type { CreateHomeworkDto } from "@/dto/homework.dto";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { UserRepository } from "@/repository/user.repository";
import { formatFullState } from "@/utils/log-formatter";
import type { MessageHandlerProps } from "./messages-handlers.types";

export interface HandleCreateHomeworkDoneProps extends MessageHandlerProps {
	state: AppState;
	homeworkRepo: HomeworkRepository;
	userRepo: UserRepository;
	bot: GramioBot;
}

export const handleCreateHomeworkDone = async (
	props: HandleCreateHomeworkDoneProps
) => {
	const studyGroupId = Number.parseInt(props.state.data.studyGroupId);

	const dto: CreateHomeworkDto = {
		deadline: props.state.data.homeworkDeadline,
		name: props.state.data.homeworkName,
		studyGroupId,
	};

	try {
		await props.homeworkRepo.CreateHomework(dto);
	} catch (err) {
		props.bot.logger.error({ err }, "failed creating homework");
	}

	props.bot.logger.info(
		{ dto, state: formatFullState(props.ctx, props.state) },
		"homework succesfully created"
	);

	const kbd = getRelativeKeyboard(props.ctx.access.role);

	// TODO: add to i18n
	props.ctx.send(`Домашка ${dto.name} создана успешно!`, {
		reply_markup: kbd,
	});

	const receivers = await props.userRepo.GetStudyGroupUserIds(studyGroupId);

	try {
		await props.bot.notify(receivers, `Новая домашка ${dto.name}`);
	} catch (e) {
		props.bot.logger.error(
			{ err: e },
			"failed to notify users about new homework"
		);
	}
};
