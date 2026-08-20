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

  const fetchDest = req.headers["sec-fetch-dest"] || "";
  const fetchMode = req.headers["sec-fetch-mode"] || "";
  const accept = req.headers["accept"] || "";

  /*
   * Direct browser navigation:
   *   Sec-Fetch-Dest: document
   *   Sec-Fetch-Mode: navigate
   *   Accept: text/html,...
   *
   * Script loading:
   *   Sec-Fetch-Dest: script
   *   Sec-Fetch-Mode: no-cors
   */
  const isDocumentNavigation =
    fetchDest === "document" ||
    fetchMode === "navigate" ||
    accept.includes("text/html");

  if (isDocumentNavigation) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body></body>
</html>
`);
  }

  const code = fs.readFileSync(filePath, "utf8");

  res.setHeader(
    "Content-Type",
    "application/javascript; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "public, max-age=31536000, immutable"
  );

  return res.status(200).send(code);
}
