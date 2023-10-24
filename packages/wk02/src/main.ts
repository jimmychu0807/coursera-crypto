import { aes_cbc_decrypt } from "./lib.js";
import { hexToU8a, u8aToUtf8 } from "wk01";

const KEY_STR1 = "140b41b22a29beb4061bda66b6747e14";
const CIPHERTEXT1 =
  "4ca00ff4c898d61e1edbf1800618fb2828a226d160dad07883d04e008a7897ee2e4b7465d5290d0c0e6c6822236e1daafb94ffe0c5da05d9476be028ad7c1d81";

const KEY_STR2 = "140b41b22a29beb4061bda66b6747e14";
const CIPHERTEXT2 =
  "5b68629feb8606f9a6667670b75b38a5b4832d0f26e1ab7da33249de7d4afc48e713ac646ace36e872ad5fb8a512428a6e21364b0c374df45503473c5242a253";

function main() {
  // For question 1
  let decryptedBytes = aes_cbc_decrypt(hexToU8a(CIPHERTEXT1), hexToU8a(KEY_STR1));
  console.log("Question 1 ans:", u8aToUtf8(decryptedBytes));

  // For question 2
  decryptedBytes = aes_cbc_decrypt(hexToU8a(CIPHERTEXT2), hexToU8a(KEY_STR2));
  console.log("Question 2 ans:", u8aToUtf8(decryptedBytes));
}

main();
