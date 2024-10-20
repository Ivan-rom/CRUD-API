import { createServer } from "node:http";
import "dotenv/config";
import { GET } from "./methods/GET";
import { POST } from "./methods/POST";

const PORT = process.env.PORT;

const server = createServer((req, res) => {
  const { method, url } = req;

  switch (method) {
    case "GET":
      GET(res, url);
      break;

    case "POST":
      POST(res, req, url);

    default:
      break;
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
