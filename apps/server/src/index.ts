import { wrap } from "@bogeychan/elysia-logger";
import { LoggerFactory, loggerConfigs } from "@mpsb-monorepo/logger";
import { Elysia, t } from "elysia";
import * as jwt from "@mpsb-monorepo/jwt-types";
import * as yAPI from "@mpsb-monorepo/yandex-api";

import cors from "@elysiajs/cors";

const LISTEN_PORT = 3000;

const logger = LoggerFactory.instance()
  .initialize(loggerConfigs.development)
  .child({});
const elysiaLogger = wrap(logger);

const auth = new Elysia().use(elysiaLogger).derive(
  {
    as: "global",
  },
  ({ headers, status }) => {
    const authHeader = headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return status(401, "Missing token");
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token);
      return {
        jwtpayload: payload,
      };
    } catch (e) {
      return status(401);
    }
  },
);

const app = new Elysia()
  .use(
    cors({
      origin: ["localhost:5173"],
    }),
  )
  .use(elysiaLogger)

  // temporary function for testing jwt exchanging
  .get("/token", ({ status, log }) => {
    try {
      const newToken = jwt.generate({
        groupTitle: "Test group",
        homeworkName: "Test homework name",
        userName: "Test user name",
        iat: 12341234,
      });

      return {
        token: newToken,
      };
    } catch (e) {
      log.error({ err: e }, "failed to generate token");
      return status(500, "failed to generate token");
    }
  })
  .use(auth)

  .get("/ping", () => "Meow");

app.get("/verify", ({ jwtpayload, status, log }) => {
  console.error("WTF");
  log.info({ jwtpayload }, "user verified");
  status(200, "OK");
  return {
    jwtpayload,
  };
});

app.post(
  "/homework",
  async ({ jwtpayload, body, status, log }) => {
    const file = body.file;

    if (!file) {
      return status(400, "File is missing");
    }

    log.info(
      {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      "received file",
    );

    try {
      await yAPI.uploadHomeworkToDisk({
        file,
        groupTitle: jwtpayload.groupTitle,
        userName: jwtpayload.userName,
        homeworkName: jwtpayload.homeworkName,
      });
    } catch (e) {
      log.error({ err: e }, "failed to upload homework");
      return status(523, "Yandex origin is unreachable");
    }

    return status(200, "OK");
  },
  {
    body: t.Object({
      file: t.File(),
    }),
  },
);

app.listen({
  port: LISTEN_PORT,
  hostname: "0.0.0.0",
});

logger.info(`Server started on port: ${LISTEN_PORT}`);
