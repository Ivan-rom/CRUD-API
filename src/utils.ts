import fs from "node:fs";
import { User } from "./types";
import { IncomingMessage, ServerResponse } from "node:http";

export function getUsersData() {
  return new Promise((res, rej) => {
    fs.readFile("users.json", { encoding: "utf-8" }, function (err, data) {
      if (err) rej("File users.json does not exist");

      try {
        res(JSON.parse(data) as User[]);
      } catch {
        rej("Could not parse data");
      }
    });
  });
}

export function saveUsersData(users: User[]) {
  return new Promise((res, rej) => {
    fs.writeFile("users.json", JSON.stringify(users, null, 2), function (err) {
      if (err) rej("Could not save users");
      res("Successfully saved users");
    });
  });
}

export function defaultNotFound(
  res: ServerResponse<IncomingMessage>,
  url = "Path"
) {
  res.statusCode = 404;
  res.statusMessage = `${url} is not found`;
  res.end();
}
