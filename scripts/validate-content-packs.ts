import { listContentPacks, loadContentPack } from "@/lib/content/loader";

for (const { key, title } of listContentPacks()) {
  try {
    loadContentPack(key);
    console.log(`OK   ${key} — ${title}`);
  } catch (err) {
    console.error(`FAIL ${key} — ${title}`);
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}
