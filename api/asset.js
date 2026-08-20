import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const file = req.query.file;

  if (!file || Array.isArray(file)) {
    return res.status(400).send("Bad request");
  }

  const safeFile = path.basename(file);
  const filePath = path.join(process.cwd(), "_private", "js", safeFile);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }

  const destination = req.headers["sec-fetch-dest"] || "";
  const mode = req.headers["sec-fetch-mode"] || "";

  // Directly opened in the browser
  if (destination === "document" || mode === "navigate") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send("<!doctype html><html><head></head><body></body></html>");
  }

  // Loaded by <script src="...">
  const code = fs.readFileSync(filePath, "utf8");

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  return res.status(200).send(code);
}
