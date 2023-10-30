import { expect } from "chai";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

import { readFileBytes, streamHash } from "./lib.js";
import { u8aToHex } from "wk01";

// prettier-ignore
const testBytes = new Uint8Array([
  0, 1, 2, 3, 4,
  5, 6, 7, 8, 9,
]);
const tBDigest = "1f825aa2f0020ef7cf91dfa30da4668d791c5d4824fc8e41354b89ec05795ab3";

const testLongBytes = new Uint8Array([...Array(1025).keys()]);
const tLBDigest = "d61e7c13c5729978f25bcbd1ce2a36cfd0830502ce10250d7233d7cfda5e6646";

describe("readFileBytes()", function () {
  let tdir: string | undefined;
  let tFilePath: string | undefined;

  before(async function () {
    tdir = await mkdtemp(join(tmpdir(), "wk03-"));
    tFilePath = join(tdir, "test");
    await writeFile(tFilePath, testBytes);
  });

  it("works with default parameters", async function () {
    const res = await readFileBytes(tFilePath!);
    expect(res).to.be.eql(testBytes);
  });

  it("works with start and end parameters", async function () {
    const res = await readFileBytes(tFilePath!, 2, 7);
    expect(res).to.be.eql(new Uint8Array([2, 3, 4, 5, 6]));
  });

  after(async () => tdir && (await rm(tdir, { recursive: true, force: true })));
});

describe("streamHash()", function () {
  let tdir: string | undefined;
  let tFilePath: string | undefined;
  let tLgFilePath: string | undefined;
  const testVideo = join(dirname(fileURLToPath(import.meta.url)), "../assets/test.mp4");
  const tVDigest = "03c08f4ee0b576fe319338139c045c89c3e8e9409633bea29442e21425006ea8";

  before(async function () {
    tdir = await mkdtemp(join(tmpdir(), "wk03-"));
    tFilePath = join(tdir, "test");
    await writeFile(tFilePath, testBytes);

    tLgFilePath = join(tdir, "test-lg");
    await writeFile(tLgFilePath, testLongBytes);
  });

  it("works for a small file", async () => {
    expect(u8aToHex(await streamHash(tFilePath as string))).to.be.eql(tBDigest);
  });

  it("works for a large file", async () => {
    expect(u8aToHex(await streamHash(tLgFilePath as string))).to.be.eql(tLBDigest);
  });

  it("works for the test video", async function () {
    expect(u8aToHex(await streamHash(testVideo))).to.be.eql(tVDigest);
  });

  after(async () => tdir && (await rm(tdir, { recursive: true, force: true })));
});
