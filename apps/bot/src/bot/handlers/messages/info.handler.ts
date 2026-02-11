import type { MessageHandlerProps } from "./messages-handlers.types";

const INFO_MESSAGE =
	"Привет! \n\nЭто ваш бот для отправки домашних заданий. Чтобы отправить домашнее задание нажмите на кнопку домашки и выберите ту, которую хотите отправить. Если вы хотите изменить ответ, точно так же нажмите на выбранную вами домашку и отправьте в формате PDF \n\nПо всем багам/вопросам/пожеланиям обращаться к @laynexx. Адекватный перевод сделаю позже. \n\nЕсли существуют люди, которым интересно контрибьютить в бота, он опенсорс: https://github.com/Laynexx-ns/math-pdf-saver-bot";

/**
 * Sends the predefined informational message to the current message context.
 *
 * @param props - Handler properties containing `ctx` used to deliver the message
 */
export async function handleinfo(props: MessageHandlerProps) {
	await props.ctx.send(INFO_MESSAGE);
}
