process.env.NODE_ENV = "test";

module.exports = {
  extension: ["ts"],
  spec: "**/*.test.ts",
  require: "ts-node/register",
};
