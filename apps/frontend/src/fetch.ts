export function ensureError(v: unknown): Error {
	if (v instanceof Error) return v;

	let stringified = "[Unable to stringify the thrown value]";
	try {
		stringified = JSON.stringify(v);
	} catch {}

	const error = new Error(`This value wasn't thrown as Error: ${stringified}`);
	return error;
}

export async function SaveFetch<T>(promise: Promise<T>): Promise<
	| {
			err: undefined;
			result: T;
	  }
	| { err: Error; result: undefined }
> {
	return promise
		.then((res) => {
			return { err: undefined, result: res };
		})
		.catch((e) => {
			const err = ensureError(e);
			return { err, result: undefined };
		});
}
