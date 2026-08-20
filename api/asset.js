import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const file = req.query.file;

  if (!file || Array.isArray(file)) {
    return res.status(400).send("Missing file");
  }

  const filePath = path.join(
    process.cwd(),
    "js",
    path.basename(file)
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }

  // Direct browser navigation → blank document
  if (
    req.headers["sec-fetch-dest"] === "document" ||
    req.headers["sec-fetch-mode"] === "navigate"
  ) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send("");
  }

  // <script src=""> → actual JavaScript
  const code = fs.readFileSync(filePath, "utf8");

  res.setHeader(
    "Content-Type",
    "application/javascript; charset=utf-8"
  );

  return res.status(200).send(code);
}