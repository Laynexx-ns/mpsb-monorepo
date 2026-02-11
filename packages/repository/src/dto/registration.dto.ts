export interface CreateUserDTO {
	id: bigint;
	username: string | undefined;
	firstName: string;
	lastName: string;
	patronymic: string;
	yandex_email: string;
}
