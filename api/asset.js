import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const file = req.query.file;

  console.log("ASSET FUNCTION:", {
    file,
    destination: req.headers["sec-fetch-dest"],
    mode: req.headers["sec-fetch-mode"]
  });

  if (!file || Array.isArray(file)) {
    return res.status(400).send("Missing file");
  }

  const filePath = path.join(
    process.cwd(),
    "_private",
    "js",
    path.basename(file)
  );

  if (!fs.existsSync(filePath)) {
    console.log("FILE NOT FOUND:", filePath);
    return res.status(404).send("Asset not found");
  }

  const destination = req.headers["sec-fetch-dest"];

  if (destination === "document") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send("");
  }

  const code = fs.readFileSync(filePath, "utf8");

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  return res.status(200).send(code);
}
