import { IncomingMessage, ServerResponse } from "node:http";
import { validate } from "uuid";
import { defaultNotFound, getUsersData, saveUsersData } from "../utils";
import { User } from "../types";
import { parse } from "node:path";

export function DELETE(res: ServerResponse<IncomingMessage>, url?: string) {
  const { dir, base } = parse(url as string);

  if (dir !== "/api/users") return defaultNotFound(res, url);

  if (!validate(base)) {
    res.statusCode = 400;
    res.statusMessage = "Invalid user Id";
    res.end();
    return;
  }

  getUsersData()
    .then((data) => {
      const users = data as User[];
      const userIndex = users.findIndex((el) => el.id === base);

      if (userIndex === -1) {
        res.statusCode = 404;
        res.statusMessage = "User does not exist";
        return;
      }

      const newUsers = [
        ...users.slice(0, userIndex),
        ...users.slice(userIndex + 1),
      ];

      saveUsersData(newUsers)
        .then(() => {
          res.statusCode = 204;
          res.statusMessage = "Deleted successfully";
        })
        .catch((err) => {
          res.statusCode = 500;
          res.statusMessage = err;
        });
    })
    .catch((error) => {
      res.statusCode = 500;
      res.statusMessage = error;
    })
    .finally(() => res.end());
}
