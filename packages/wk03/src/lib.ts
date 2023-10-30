import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { u8aToHex } from "wk01";

const DEFAULT_BLOCK = 1024;
const BUFFER_SIZE = 1024;
const TIMEOUT = 3; // 3 secs to timeout

async function readFileBytes(
  filePath: string,
  start?: number,
  end?: number, // end is exclusive
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const rs = createReadStream(filePath, { start, end: end ? end - 1 : undefined });
    const buffer = new Uint8Array(BUFFER_SIZE);
    let readBytes = 0;

    rs.on("data", (chunk) => {
      if (readBytes + chunk.length > BUFFER_SIZE)
        reject(new Error("readFileBytes buffer overflow"));

      buffer.set(chunk as Buffer, readBytes);
      readBytes += chunk.length;
    });

    rs.on("end", () => resolve(buffer.slice(0, readBytes)));

    setTimeout(() => reject(new Error("readFileBytes timeout")), TIMEOUT * 1000);
  });
}

async function streamHash(
  filePath: string,
  blockSize: number = DEFAULT_BLOCK,
): Promise<Uint8Array> {
  const fstat = await stat(filePath);
  const fSize = fstat.size;
  const numBlocks = Math.ceil(fSize / blockSize);

  console.log(`file size: ${fSize}, total blocks: ${numBlocks}`);

  const hash = createHash("sha256");
  let digest = undefined;

  for (let bIdx = numBlocks - 1; bIdx >= 0; bIdx--) {
    let chunk: Uint8Array = await readFileBytes(
      filePath,
      bIdx * blockSize,
      Math.min((bIdx + 1) * blockSize, fSize),
    );

    console.log(
      `block: ${bIdx}. Range from: ${bIdx * blockSize} to: ${Math.min(
        (bIdx + 1) * blockSize,
        fSize,
      )}`,
    );
    console.log(`  read in:`, u8aToHex(chunk));

    if (digest) {
      const concat = new Uint8Array(chunk.length + digest.length);
      concat.set(chunk, 0);
      concat.set(digest, concat.length - digest.length);
      chunk = new Uint8Array(concat);
    }
    hash.update(chunk);
    digest = hash.copy().digest();

    console.log(`  chunkSize before hashing: ${chunk.length}. chunk`, u8aToHex(chunk));
    console.log(`  digest: ${u8aToHex(digest)}`);
  }
  return digest as Uint8Array;
}

export { streamHash, readFileBytes };
