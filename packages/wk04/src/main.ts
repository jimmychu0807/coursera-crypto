import fetch from "node-fetch";
import type { Response } from "node-fetch";
import { hexToU8a, bitXOR, u8aToHex } from "wk01";

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

// function clone(src: Uint8Array): Uint8Array {
//   const dst = new ArrayBuffer(src.byteLength);
//   const res = new Uint8Array(dst);
//   res.set(new Uint8Array(src));
//   return res;
// }

type Params = {
  guess: number;
  guessBytes: Uint8Array;
  padBytes: Uint8Array;
  xored: Uint8Array;
  tampered: Uint8Array;
  replacedV: string;
};

function debugStruct(paramArr: Params[]) {
  paramArr.forEach((p) => {
    console.log(`guess: ${p.guess}, guessBytes: ${u8aToHex(p.guessBytes)}`);
    console.log(`xored: ${u8aToHex(p.xored)}`);
    console.log(`tampe: ${u8aToHex(p.tampered)}`);
    console.log(`repla: ${p.replacedV}\n`);
  });
}

async function main() {
  // Break it into 4 16-byte block
  const blocks = splitToBlocks(INTERCEPTED_V, BLOCK_LEN);
  const messageBytes = new Uint8Array((INTERCEPTED_V.length - BLOCK_LEN) / 2);

  for (let blkIdx = 0; blkIdx < blocks.length - 1; blkIdx++) {
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

        // console.log(`bitFlipBlk: ${u8aToHex(bitFlipBlk)}`);
        // console.log(`guessBytes: ${u8aToHex(guessBytes)}`);
        // console.log(`padBytes:   ${u8aToHex(padBytes)}`);
        // console.log(`xored:      ${u8aToHex(xored)}`);
        // console.log(`tampered:   ${u8aToHex(tampered)}`);

        const replacedV = hexToU8a(INTERCEPTED_V).slice(0, (blkIdx + 2) * BLOCK_BYTES);
        replacedV.set(tampered, blkIdx * BLOCK_BYTES);

        paramArr.push({
          guess,
          guessBytes,
          padBytes,
          xored,
          tampered,
          replacedV: u8aToHex(replacedV),
        });
      }

      debugStruct(paramArr);

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

      if (res404.length !== 1)
        throw new Error(
          `blkIdx: ${blkIdx}, byteIdx: ${byteIdx}: there are ${res404.length} 404 results`,
        );

      messageBytes.set([res404[0].guess], blkIdx * BLOCK_BYTES + byteIdx);
      console.log(`message: ${u8aToHex(messageBytes)}`);
    } // end of "byteIdx" for-loop

    // process.exit();
  } // end of "blkIdx" for-loop
}

main().catch(console.error);
