import { wrap } from "@bogeychan/elysia-logger";
import { LoggerFactory, loggerConfigs } from "@mpsb-monorepo/logger";
import { Elysia, t } from "elysia";
import jwt from "jsonwebtoken";

const LISTEN_PORT = 3000;

const logger = LoggerFactory.instance()
	.initialize(loggerConfigs.production)
	.child({});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	logger.error("jwt secret is empty");
	process.exit(1);
}

const app = new Elysia()
	.use(
		wrap(logger, {
			autoLogging: true,
		})
	)
	.get("/ping", () => "Meow");

app.post(
	"/upload",
	({ query, status, log }) => {
		const token = query.token;

		if (!token) {
			return status(400, "token is required");
		}

		const payload = jwt.verify(token, JWT_SECRET);
		log.info({ jwt_payload: payload }, "jwt payload");
	},
	{
		query: t.Object({
			token: t.String(),
		}),
	}
);

app.listen({
	port: LISTEN_PORT,
	hostname: "0.0.0.0",
});

logger.info(`Server started on port: ${LISTEN_PORT}`);
