import { expect } from "chai";
import DiscreteLogSolver, { inverseModFunc } from "./lib.js";

const testCases = {
  smallX: { p: BigInt(757958891), g: BigInt(89512483), h: BigInt(425341755), x: BigInt(31) },
  midX: { p: BigInt(757958891), g: BigInt(89512483), h: BigInt(738383904), x: BigInt(3607) },
  normalX: { p: BigInt(757958891), g: BigInt(89512483), h: BigInt(515600104), x: BigInt(838043) },
};

const inverseModCases = {
  simple: { p: BigInt(19), num: BigInt(7), inverse: BigInt(11) },
  hard: { p: BigInt(757958891), num: BigInt(89512483), inverse: BigInt(99593840) },
}

function getLimitfromAns(num: bigint): bigint {
  return BigInt(Math.floor(Math.ceil(Math.log2( Number(num) ))/2));
}

describe("test inverseModFunc", function() {
  it("works on simple case", function() {
    const tc = inverseModCases.simple;
    const inverseModP = inverseModFunc(tc.p);
    expect(inverseModP(tc.num)).to.eql(tc.inverse);
  });

  it("works on hard case", function() {
    const tc = inverseModCases.hard;
    const inverseModP = inverseModFunc(tc.p);
    expect(inverseModP(tc.num)).to.eql(tc.inverse);
  });
});

describe("test DiscreteLogSolver", function () {
  it("works with a simple case", function() {
    const sc = testCases.smallX;
    const solver = new DiscreteLogSolver(getLimitfromAns(sc.x));
    const res = solver.solve(sc.p, sc.g, sc.h);
    expect(res).to.deep.equal(sc.x);
  });
});
