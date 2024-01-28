// Given p, g, h, find x in the h = g^x in Zp*

// default trial limit
const TRIAL_LMT = BigInt(2) ** BigInt(20);
const DEBUG_PT = (TRIAL_LMT - (TRIAL_LMT % BigInt(100))) / BigInt(100);

function modFunc(p: bigint) {
  return (num: bigint) => num % p;
}

class DiscreteLogSolver {
  protected limit: bigint;

  constructor(limit?: bigint) {
    this.limit = limit || TRIAL_LMT;
  }

  public solve(p: bigint, g: bigint, h: bigint): bigint | undefined {
    console.log(`TRIAL_LMT: ${TRIAL_LMT}`);
    console.log(`DEBUG PT:  ${DEBUG_PT}`);

    const modP = modFunc(p);

    // building a hash table
    const leftSideMap = this.buildMapping((input: bigint) => modP(h / modP(g**input)) );

    console.log(`complete buildMapping, size: ${leftSideMap.size}`);

    // we are looking to solve the equation:
    //  h / (g ** x1) = (g ** B) ** x0 in Zp
    //  where h, g, B are all known
    const gB = modP(g ** TRIAL_LMT);
    for (let x0 = BigInt(0); x0 < BigInt(this.limit); x0++) {

      if (x0 % DEBUG_PT === BigInt(0)) console.log(`trying - ${x0 / DEBUG_PT}/100 completed.`);

      const rs = modP(gB ** x0);
      if (leftSideMap.has(rs)) {
        // we found the solution here, with x0 and x1
        const x1 = leftSideMap.get(rs) as bigint;
        return x0 * TRIAL_LMT + x1;
      }
    }

    return undefined;
  }

  protected buildMapping(fn: (input: bigint) => bigint): Map<bigint, bigint> {
    const map = new Map();
    for (let i = BigInt(0); i < BigInt(this.limit); i++) {

      if (i % DEBUG_PT === BigInt(0)) console.log(`building map - ${i / DEBUG_PT}/100 completed.`);

      const res = fn(i);

      console.log(`${i}: ${res}`);

      map.set(res, i);
    }

    return map;
  }

}

export default DiscreteLogSolver;
