import { expect } from "chai";
import {
  aes_cbc_encrypt,
  aes_cbc_decrypt,
  privateMethods,
  aes_ctr_encrypt,
  aes_ctr_decrypt,
} from "./lib.js";

// prettier-ignore
const TEST_CASES = {
  ONE_BYTE: new Uint8Array([1]),
  SIXTEEN_BYTES: new Uint8Array([
    0, 1, 2, 3,
    4, 5, 6, 7,
    8, 9, 10, 11,
    12, 13, 14, 15,
  ]),
  SEVENTEEN_BYTES: new Uint8Array([
    0, 1, 2, 3,
    4, 5, 6, 7,
    8, 9, 10, 11,
    12, 13, 14, 15,
    16,
  ]),
};

const BLOCK_SIZE = 16;

describe("aes_cbc_encrypt(), aes_cbc_decrypt()", function () {
  it("works for one byte", function () {
    const key = new Uint8Array(16);
    key.fill(1, 0, 16);

    const encryptedBytes = aes_cbc_encrypt(TEST_CASES.ONE_BYTE, key);
    expect(encryptedBytes.length).to.be.equal(BLOCK_SIZE + BLOCK_SIZE);

    const decryptedBytes = aes_cbc_decrypt(encryptedBytes, key);
    expect(decryptedBytes).to.be.eql(TEST_CASES.ONE_BYTE);
  });

  it("works for sixteen bytes", function () {
    const key = new Uint8Array(16);
    key.fill(1, 0, 16);

    const encryptedBytes = aes_cbc_encrypt(TEST_CASES.SIXTEEN_BYTES, key);
    expect(encryptedBytes.length).to.be.equal(BLOCK_SIZE * 3);

    const decryptedBytes = aes_cbc_decrypt(encryptedBytes, key);
    expect(decryptedBytes).to.be.eql(TEST_CASES.SIXTEEN_BYTES);
  });

  it("works for seventeen bytes", function () {
    const key = new Uint8Array(16);
    key.fill(1, 0, 16);

    const encryptedBytes = aes_cbc_encrypt(TEST_CASES.SEVENTEEN_BYTES, key);
    expect(encryptedBytes.length).to.be.equal(BLOCK_SIZE * 3);

    const decryptedBytes = aes_cbc_decrypt(encryptedBytes, key);
    expect(decryptedBytes).to.be.eql(TEST_CASES.SEVENTEEN_BYTES);
  });
});

describe("bitIncrement", function () {
  it("works for a few test cases", function () {
    const { bitIncrement } = privateMethods;
    // prettier-ignore
    const testCases = [
      { test: new Uint8Array([1]), expect: new Uint8Array([2]) },
      { test: new Uint8Array([254]), expect: new Uint8Array([255]) },
      { test: new Uint8Array([0, 0, 255]), expect: new Uint8Array([0, 1, 0]) },
      { test: new Uint8Array([3, 255, 255]), expect: new Uint8Array([4, 0, 0]) },
    ]

    testCases.forEach((tc) => {
      bitIncrement(tc.test);
      expect(tc.test).to.be.eql(tc.expect);
    });
  });
});

describe("aes_ctr_encrypt(), aes_ctr_decrypt()", function () {
  it("works for all test cases", function () {
    const key = new Uint8Array(16);
    key.fill(1, 0, 16);

    Object.values(TEST_CASES).forEach((tc) => {
      const encryptedBytes = aes_ctr_encrypt(tc, key);
      expect(encryptedBytes.length).to.be.equal(BLOCK_SIZE + tc.length);

      const decryptedBytes = aes_ctr_decrypt(encryptedBytes, key);
      expect(decryptedBytes).to.be.eql(tc);
    });
  });
});
