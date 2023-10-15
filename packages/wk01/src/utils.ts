import makeDebug from "debug";

interface IBitXOROptions {
  equalizeLen: "trim" | "expand";
  direction: "toLeft" | "toRight";
}

type Knowledge = [number, number, string][];

const UNPRINTABLE_CHAR = "░";
const SPACE_CHAR = " ";
const SPACE_CODEPOINT = 32;
const ALPHABET_CNT_THRESHOLD_PC = 0.9;

const debug = makeDebug("wk01");
const debugLv2 = makeDebug("wk01:lv2");
makeDebug.enable("wk01*");

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

const dump = {
  inputCiphers: (ciphertexts: string[]): string => {
    return ciphertexts
      .map((oneCipher, idx) => {
        const prefix = `msg ${String(idx).padStart(String(ciphertexts.length).length, "0")}: `;
        return `${prefix}${oneCipher}\n${" ".repeat(prefix.length)}${hexStrToUtf8(oneCipher, " ")}`;
      })
      .join("\n\n");
  },

  // prettier-ignore
  u8a: (input: Uint8Array): string =>
    `hexStr: ${u8aToHexStr(input)}\n` +
    `utf8:   ${u8aToUtf8(input, " ")}`,

  u8aArr: (input: Uint8Array[]): string => `[\n${input.map((i) => dump.u8a(i)).join("\n\n")}\n]`,

  crossXOR: (crossXOR: Uint8Array[][]): string => {
    let outContent = "";
    for (let i = 0; i < crossXOR.length; i++) {
      for (let j = 0; j < crossXOR[i].length; j++) {
        if (!crossXOR[i][j]) continue;
        outContent += `m${i} XOR m${j}\n` + dump.u8a(crossXOR[i][j]) + `\n\n`;
      }
    }
    // To remove the last two line-break chars
    return outContent.length >= 2 ? outContent.slice(0, -2) : outContent;
  },

  guessedKey: (guessedKey: Uint8Array): string => u8aToHexStr(guessedKey),

  guessedMsgs: (guessedMsgs: string[]): string =>
    guessedMsgs
      .map((msg, idx) => {
        const prefix = `msg ${String(idx).padStart(String(guessedMsgs.length).length, "0")}: `;
        return prefix + msg;
      })
      .join("\n"),
};

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

function visibleAlphabetCnt(arr: Uint8Array[], pos: number): number {
  const codePts: number[] = arr.map((el) => el.at(pos) || 0);
  return codePts.reduce((memo, p) => (p >= 64 && p <= 126 ? memo + 1 : memo), 0);
}

function selectSurface(crossXOR: Uint8Array[][], idx: number): Uint8Array[] {
  const res = [];
  for (let i = 0; i < crossXOR.length; i++) {
    if (i === idx) continue;
    res.push(i > idx ? crossXOR[idx][i] : crossXOR[i][idx]);
  }
  return res;
}

function replaceChar(inputStr: string, replaceAt: number, replacement: string): string {
  return inputStr.slice(0, replaceAt) + replacement + inputStr.slice(replaceAt + 1);
}

function getCrossXOR(cipherU8a: Uint8Array[]): Uint8Array[][] {
  const crossXOR: Uint8Array[][] = new Array(cipherU8a.length);

  for (let i = 0; i < cipherU8a.length; i++) {
    crossXOR[i] = crossXOR[i] || [];

    for (let j = i + 1; j < cipherU8a.length; j++) {
      crossXOR[i][j] = bitXOR(cipherU8a[i], cipherU8a[j], {
        equalizeLen: "trim",
        direction: "toRight",
      });
    }
  }
  return crossXOR;
}

function getKnownKey(cipherU8a: Uint8Array[], knowledge: Knowledge): [Uint8Array, Uint8Array] {
  cipherU8a;
  knowledge;
  return [new Uint8Array(), new Uint8Array()];
}

