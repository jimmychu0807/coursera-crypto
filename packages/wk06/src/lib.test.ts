import { expect } from "chai";
import NthRootCalc from "./lib.js";

describe("test NthRootCalc", function () {
  it("works for square root", function () {
    const P = 999888777n;
    const n = 2n;
    const Psq = P ** n;
    expect(NthRootCalc.calc(Psq, n)).to.equal(P);
  });

  it("works for square root with different options", function () {
    const P = 999888777n;
    const n = 2n;
    const Psq = P ** n - 1n;
    expect(NthRootCalc.calc(Psq, n, { ceil: false })).to.equal(P - 1n);
    expect(NthRootCalc.calc(Psq, n, { ceil: true })).to.equal(P);
  });

  it("works for large root", function () {
    const P = 999888777n;
    const n = 7n;
    const N = P ** n;
    expect(NthRootCalc.calc(N, n)).to.equal(P);
  });

  it("works for large root with different options", function () {
    const P = 999888777n;
    const n = 7n;
    const N = P ** n - 1n;
    expect(NthRootCalc.calc(N, n, { ceil: false })).to.equal(P - 1n);
    expect(NthRootCalc.calc(N, n, { ceil: true })).to.equal(P);
  });
});
