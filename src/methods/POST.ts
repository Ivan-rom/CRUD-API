import { IncomingMessage, ServerResponse } from "node:http";
import { defaultNotFound, getUsersData, saveUsersData } from "../utils";
import { v6 as uuidv6 } from "uuid";
import { User } from "../types";

export function POST(
  res: ServerResponse<IncomingMessage>,
  req: IncomingMessage,
  url?: string
) {
  if (url !== "/api/users") defaultNotFound(res, url);

  const bodyJSONArray: (string | Buffer)[] = [];
  req
    .on("data", (chunk) => {
      bodyJSONArray.push(chunk);
    })
    .on("end", () => {
      const bodyJSON = Buffer.concat(bodyJSONArray as Uint8Array[]).toString();

      let user: User;

      try {
        user = JSON.parse(bodyJSON) as User;

        if (
          !user.name ||
          !user.age ||
          !user.hobbies ||
          typeof user.name !== "string" ||
          typeof user.age !== "number" ||
          !Array.isArray(user.hobbies)
        ) {
          res.statusCode = 400;
          res.statusMessage = "Incorrect user data";
          res.end();
          return;
        }

        user.id = uuidv6();
      } catch {
        res.statusCode = 400;
        res.statusMessage = "Incorrect user data";
        res.end();
        return;
      }

      getUsersData()
        .then((data) => {
          const users = data as User[];
          users.push(user);
          saveUsersData(users)
            .then(() => {
              res.write(JSON.stringify(user, null, 2));
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
