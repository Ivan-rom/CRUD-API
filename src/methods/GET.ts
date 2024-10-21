import { IncomingMessage, ServerResponse } from "node:http";
import { defaultNotFound, getUsersData } from "../utils";
import { validate } from "uuid";
import { User } from "../types";
import { parse } from "node:path";

export function GET(res: ServerResponse<IncomingMessage>, url?: string) {
  const { dir, base } = parse(url as string);

  if (dir !== "/api" && dir !== "/api/users") return defaultNotFound(res, url);
  if (dir === "/api" && base !== "users") return defaultNotFound(res, url);

  if (dir === "/api") {
    getUsersData()
      .then((users) => {
        res.write(JSON.stringify(users, null, 2));
        res.setHeader("Content-Type", "application/json");
      })
      .catch((error) => {
        res.statusCode = 500;
        res.statusMessage = error;
      })
      .finally(() => res.end());
  } else {
    if (!validate(base)) {
      res.statusCode = 400;
      res.statusMessage = "Invalid user Id";
      res.end();
      return;
    }

    getUsersData()
      .then((users) => {
        const user = (users as User[]).find((el) => el.id === base);

        if (user) {
          res.write(JSON.stringify(user, null, 2));
          res.setHeader("Content-Type", "application/json");
        } else {
          res.statusCode = 404;
          res.statusMessage = "User does not exist";
        }
      })
      .catch((error) => {
        res.statusCode = 500;
        res.statusMessage = error;
      })
      .finally(() => res.end());
  }
}
