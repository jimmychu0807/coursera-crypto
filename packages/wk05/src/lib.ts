// Given p, g, h, find x in the h = g^x in Zp*

// default trial limit
const TRIAL_LMT = BigInt(2) ** BigInt(20);

class DiscreteLogSolver {
  protected limit: bigint;

  constructor(limit?: bigint) {
    this.limit = limit || TRIAL_LMT;
  }

  public solve(p: bigint, g: bigint, h: bigint): bigint {
    // building a hash table
    const leftSideMap = this.buildMapping((input: bigint) => h / g ** input);

    p;
    leftSideMap;
    return 1n;
  }

  protected buildMapping(fn: (input: bigint) => bigint): Map<bigint, bigint> {
    const map = new Map();
    for (let i = BigInt(0); i < BigInt(this.limit); i++) {
      map.set(i, fn(i));
    }

    return map;
  }
}

export default DiscreteLogSolver;
