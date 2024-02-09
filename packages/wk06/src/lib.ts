const DEBUG_CALC = false;

interface Options {
  ceil: boolean;
}

const defaultOpt: Options = {
  ceil: true,
};

function nthRootCalc(p: bigint, n: bigint, opt: Options = defaultOpt): bigint {
  // This is the referenced impl:
  // https://gist.github.com/JochemKuijpers/cd1ad9ec23d6d90959c549de5892d6cb
  let min = 1n;
  let max = p / n;
  while (max >= min) {
    const mid = (min + max) >> 1n;
    DEBUG_CALC && console.log(`min: ${min}, mid: ${mid}, max: ${max}`);

    const q = mid ** n;
    if (q > p) {
      max = mid - 1n;
    } else {
      min = mid + 1n;
    }
  }
  const sol = min - 1n;

  if (!opt.ceil) return sol;
  return sol ** n < p ? sol + 1n : sol;
}

function bigIntToHexStr(input: bigint, base: number = 16, prepend: string = "0x"): string {
  if (base < 2 || base > 36) throw new Error(`base can only be within 2 to 36. base: ${base}`);

  const chars = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
  const baseN = BigInt(base);

  let res = "";
  while (input > 0) {
    const remainder = input % baseN;
    res = chars[Number(remainder)] + res;
    input /= baseN;
  }
  return prepend + res;
}

export { nthRootCalc, bigIntToHexStr };
export type { Options };
