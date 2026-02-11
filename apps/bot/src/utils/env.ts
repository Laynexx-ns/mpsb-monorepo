type StringKeyOf<T> = Extract<keyof T, string>;

// overloads
export function processEnv<T extends Record<string, unknown>>(props: {
	env?: string;
	struct: T;
}): T[StringKeyOf<T>] | undefined;

export function processEnv<
	T extends Record<string, unknown>,
	K extends StringKeyOf<T>,
>(props: { env?: string; struct: T; default: K }): T[K] | T[StringKeyOf<T>];

// implementation
export function processEnv<T extends Record<string, unknown>>(props: {
	env?: string;
	struct: T;
	default?: StringKeyOf<T>;
}): T[StringKeyOf<T>] | undefined {
	const { env, struct, default: def } = props;

	if (env && env in struct) {
		return struct[env as StringKeyOf<T>];
	}

	if (def !== undefined) {
		return struct[def];
	}

	return undefined;
}
