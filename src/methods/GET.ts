import { IncomingMessage, ServerResponse } from "node:http";
import { defaultNotFound, getUsersData } from "../utils";
import { validate } from "uuid";
import { User } from "../types";

export function GET(res: ServerResponse<IncomingMessage>, url?: string) {
  if (url === "/api/users") {
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
  } else if (url?.startsWith("/api/users/")) {
    const [, , , userId] = url.split("/");

    if (!validate(userId)) {
      res.statusCode = 400;
      res.statusMessage = "Invalid user Id";
      res.end();
    }

    getUsersData()
      .then((users) => {
        const user = (users as User[]).find((el) => el.id === userId);

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
  } else {
    defaultNotFound(res, url);
  }
}
