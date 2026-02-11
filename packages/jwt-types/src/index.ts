import { env } from "@mpsb-monorepo/env/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

// type for reference
// @ts-expect-error
type Payload = {
	userName: string;
	homeworkName: string;
	groupTitle: string;
	iat: number | undefined;
	exp: number;
	userId: bigint;
};

export const JWTPayloadSchema = z.object({
	userName: z.string(),
	homeworkName: z.string(),
	homeworkId: z.number(),
	groupTitle: z.string(),
	iat: z.number().nullable(),
	exp: z.number().nullable(),
	userId: z.bigint().or(z.string()),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

const SECRET = env.JWT_SECRET;
const ALGORITHMS: jwt.Algorithm[] = ["HS256"];

export function verify(token: string): JWTPayload {
	const payload = jwt.verify(token, SECRET, {
		algorithms: ALGORITHMS,
	});

	if (typeof payload === "string")
		throw new Error("invalid token payload format");

	const parsed = JWTPayloadSchema.safeParse(payload);
	if (!parsed.success) throw new Error("invalid token payload format");

	const data = parsed.data;

	const now = Math.floor(Date.now() / 1000);
	if (data.exp && data.exp <= now) throw new Error("token expired");

	return data;
}

export function generate(payload: JWTPayload): string {
	return jwt.sign(payload, SECRET, {
		algorithm: ALGORITHMS[0],
	});
}
