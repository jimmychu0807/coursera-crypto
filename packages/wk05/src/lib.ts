// Given p, g, h, find x in the h = g^x in Zp*

const DEBUG_INVERSE = false;
const DEBUG_SOLVER = true;

// default trial limit
const TRIAL_LMT = BigInt(2) ** BigInt(20);

const modFunc = (p: bigint) => (num: bigint) => {
  let inter = num;
  while (inter < 0) inter += p;
  return inter % p;
}

class LastAccessor<T> {
  // FURTHER-RESEARCH: how to make LastAccessor behave like an array, so
  //  `accessor.pop()` will do `this.data.pop()`
  private _data: Array<T>
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
  while (steps.last! > 1) {
    steps.push(steps.secondLast! % steps.last!);
  }
  DEBUG_INVERSE && console.log("steps", steps);

  steps.pop();
  let y = steps.pop()!;
  let x = steps.pop()!;
  let n = x / y * BigInt(-1);
  let m = BigInt(1);
  while (steps.length > 0) {
    y = x;
    x = steps.pop()!;
    const div = x / y * BigInt(-1); // BigInt is doing integer division
    const intN = div * n + m;
    m = n;
    n = intN;
    DEBUG_INVERSE && console.log(`${m}*${x} + ${n}*${y}`);
  }
  return BigInt(modFunc(p)(n));
}

class DiscreteLogSolver {
  protected limit: bigint;
  private debugPt: bigint;

  constructor(limit?: bigint) {
    this.limit = limit || TRIAL_LMT;
    this.debugPt = (this.limit - (this.limit % BigInt(100))) / BigInt(100);
  }

  public solve(p: bigint, g: bigint, h: bigint): bigint | undefined {
    console.log(`p: ${p}, g: ${g}, h: ${h}`);
    console.log(`TRIAL_LMT: ${this.limit}`);
    console.log(`DEBUG PT:  ${this.debugPt}`);

    const modP = modFunc(p);
    const inverseModP = inverseModFunc(p);

    // building a hash table
    // epiphany note: you cannot just do a plain division here. You need to use euclid algo to find the inverse of (g**input) mod p
    const leftSideMap = this.buildMapping((input: bigint) =>
      modP(h * inverseModP(modP(g**input)))
    );

    console.log(`complete buildMapping, size: ${leftSideMap.size}`);

    // we are looking to solve the equation:
    //  h / (g ** x1) = (g ** B) ** x0 in Zp
    //  where h, g, B are all known
    const gB = modP(g ** TRIAL_LMT);
    for (let x0 = BigInt(0); x0 < BigInt(this.limit); x0++) {

      if (this.debugPt !== BigInt(0) && x0 % this.debugPt === BigInt(0)) {
        DEBUG_SOLVER && console.log(`trying: ${x0 / this.debugPt}/100 completed.`);
      }

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
    for (let i = BigInt(0); i <= this.limit; i++) {
      if (this.debugPt !== BigInt(0) && i % this.debugPt === BigInt(0)) {
        DEBUG_SOLVER && console.log(`building map: ${i / this.debugPt}/100 completed.`);
      }
      const res = fn(i);
      console.log(`${i}: ${res}`);
      map.set(res, i);
    }
    return map;
  }
}

export {
  DiscreteLogSolver as default,
  inverseModFunc
}
