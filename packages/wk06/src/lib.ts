const DEBUG_CALC = false;

interface Options {
  ceil: boolean;
}

const defaultOpt: Options = {
  ceil: true,
};

const NthRootCalc = {
  calc: function (p: bigint, n: bigint, opt: Options = defaultOpt): bigint {
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
  },
};

export { NthRootCalc as default };
