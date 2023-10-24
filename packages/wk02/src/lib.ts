import { randomBytes } from "node:crypto";
import { AES } from "aes-js";
import { bitXOR } from "wk01";

// key sizes: 128, 192, 256 bits
// block size: 128 bits, it is always 16 bytes

const BLOCK_SIZE = 16; // in bytes
const KEY_SIZES = [16, 24, 32];

function aes_cbc_encrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
  const iv = randomBytes(BLOCK_SIZE) as Uint8Array;

  if (!KEY_SIZES.includes(key.length))
    throw new Error("Invalid key size. Support only 128, 192, 256 bits key.");

  const aes = new AES(key);

  const paddedContentLen =
    (BLOCK_SIZE * content.length) % BLOCK_SIZE === 0
      ? content.length / BLOCK_SIZE + 1
      : Math.ceil(content.length / BLOCK_SIZE);

  const paddedContent = new Uint8Array(paddedContentLen);
  paddedContent.fill(paddedContentLen - content.length, content.length, paddedContent.length);

  const result = new Uint8Array(BLOCK_SIZE + paddedContent.length);

  result.set(iv, 0);

  for (let bIdx = 0; bIdx < paddedContent.length / BLOCK_SIZE; bIdx++) {
    const xored = bitXOR(
      bIdx === 0 ? iv : result.slice((bIdx - 1) * BLOCK_SIZE, bIdx * BLOCK_SIZE),
      paddedContent.slice(bIdx * BLOCK_SIZE, (bIdx + 1) * BLOCK_SIZE),
    );
    result.set(aes.encrypt(xored), bIdx * BLOCK_SIZE + BLOCK_SIZE);
  }

  return result;
}

function aes_cbc_decrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
  content;
  key;
  return new Uint8Array();
}

function aes_ctr_encrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
  content;
  key;
  return new Uint8Array();
}

function aes_ctr_decrypt(content: Uint8Array, key: Uint8Array): Uint8Array {
  content;
  key;
  return new Uint8Array();
}

export { aes_cbc_encrypt, aes_cbc_decrypt, aes_ctr_encrypt, aes_ctr_decrypt };
