import { IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:path";
import { defaultNotFound, getUsersData, saveUsersData } from "../utils";
import { validate } from "uuid";
import { User } from "../types";

export function PUT(
  res: ServerResponse<IncomingMessage>,
  req: IncomingMessage,
  url?: string
) {
  const { dir, base } = parse(url as string);

  if (dir !== "/api/users") return defaultNotFound(res, url);

  if (!validate(base)) {
    res.statusCode = 400;
    res.statusMessage = "Invalid user Id";
    res.end();
    return;
  }

  const bodyJSONArray: (string | Buffer)[] = [];
  req
    .on("data", (chunk) => {
      bodyJSONArray.push(chunk);
    })
    .on("end", async () => {
      const bodyJSON = Buffer.concat(bodyJSONArray as Uint8Array[]).toString();

      let user: User;

      try {
        user = JSON.parse(bodyJSON) as User;
      } catch {
        res.statusCode = 400;
        res.statusMessage = "Incorrect user data";
        res.end();
        return;
      }

      await getUsersData()
        .then(async (data) => {
          const users = data as User[];

          const userIndex = users.findIndex((el) => el.id === base);

          if (userIndex === -1) {
            res.statusCode = 404;
            res.statusMessage = "User does not exist";
            res.end();
            return;
          }

          const savedUser = users[userIndex];

          users[userIndex].age = user.age ? user.age : savedUser.age;
          users[userIndex].name = user.name ? user.name : savedUser.name;
          users[userIndex].hobbies = Array.isArray(user.hobbies)
            ? user.hobbies
            : savedUser.hobbies;

          await saveUsersData(users)
            .then(() => {
              res.write(JSON.stringify(savedUser, null, 2));
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
    })
    .on("error", () => {
      res.statusCode = 500;
      res.statusMessage = "Something went wrong";
      res.end();
    });
}
