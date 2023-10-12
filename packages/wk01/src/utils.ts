interface IBitXOROptions {
  equalizeLen: "trim" | "expand";
  direction: "toLeft" | "toRight";
}

const UNPRINTABLE_CHAR = "░";

function hexStrToU8a(hexString: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hexString, "hex"));
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

function u8aToUTF8(hex: Uint8Array, sep: string = ""): string {
  const str = Buffer.from(hex).toString("utf8");
  let result = "";

  for (let idx = 0; idx < str.length; idx++) {
    const pc =
      str.charCodeAt(idx) < 32 || str.charCodeAt(idx) > 126 ? UNPRINTABLE_CHAR : str.charAt(idx);
    result += pc + (idx === str.length - 1 ? "" : sep);
  }
  return result;
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

export { bitXOR, hexStrToU8a, u8aToHexStr, u8aToUTF8 };
export type { IBitXOROptions };
