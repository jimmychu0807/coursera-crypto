import { expect } from "chai";
import { nthRootCalc, bigIntToHexStr } from "./lib.js";

describe("test nthRootCalc", function () {
  it("works for square root", function () {
    const P = 999888777n;
    const n = 2n;
    const Psq = P ** n;
    expect(nthRootCalc(Psq, n)).to.equal(P);
  });

  it("works for square root with different options", function () {
    const P = 999888777n;
    const n = 2n;
    const Psq = P ** n - 1n;
    expect(nthRootCalc(Psq, n, { ceil: false })).to.equal(P - 1n);
    expect(nthRootCalc(Psq, n, { ceil: true })).to.equal(P);
  });

  it("works for large root", function () {
    const P = 999888777n;
    const n = 7n;
    const N = P ** n;
    expect(nthRootCalc(N, n)).to.equal(P);
  });

  it("works for large root with different options", function () {
    const P = 999888777n;
    const n = 7n;
    const N = P ** n - 1n;
    expect(nthRootCalc(N, n, { ceil: false })).to.equal(P - 1n);
    expect(nthRootCalc(N, n, { ceil: true })).to.equal(P);
  });
});

describe("test bigIntToHexStr", function () {
  it("works", function () {
    const input = 997n;
    expect(bigIntToHexStr(input)).to.equal("0x3e5");
  });
});
