// Given p, g, h, find x in the h = g^x in Zp*

const DEBUG_INVERSE = false;
const DEBUG_SOLVER = false;

// default trial limit
const TRIAL_LMT = BigInt(2) ** BigInt(20);

const modFunc = (p: bigint) => (num: bigint) => {
  let inter = num;
  while (inter < 0) inter += p;
  return inter % p;
};

class LastAccessor<T> {
  // FURTHER-RESEARCH: how to make LastAccessor behave like an array, so
  //  `accessor.pop()` will do `this.data.pop()`
  private _data: Array<T>;
  constructor(array: Array<T>) {
    this._data = array;
  }
  push(...p: T[]) {
    this._data.push(...p);
  }
  pop() {
    return this._data.pop();
  }
  get last(): T | undefined {
    return this._data.length >= 1 ? this._data[this._data.length - 1] : undefined;
  }
  get secondLast(): T | undefined {
    return this._data.length >= 2 ? this._data[this._data.length - 2] : undefined;
  }
  get data(): Array<T> {
    return this._data;
  }
  get length(): number {
    return this._data.length;
  }
}

// Implement extended Euclidean algorithm
const inverseModFunc = (p: bigint) => (num: bigint) => {
  const steps = new LastAccessor([p, num]);
  while (steps.last! > 1) steps.push(steps.secondLast! % steps.last!);
  DEBUG_INVERSE && console.log("steps:", steps);

  // error checking and edge cases
  if (steps.last === BigInt(0)) throw new Error(`steps contains 0 as the last digit`);
  if (steps.length <= 2) return BigInt(1);

  steps.pop();
  let y = steps.pop();
  let x = steps.pop();
  if (!y || !x) throw new Error(`y: ${y}, x: ${x}`);

  let n = (x / y) * BigInt(-1);
  let m = BigInt(1);
  while (steps.length > 0) {
    y = x;
    x = steps.pop()!;
    const div = (x / y) * BigInt(-1); // BigInt is doing integer division
    const intN = div * n + m;
    m = n;
    n = intN;
    DEBUG_INVERSE && console.log(`${m}*${x} + ${n}*${y}`);
  }
  return BigInt(modFunc(p)(n));
};

class DiscreteLogSolver {
  protected limit: bigint;

  constructor(limit?: bigint) {
    this.limit = limit || TRIAL_LMT;
  }

  public solve(p: bigint, g: bigint, h: bigint): bigint | undefined {
    DEBUG_SOLVER && console.log(`p: ${p}, g: ${g}, h: ${h}`);
    DEBUG_SOLVER && console.log(`TRIAL_LMT: ${this.limit}`);

    const modP = modFunc(p);

    // building a hash table
    // epiphany note: you cannot just do a plain division here. You need to use euclid algo to find the inverse of (g**input) mod p
    const leftSideMap = this.buildMapping(p, g, h);

    DEBUG_SOLVER && console.log(`leftSideMap`, leftSideMap);

    // we are looking to solve the equation:
    //  h / (g ** x1) = (g ** B) ** x0 in Zp
    //  where h, g, B are all known
    const gB = modP(g ** this.limit);
    for (let x0 = BigInt(0); x0 < BigInt(this.limit); x0++) {
      const rs = modP(gB ** x0);
      if (leftSideMap.has(rs)) {
        // we found the solution here, with x0 and x1
        const x1 = leftSideMap.get(rs)!;
        return x0 * this.limit + x1;
      }
    }

    return undefined;
  }

  protected buildMapping(p: bigint, g: bigint, h: bigint): Map<bigint, bigint> {
    const modP = modFunc(p);
    const inverseModP = inverseModFunc(p);

    const map = new Map();

    for (let i = BigInt(0); i < this.limit; i++) {
      const res = modP(h * inverseModP(modP(g ** i)));
      map.set(res, i);
    }
    return map;
  }
}

export { DiscreteLogSolver as default, inverseModFunc };
