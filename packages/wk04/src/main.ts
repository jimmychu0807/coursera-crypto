import fetch from "node-fetch";
import type { Response } from "node-fetch";
import { hexToU8a, bitXOR, u8aToHex, u8aToUtf8 } from "wk01";

const DEBUG = false;
const TARGET_URL = "http://crypto-class.appspot.com/po";
const PARAM_K = "er";
const INTERCEPTED_V =
  "f20bdba6ff29eed7b046d1df9fb7000058b1ffb4210a580f748b4ac714c001bd4a61044426fb515dad3f21f18aa577c0bdf302936266926ff37dbf7035d5eeb4";
const BLOCK_LEN = 32; // this is the string length
const BLOCK_BYTES = BLOCK_LEN / 2;

function splitToBlocks(input: string, len: number): Uint8Array[] {
  const res = [];
  for (let idx = 0; idx < input.length / len; idx++) {
    const slice = input.slice(idx * len, (idx + 1) * len);
    res.push(hexToU8a(slice));
  }

  return res;
}

type Params = {
  guess: number;
  guessBytes: Uint8Array;
  padBytes: Uint8Array;
  xored: Uint8Array;
  tampered: Uint8Array;
  replacedV: string;
};

function debugStruct(paramArr: Params[]) {
  paramArr.forEach((p, idx) => {
    if (idx === 0 || idx === 100 || idx === 200 || idx === 255) {
      console.log(`guess: ${u8aToHex(p.guessBytes)}`);
      console.log(`padB:  ${u8aToHex(p.padBytes)}`);
      console.log(`xored: ${u8aToHex(p.xored)}`);
      console.log(`tampe: ${u8aToHex(p.tampered)}`);
      console.log(`repla: ${p.replacedV}\n`);
    }
  });
}

async function main() {
  // Break it into 4 16-byte block
  const blocks = splitToBlocks(INTERCEPTED_V, BLOCK_LEN);
  const messageBytes = new Uint8Array((INTERCEPTED_V.length - BLOCK_LEN) / 2);

  for (let blkIdx = 0; blkIdx < blocks.length - 1; blkIdx++) {
    const targetV = new Uint8Array(BLOCK_BYTES * 2);
    targetV.set(blocks[blkIdx], 0);
    targetV.set(blocks[blkIdx + 1], BLOCK_BYTES);

    const bitFlipBlk = blocks[blkIdx];

    // guess from the last bytes
    for (let byteIdx = BLOCK_BYTES - 1; byteIdx >= 0; byteIdx--) {
      const paramArr = [];

      for (let guess = 0; guess < 256; guess++) {
        // xor first with the guess
        const guessBytes = new Uint8Array(BLOCK_BYTES);
        guessBytes.set([guess], byteIdx);
        if (byteIdx < BLOCK_BYTES - 1) {
          // copy messageBytes over to guessBytes
          const messageBlkBytes = messageBytes.slice(
            blkIdx * BLOCK_BYTES,
            (blkIdx + 1) * BLOCK_BYTES,
          );
          guessBytes.set(messageBlkBytes.slice(byteIdx + 1), byteIdx + 1);
        }

        // xor with the padding bytes
        const padInt = BLOCK_BYTES - byteIdx;
        const padBytes = new Uint8Array(BLOCK_BYTES);
        padBytes.fill(padInt, byteIdx, BLOCK_BYTES);

        const xored = bitXOR(guessBytes, padBytes);
        const tampered = bitXOR(bitFlipBlk, xored);
        const replacedV = targetV.slice(0);
        replacedV.set(tampered, 0);

        paramArr.push({
          guess,
          guessBytes,
          padBytes,
          xored,
          tampered,
          replacedV: u8aToHex(replacedV),
        });
      }

      if (DEBUG) debugStruct(paramArr);

      const promises: Promise<{ guess: number; resp: Response }>[] = paramArr.map((param) => {
        const { guess, replacedV } = param;
        return fetch(TARGET_URL + `?${PARAM_K}=${replacedV}`).then((resp) => ({ guess, resp }));
      });

      const settled = await Promise.allSettled(promises);
      const res404 = settled.reduce(
        (acc: { guess: number; resp: Response }[], r) =>
          r.status === "fulfilled" && r.value.resp.status === 404 ? [...acc, r.value] : acc,
        [],
      );

      if (res404.length <= 0)
        throw new Error(
          `blkIdx: ${blkIdx}, byteIdx: ${byteIdx}: there are ${res404.length} 404 results`,
        );

      if (res404.length > 1)
        console.log(
          `res404 len: ${res404.length}. guesses:`,
          res404.map((r) => r.guess),
        );

      // note: hard coded here to use the last correct guess
      messageBytes.set([res404[res404.length - 1].guess], blkIdx * BLOCK_BYTES + byteIdx);
      console.log(`message: ${u8aToHex(messageBytes)}`);
    } // end of "byteIdx" for-loop
  } // end of "blkIdx" for-loop

  const lastByte = messageBytes.at(messageBytes.length - 1) as number;
  const sliced = messageBytes.slice(0, messageBytes.length - lastByte);
  console.log(`Decrypted message: ${u8aToUtf8(sliced)}`);
}

main().catch(console.error);
