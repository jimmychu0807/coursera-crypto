import fetch from "node-fetch";

import { hexToU8a, bitXOR, u8aToHex } from "wk01";
import type { IBitXOROptions } from "wk01";

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

async function main() {
  // Break it into 4 16-byte block
  const blocks = splitToBlocks(INTERCEPTED_V, BLOCK_LEN);

  console.log(blocks);

  const xorOpts: IBitXOROptions = {
    equalizeLen: "expand",
    direction: "toLeft",
  };

  for (let blkIdx = blocks.length - 2; blkIdx >= 0; blkIdx--) {
    const bitFlipBlk = blocks[blkIdx];

    // guess from the last bit
    const byteIdx = 0;
    const guess = 0;
    while (guess < 256) {
      let xored = bitXOR(bitFlipBlk, new Uint8Array([guess]), xorOpts);
      xored = bitXOR(xored, new Uint8Array([byteIdx + 1]), xorOpts);
      const replacedV = hexToU8a(INTERCEPTED_V);
      replacedV.set(xored, blkIdx * BLOCK_BYTES);

      // Sending the request out
      const params = new URLSearchParams();
      params.append(PARAM_K, u8aToHex(replacedV));

      console.log("params:", params.toString());

      const resp = await fetch(TARGET_URL + `?${params.toString()}`);
      console.log("resp", resp);

      process.exit();
    }
  }
}

main().catch(console.error);
