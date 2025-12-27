import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const defaultFixturesDir = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
  "fixtures",
);

export function getFixturesDir(): string {
  const fromEnv = process.env.RIPIO_MOCK_DATA_DIR?.trim();
  return fromEnv ? path.resolve(fromEnv) : defaultFixturesDir;
}

export async function readFixtureJson<T>(fileName: string): Promise<T> {
  const fullPath = path.join(getFixturesDir(), fileName);
  const raw = await fs.readFile(fullPath, "utf8");
  return JSON.parse(raw) as T;
}

