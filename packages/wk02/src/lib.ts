import { randomBytes } from "node:crypto";
import { AES } from "aes-js";

import { bitXOR } from "wk01";

// key sizes: 128, 192, 256 bits
// block size: 128 bits, it is always 16 bytes
const BLOCK_SIZE = 16; // in bytes
const KEY_SIZES = [16, 24, 32];

function aes_cbc_encrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
  const iv = new Uint8Array(randomBytes(BLOCK_SIZE));

  if (!KEY_SIZES.includes(key.length))
    throw new Error("Invalid key size. Support only 128, 192, 256 bits key.");

  const aes = new AES(key);

  const paddedContentLen =
    BLOCK_SIZE *
    (content.length % BLOCK_SIZE === 0
      ? content.length / BLOCK_SIZE + 1
      : Math.ceil(content.length / BLOCK_SIZE));

  const paddedContent = new Uint8Array(paddedContentLen);
  // Copy the original content over
  paddedContent.set(content, 0);
  // Fill the remaining
  paddedContent.fill(paddedContentLen - content.length, content.length, paddedContent.length);

  const result = new Uint8Array(paddedContent.length + BLOCK_SIZE);
  result.set(iv, 0);

  for (let bIdx = 0; bIdx < paddedContent.length / BLOCK_SIZE; bIdx++) {
    const xored = bitXOR(
      result.slice(bIdx * BLOCK_SIZE, (bIdx + 1) * BLOCK_SIZE),
      paddedContent.slice(bIdx * BLOCK_SIZE, (bIdx + 1) * BLOCK_SIZE),
    );
    result.set(aes.encrypt(xored), (bIdx + 1) * BLOCK_SIZE);
  }

  return result;
}

function aes_cbc_decrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
  const aes = new AES(key);

  // content should be in multiples of BLOCK_SIZE
  if (content.length % BLOCK_SIZE !== 0)
    throw new Error("Invalid content length. Content should be in multiple of BLOCK_SIZE");

  const resultPadded = new Uint8Array(content.length - BLOCK_SIZE);

  for (let bIdx = 1; bIdx < content.length / BLOCK_SIZE; bIdx++) {
    const xored = bitXOR(
      content.slice((bIdx - 1) * BLOCK_SIZE, bIdx * BLOCK_SIZE),
      aes.decrypt(content.slice(bIdx * BLOCK_SIZE, (bIdx + 1) * BLOCK_SIZE)),
    );
    resultPadded.set(xored, (bIdx - 1) * BLOCK_SIZE);
  }

  // Remove the pad at the end
  const pad = resultPadded.at(resultPadded.length - 1) as number;
  return resultPadded.slice(0, resultPadded.length - pad);
}

function aes_ctr_encrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
  const aes = new AES(key);
  const iv = new Uint8Array(randomBytes(BLOCK_SIZE));

  const result = new Uint8Array(content.length + iv.length);
  result.set(iv, 0);

  for (let bIdx = 0; bIdx < Math.ceil(content.length / BLOCK_SIZE); bIdx++) {
    const xored = bitXOR(
      content.slice(bIdx * BLOCK_SIZE, Math.min((bIdx + 1) * BLOCK_SIZE, content.length)),
      aes.encrypt(iv),
      { equalizeLen: "trim", direction: "toRight" },
    );
    result.set(xored, (bIdx + 1) * BLOCK_SIZE);
    bitIncrement(iv);
  }

  return result;
}

function aes_ctr_decrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
  const aes = new AES(key);
  const iv = content.slice(0, BLOCK_SIZE);
  const result = new Uint8Array(content.length - BLOCK_SIZE);

  for (let bIdx = 1; bIdx < Math.ceil(content.length / BLOCK_SIZE); bIdx++) {
    const xored = bitXOR(
      content.slice(bIdx * BLOCK_SIZE, Math.min((bIdx + 1) * BLOCK_SIZE, content.length)),
      aes.encrypt(iv),
      { equalizeLen: "trim", direction: "toRight" },
    );
    result.set(xored, (bIdx - 1) * BLOCK_SIZE);
    bitIncrement(iv);
  }

  return result;
}

// This function increment bytes by 1 in-place.
const MASKS = [1, 2, 4, 8, 16, 32, 64, 128];
const XOR_TARGETS = [1, 3, 7, 15, 31, 63, 127, 255];

function bitIncrement(bytes: Uint8Array): void {
  let bitCnt = 0;
  let byteCnt = bytes.length - 1;

  while (byteCnt >= 0) {
    const byte = bytes.at(byteCnt) as number;
    if ((byte & MASKS[bitCnt]) === 0) {
      bytes.set([byte ^ XOR_TARGETS[bitCnt]], byteCnt);
      if (byteCnt + 1 < bytes.length) bytes.fill(0, byteCnt + 1, bytes.length);
      return;
    }

    // increment counter
    bitCnt += 1;
    if (bitCnt >= MASKS.length) {
      byteCnt -= 1;
      bitCnt = 0;
    }
  }

  throw new Error(`${bytes} is overflowed when incremented by 1`);
}

// Export functions only during in TEST environment
// ref: https://stackoverflow.com/a/57212354/523060
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let privateMethods: { [key: string]: any } = {};
if (process.env.NODE_ENV === "test") {
  privateMethods = { bitIncrement };
}

export { aes_cbc_encrypt, aes_cbc_decrypt, aes_ctr_encrypt, aes_ctr_decrypt, privateMethods };
