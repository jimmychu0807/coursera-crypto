// Given p, g, h, find x in the h = g^x in Zp*

const DEBUG_INVERSE = false;
const DEBUG_SOLVER = false;
const DEBUG_FASTEXPMOD = false;

// default trial limit
const TRIAL_LMT = 2n ** 20n;

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
  if (steps.last === 0n) throw new Error(`steps contains 0 as the last digit`);
  if (steps.length <= 2) return 1n;

  steps.pop();
  let y = steps.pop();
  let x = steps.pop();
  if (!y || !x) throw new Error(`y: ${y}, x: ${x}`);

  let n = (x / y) * -1n;
  let m = BigInt(1);
  while (steps.length > 0) {
    y = x;
    x = steps.pop()!;
    const div = (x / y) * -1n; // BigInt is doing integer division
    const intN = div * n + m;
    m = n;
    n = intN;
    DEBUG_INVERSE && console.log(`${m}*${x} + ${n}*${y}`);
  }
  return modFunc(p)(n);
};

const getExpMapKey = (num: bigint, exp: bigint, p: bigint) => [num, exp, p].join(",");

class DiscreteLogSolver {
  protected limit: bigint;
  protected expMap: Map<string, bigint>;

  constructor(limit?: bigint) {
    this.limit = limit || TRIAL_LMT;
    this.expMap = new Map();
  }

  public solve(p: bigint, g: bigint, h: bigint): bigint | undefined {
    DEBUG_SOLVER && console.log(`p: ${p}, g: ${g}, h: ${h}`);
    DEBUG_SOLVER && console.log(`limit: ${this.limit}`);

    // building a hash table
    // epiphany note: you cannot just do a plain division here. You need to use euclid algo to find the inverse of (g**input) mod p
    const leftSideMap = this.buildMapping(p, g, h);
    DEBUG_SOLVER && console.log(`leftSideMap`, leftSideMap);

    // we are looking to solve the equation:
    //  h / (g ** x1) = (g ** B) ** x0 in Zp
    //  where h, g, B are all known
    const gB = this.expModP(g, this.limit, p);

    const milli = this.limit / 1000n;
    let progress = 0;
    for (let x0 = 0n; x0 < this.limit; x0++) {
      if (milli > 0 && x0 % milli === 0n)
        DEBUG_SOLVER && console.log(`solving: ${progress++}/1000`);

      const rs = this.expModP(gB, x0, p);
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

    const milli = this.limit / 1000n;
    let progress = 0;
    for (let i = 0n; i < this.limit; i++) {
      if (milli > 0 && i % milli === 0n)
        DEBUG_SOLVER && console.log(`buildMapping: ${progress++}/1000`);

      const res = modP(h * inverseModP(this.expModP(g, i, p)));
      map.set(res, i);
    }
    return map;
  }

  // Implementation of fast modular exponentiation
  // ref: https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/fast-modular-exponentiation
  public expModP(num: bigint, exp: bigint, p: bigint): bigint {
    const modP = modFunc(p);

    let dividend = exp;
    let ans = 1n;
    let bit = 1n;
    let term = 0n;
    while (dividend >= 1) {
      DEBUG_FASTEXPMOD && console.log(`bit: ${bit}`);

      // calculate the (num**exp) modP, and put
      const expMapKey = getExpMapKey(num, bit, p);
      if (!this.expMap.has(expMapKey)) {
        term = bit === 1n ? modP(num) : modP(term * term);
        DEBUG_FASTEXPMOD && console.log(`map key: (${expMapKey}), val: ${term}`);
        this.expMap.set(expMapKey, term);
      } else {
        term = this.expMap.get(expMapKey) as bigint;
      }

      const quotient = dividend / 2n;
      // if-clause true -> the remainder is 1
      if (quotient * 2n !== dividend) ans = modP(ans * term);
      dividend = quotient;
      bit += BigInt(1);
    }
    return ans;
  }
}

export { DiscreteLogSolver as default, inverseModFunc };
