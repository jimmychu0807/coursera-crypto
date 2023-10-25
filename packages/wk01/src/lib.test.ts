import { expect } from "chai";
import { hexToU8a, u8aToHex } from "./lib.js";

describe("hexToU8a, u8aToHex", () => {
  // prettier-ignore
  const TEST_CASES = [
    { hex: "01", bytes: new Uint8Array([1]) },
    { hex: "ff", bytes: new Uint8Array([255]) },
    { hex: "ffff", bytes: new Uint8Array([255, 255]) },
    { hex: "01ffff", bytes: new Uint8Array([1, 255, 255]) },
  ];

  it("works", () => {
    TEST_CASES.forEach((tc) => {
      expect(hexToU8a(tc.hex)).to.be.eql(tc.bytes);
      expect(u8aToHex(tc.bytes)).to.be.eql(tc.hex);
    });
  });

  it("hexToU8a() handles odd digit hex str", () => {
    expect(hexToU8a("0x1ff")).to.be.eql(new Uint8Array([1, 255]));
  });

  it("u8aToHex() adds separator", () => {
    expect(u8aToHex(new Uint8Array([1, 255]), " ")).to.be.eql("01 ff");
  });
});
