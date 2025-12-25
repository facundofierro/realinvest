import { readFile } from "node:fs/promises";
import path from "node:path";

export function getSampleDataDir(): string {
  return path.join(process.cwd(), "src", "sample-data");
}

export async function readSampleJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(getSampleDataDir(), fileName);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

