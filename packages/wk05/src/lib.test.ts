import { expect } from "chai";
import DiscreteLogSolver, { inverseModFunc } from "./lib.js";

const testCases = {
  small: { p: 757958891n, g: 89512483n, h: 425341755n, x: 31n },
  mid: { p: 757958891n, g: 89512483n, h: 738383904n, x: 3607n },
  large: { p: 757958891n, g: 89512483n, h: 515600104n, x: 838043n },
};

const inverseModCases = {
  simple: { p: 19n, num: 7n, inverse: 11n },
  hard: { p: 757958891n, num: 89512483n, inverse: 99593840n },
};

// prettier-ignore
const fastExpModCases = {
  small: { p: 757958891n, n: 89512483n, exp: 31n, ans: 425341755n },
  mid: { p: 757958891n, n: 89512483n, exp: 3607n, ans: 738383904n },
  normal: { p: 757958891n, n: 89512483n, exp: 838043n, ans: 515600104n },
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
