interface IBitXOROptions {
  equalizeLen: "trim" | "expand";
  direction: "toLeft" | "toRight";
}

const UNPRINTABLE_CHAR = "░";

function utf8ToU8a(str: string): Uint8Array {
  return Uint8Array.from(Buffer.from(str, "utf8"));
}

function u8aToUtf8(hex: Uint8Array, sep: string = ""): string {
  const strArr: string[] = Array.from(hex).map((val) =>
    val < 32 || val > 126 ? UNPRINTABLE_CHAR : String.fromCodePoint(val),
  );
  return strArr.join(sep);
}

function hexStrToU8a(hexStr: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hexStr, "hex"));
}

function u8aToHexStr(hex: Uint8Array, sep: string = ""): string {
  const str = Buffer.from(hex).toString("hex");
  let result = "";

  for (let idx = 0; idx < str.length; idx++) {
    // sep occur every two chars
    result += str.charAt(idx) + (idx === str.length - 1 || idx % 2 === 0 ? "" : sep);
  }
  return result;
}

function hexStrToUtf8(hexStr: string, sep: string = ""): string {
  return u8aToUtf8(hexStrToU8a(hexStr), sep);
}

function utf8ToHexStr(str: string, sep: string = ""): string {
  return u8aToHexStr(utf8ToU8a(str), sep);
}

function intArrToU8a(input: number[]): Uint8Array {
  return Uint8Array.from(input);
}

function u8aToIntArr(hex: Uint8Array): number[] {
  return Array.from(hex).map((v) => v);
}

function bitXOR(
  input1: Uint8Array,
  input2: Uint8Array,
  opts: IBitXOROptions = { equalizeLen: "expand", direction: "toRight" },
): Uint8Array {
  let [ei1, ei2] = input1.length >= input2.length ? [input1, input2] : [input2, input1];

  // Equalize the length of the two input based on opts setting
  if (ei1.length !== ei2.length) {
    // ei1 is always the one with longer length among the two
    if (opts.equalizeLen === "trim") {
      ei1 =
        opts.direction === "toLeft" ? ei1.slice(ei1.length - ei2.length) : ei1.slice(0, ei2.length);
    } else {
      // opts.equalizeLen === 'expand'
      const newi2 = new Uint8Array(ei1.length);
      opts.direction === "toLeft" ? newi2.set(ei2, ei1.length - ei2.length) : newi2.set(ei2, 0);
      ei2 = newi2;
    }
  }

  const result = new Uint8Array(ei1.length);
  for (let idx = 0; idx < result.length; idx++) {
    result[idx] = ei1[idx] ^ ei2[idx];
  }
  return result;
}

export {
  bitXOR,
  hexStrToU8a,
  hexStrToUtf8,
  intArrToU8a,
  u8aToHexStr,
  u8aToIntArr,
  u8aToUtf8,
  utf8ToHexStr,
  utf8ToU8a,
};
export type { IBitXOROptions };
