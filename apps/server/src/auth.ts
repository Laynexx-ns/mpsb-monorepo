import * as jwt from "@mpsb-monorepo/jwt-types";
import Elysia from "elysia";
import type { ElysiaLogger } from ".";

export const AuthMiddleware = (elysiaLogger: ElysiaLogger) => {
	return new Elysia().use(elysiaLogger).derive(
		{
			as: "global",
		},
		({ headers, status, log }) => {
			const authHeader = headers.authorization;

			if (!(authHeader && authHeader.startsWith("Bearer "))) {
				return status(401, "Missing token");
			}

			const token = authHeader.slice(7);

			try {
				const payload = jwt.verify(token);
				return {
					jwtpayload: payload,
				};
			} catch (e) {
				log.warn({ err: e }, "unauthorized");
				return status(401);
			}
		}
	);
};
