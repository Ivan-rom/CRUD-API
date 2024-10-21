import { createServer } from "node:http";
import "dotenv/config";
import { GET } from "./methods/GET";
import { POST } from "./methods/POST";
import { DELETE } from "./methods/DELETE";
import { PUT } from "./methods/PUT";

const PORT = process.env.PORT;

const server = createServer((req, res) => {
  const { method, url } = req;

  switch (method) {
    case "GET":
      GET(res, url);
      break;

    case "POST":
      POST(res, req, url);
      break;

    case "DELETE":
      DELETE(res, url);
      break;

    case "PUT":
      PUT(res, req, url);
      break;

    default:
      res.statusCode = 500;
      res.statusMessage = "Method is not implemented";
      res.end();
      break;
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