function decipherMsgs(
  ciphertexts: string[],
  knowledge: Knowledge | undefined,
): [string[], Uint8Array] {
  const cipherU8a = ciphertexts.map((c) => hexStrToU8a(c));
  const threshold = Math.floor(ciphertexts.length * ALPHABET_CNT_THRESHOLD_PC);
  const maxTextLen: number = ciphertexts.reduce((memo, c) => Math.max(memo, c.length), 0);
  const keyLen = maxTextLen / 2;

  debug(
    `# of ciphertexts: ${ciphertexts.length}. Threshold: ${threshold}. MaxTextLen: ${maxTextLen}\n`,
  );
  debug(`input ciphers:\n${dump.inputCiphers(ciphertexts)}\n`);

  const crossXOR: Uint8Array[][] = getCrossXOR(cipherU8a);

  debugLv2(`CrossXOR:\n${dump.crossXOR(crossXOR)}\n`);

  const [knownKey, knownBytes]: [Uint8Array, Uint8Array] = knowledge
    ? getKnownKey(cipherU8a, knowledge)
    : [new Uint8Array(keyLen), new Uint8Array(keyLen)];

  debug(`known key:\n${dump.u8a(knownKey)}`);
  debug(`known bytes:\n${dump.u8a(knownBytes)}\n`);

  const guessedMsgs: string[] = cipherU8a.map((c) => UNPRINTABLE_CHAR.repeat(c.length));
  const guessedKey = new Uint8Array(knownKey);

  // Fill in the [guessedMsgs, guessedKey] first with knownKey and knownBytes

  for (let kIdx = 0; kIdx < keyLen; kIdx++) {
    const knownByte = knownBytes.at(kIdx);
    if (knownByte === undefined || knownByte === 0) continue;

    // Set guessedMsgs
    guessedMsgs.forEach((gm, mIdx) => {
      if (kIdx >= cipherU8a.length) return;

      guessedMsgs[mIdx] = replaceChar(
        gm,
        kIdx,
        String.fromCodePoint(cipherU8a[mIdx].at(kIdx)! ^ knownKey.at(kIdx)!),
      );
    });
  }

  debug(`guessedMsgs after integrate with knowledge:\n${dump.guessedMsgs(guessedMsgs)}\n`);

  // Guess the messages based on the crossXOR

  for (let i = 0; i < crossXOR.length; i++) {
    const surface: Uint8Array[] = selectSurface(crossXOR, i);
    debugLv2(`surface:`, dump.u8aArr(surface));

    const maxSurfaceLen = surface.reduce((memo, s) => Math.max(memo, s.length), 0);

    for (let strOffset = 0; strOffset < maxSurfaceLen; strOffset++) {
      if (visibleAlphabetCnt(surface, strOffset) < threshold) continue;

      debugLv2(
        `i: ${i}, strOffset: ${strOffset}, alphabetCnt: ${visibleAlphabetCnt(surface, strOffset)}`,
      );

      // 1. we mark the location for that guessedMsgs be " ", space.
      guessedMsgs[i] = replaceChar(guessedMsgs[i], strOffset, SPACE_CHAR);

      // 2. we mark the rest of guessedMsgs in that position be the alphabet
      for (let j = 0; j < surface.length; j++) {
        const codePt = bitXOR(
          Uint8Array.from([surface[j].at(strOffset) as number]),
          Uint8Array.from([SPACE_CODEPOINT]),
        ).at(0) as number;
        const msgIdx = j >= i ? j + 1 : j;

        guessedMsgs[msgIdx] = replaceChar(
          guessedMsgs[msgIdx],
          strOffset,
          codePt && codePt >= 64 && codePt <= 126 ? String.fromCodePoint(codePt) : UNPRINTABLE_CHAR,
        );
      }

      // 3. we mark the streamed cipherkey on that position
      const keyBytes = bitXOR(
        Uint8Array.from([cipherU8a[i].at(strOffset) as number]),
        Uint8Array.from([SPACE_CODEPOINT]),
      );

      debugLv2(`Set keypos ${strOffset} from val: ${guessedKey.at(strOffset)} to ${keyBytes}`);

      guessedKey.set(keyBytes, strOffset);
    } // end of the while(inbound) { /* ... */ } loop

    debug(
      `iteration ${i}\nguessedMsgs\n${dump.guessedMsgs(guessedMsgs)}\n` +
        `guessedKey\n${dump.guessedKey(guessedKey)}\n`,
    );
  }

  return [guessedMsgs, guessedKey];
}

export {
  hexStrToU8a,
  utf8ToHexStr,
  hexStrToUtf8,
  u8aToHexStr,
  intArrToU8a,
  u8aToIntArr,
  u8aToUtf8,
  utf8ToU8a,
  bitXOR,
  decipherMsgs,
};

export type { IBitXOROptions, Knowledge };
