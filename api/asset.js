import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const file = req.query.file;

  if (!file || Array.isArray(file)) {
    return res.status(400).send("Bad request");
  }

  const safeFile = path.basename(file);
  const filePath = path.join(process.cwd(), "js", safeFile);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }

  // If someone opens the JS URL directly in the browser,
  // return an empty HTML document.
  if (req.headers["sec-fetch-dest"] === "document") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send("");
  }

  // When loaded by <script src="...">, return the actual JS.
  const code = fs.readFileSync(filePath, "utf8");

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  return res.status(200).send(code);
}