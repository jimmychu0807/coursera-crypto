import { expect } from "chai";
import DiscreteLogSolver, { inverseModFunc } from "./lib.js";

const testCases = {
  small: { p: BigInt(757958891), g: BigInt(89512483), h: BigInt(425341755), x: BigInt(31) },
  mid: { p: BigInt(757958891), g: BigInt(89512483), h: BigInt(738383904), x: BigInt(3607) },
  large: { p: BigInt(757958891), g: BigInt(89512483), h: BigInt(515600104), x: BigInt(838043) },
};

const inverseModCases = {
  simple: { p: BigInt(19), num: BigInt(7), inverse: BigInt(11) },
  hard: { p: BigInt(757958891), num: BigInt(89512483), inverse: BigInt(99593840) },
};

// prettier-ignore
const fastExpModCases = {
  small: { p: BigInt(757958891), n: BigInt(89512483), exp: BigInt(31), ans: BigInt(425341755) },
  mid: { p: BigInt(757958891), n: BigInt(89512483), exp: BigInt(3607), ans: BigInt(738383904) },
  normal: { p: BigInt(757958891), n: BigInt(89512483), exp: BigInt(838043), ans: BigInt(515600104) },
};

function getLimitfromAns(num: bigint): bigint {
  return BigInt(Math.ceil(Math.sqrt(Number(num))));
}

describe("test inverseModFunc", function () {
  it("works on simple case", function () {
    const tc = inverseModCases.simple;
    const inverseModP = inverseModFunc(tc.p);
    expect(inverseModP(tc.num)).to.eql(tc.inverse);
  });

  it("works on all cases", function () {
    for (const tc of Object.values(inverseModCases)) {
      const inverseModP = inverseModFunc(tc.p);
      expect(inverseModP(tc.num)).to.eql(tc.inverse);
    }
  });
});

describe("test DiscreteLogSolver", function () {
  it("works on a simple case", function () {
    const sc = testCases.small;
    const solver = new DiscreteLogSolver(getLimitfromAns(sc.x));
    const res = solver.solve(sc.p, sc.g, sc.h);
    expect(res).to.deep.equal(sc.x);
  });

  it("works on all cases", function () {
    for (const tc of Object.values(testCases)) {
      const solver = new DiscreteLogSolver(getLimitfromAns(tc.x));
      const res = solver.solve(tc.p, tc.g, tc.h);
      expect(res).to.deep.equal(tc.x);
    }
  });
});

describe("test fastExpMod", function () {
  it("works on a simple case", function () {
    const sc = fastExpModCases.small;
    const solver = new DiscreteLogSolver();
    const res = solver.expModP(sc.n, sc.exp, sc.p);
    expect(res).to.deep.equal(sc.ans);
  });

  it("works on all cases", function () {
    for (const sc of Object.values(fastExpModCases)) {
      const solver = new DiscreteLogSolver();
      const res = solver.expModP(sc.n, sc.exp, sc.p);
      expect(res).to.deep.equal(sc.ans);
    }
  });
});
