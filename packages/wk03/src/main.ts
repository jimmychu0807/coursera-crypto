import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { u8aToHex } from "wk01";

import { streamHash } from "./lib.js";

async function main() {
  const target = join(dirname(fileURLToPath(import.meta.url)), "../assets/target.mp4");
  console.log("digest:", u8aToHex(await streamHash(target)));
}

main().catch(console.error);
