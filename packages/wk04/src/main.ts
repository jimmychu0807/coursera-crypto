import fetch from "node-fetch";
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

async function main() {
  // Break it into 4 16-byte block
  const blocks = splitToBlocks(INTERCEPTED_V, BLOCK_LEN);
  blocks.forEach((b, i) => console.log(`b${i}: ${u8aToHex(b)}`));

  const messageBytes = new Uint8Array((INTERCEPTED_V.length - BLOCK_LEN) / 2);

  for (let blkIdx = blocks.length - 2; blkIdx >= 0; blkIdx--) {
    const bitFlipBlk = blocks[blkIdx];

    // guess from the last bytes
    for (let byteIdx = BLOCK_BYTES - 1; byteIdx >= 0; byteIdx--) {
      let respNon403 = false;

      for (let guess = 0; guess < 256; guess++) {
        console.log(`\nblkIdx: ${blkIdx}, byteIdx: ${byteIdx}, guess: ${guess}`);

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

        let xored = bitXOR(bitFlipBlk, guessBytes);

        // xor with the padding bytes
        const padInt = BLOCK_BYTES - byteIdx;
        const padBytes = new Uint8Array(BLOCK_BYTES);
        padBytes.fill(padInt, byteIdx, BLOCK_BYTES);

        console.log(`bitFlipBlk: ${u8aToHex(bitFlipBlk)}`);
        console.log(`guessBytes: ${u8aToHex(guessBytes)}`);
        console.log(`padBytes:   ${u8aToHex(padBytes)}`);

        // xor result
        xored = bitXOR(xored, padBytes);

        const replacedV = hexToU8a(INTERCEPTED_V);
        replacedV.set(xored, blkIdx * BLOCK_BYTES);

        // Sending the request out
        const params = new URLSearchParams();
        params.append(PARAM_K, u8aToHex(replacedV));

        console.log("fetch:  ", params.toString());
        const resp = await fetch(TARGET_URL + `?${params.toString()}`);

        if (resp.status !== 403) {
          respNon403 = true;
          // we know it is a valid pad
          const { status, statusText } = resp;
          console.log(`resp: ${status}, ${statusText}`);
          messageBytes.set([guess], blkIdx * BLOCK_BYTES + byteIdx);
          break;
        }
      } // end of "guess" for-loop

      if (!respNon403) {
        throw new Error(`blkIdx: ${blkIdx}, byteIdx: ${byteIdx}: no guess from 0..255 work`);
      }

      console.log(`message: ${u8aToHex(messageBytes)}`);
    } // end of "byteIdx" for-loop

    process.exit();
  } // end of "blkIdx" for-loop
}

main().catch(console.error);
