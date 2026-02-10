import jwt from "jsonwebtoken";
import { env } from "@mpsb-monorepo/env/server";
import { z } from "zod";

// type for reference
// @ts-ignore
type Payload = {
  userName: string;
  homeworkName: string;
  groupTitle: string;
  iat: number | undefined;
};

export const JWTPayloadSchema = z.object({
  userName: z.string(),
  homeworkName: z.string(),
  groupTitle: z.string(),
  iat: z.number().nullable(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

const SECRET = env.JWT_SECRET;
const ALGORITHMS: jwt.Algorithm[] = ["HS256"];

export function verify(token: string): JWTPayload {
  const payload = jwt.verify(token, SECRET, {
    algorithms: ALGORITHMS,
  });

  if (typeof payload === "string") {
    throw new Error("invalid token payload format");
  }

  const parsed = JWTPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("invalid token payload format");
  }

  return parsed.data;
}

export function generate(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, {
    algorithm: ALGORITHMS[0],
  });
}
