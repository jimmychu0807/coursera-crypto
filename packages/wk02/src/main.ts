import { aes_cbc_decrypt, aes_ctr_decrypt } from "./lib.js";
import { hexToU8a, u8aToUtf8 } from "wk01";

const KEY_STR1 = "140b41b22a29beb4061bda66b6747e14";
const CIPHER1 =
  "4ca00ff4c898d61e1edbf1800618fb2828a226d160dad07883d04e008a7897ee2e4b7465d5290d0c0e6c6822236e1daafb94ffe0c5da05d9476be028ad7c1d81";

const KEY_STR2 = "140b41b22a29beb4061bda66b6747e14";
const CIPHER2 =
  "5b68629feb8606f9a6667670b75b38a5b4832d0f26e1ab7da33249de7d4afc48e713ac646ace36e872ad5fb8a512428a6e21364b0c374df45503473c5242a253";

const KEY_STR3 = "36f18357be4dbd77f050515c73fcf9f2";
const CIPHER3 =
  "69dda8455c7dd4254bf353b773304eec0ec7702330098ce7f7520d1cbbb20fc388d1b0adb5054dbd7370849dbf0b88d393f252e764f1f5f7ad97ef79d59ce29f5f51eeca32eabedd9afa9329";

const KEY_STR4 = "36f18357be4dbd77f050515c73fcf9f2";
const CIPHER4 =
  "770b80259ec33beb2561358a9f2dc617e46218c0a53cbeca695ae45faa8952aa0e311bde9d4e01726d3184c34451";

function main() {
  // For question 1
  let decrypted = aes_cbc_decrypt(hexToU8a(CIPHER1), hexToU8a(KEY_STR1));
  console.log("Question 1 ans:", u8aToUtf8(decrypted));

  // For question 2
  decrypted = aes_cbc_decrypt(hexToU8a(CIPHER2), hexToU8a(KEY_STR2));
  console.log("Question 2 ans:", u8aToUtf8(decrypted));

  // For question 3
  decrypted = aes_ctr_decrypt(hexToU8a(CIPHER3), hexToU8a(KEY_STR3));
  console.log("Question 3 ans:", u8aToUtf8(decrypted));

  // For question 4
  decrypted = aes_ctr_decrypt(hexToU8a(CIPHER4), hexToU8a(KEY_STR4));
  console.log("Question 4 ans:", u8aToUtf8(decrypted));
}

main();
