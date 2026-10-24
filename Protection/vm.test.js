const assert = require("node:assert/strict");
const { validateProgram, runVXC } = require("./vm.js");

const program = {
  version: 1,
  constants: [7, 5, "VXC="],
  registerCount: 4,
  code: [
    ["CONST", 0, 0],
    ["CONST", 1, 1],
    ["ADD", 2, 0, 1],
    ["PRINT", 2],
    ["RETURN", 3]
  ]
};

assert.equal(validateProgram(program), true);
const result = runVXC(program);
assert.deepEqual(result.output, ["12"]);
assert.equal(result.returned, undefined);
assert.equal(result.steps, 5);

assert.throws(() => validateProgram({
  version: 1,
  constants: [],
  registerCount: 1,
  code: [["JUMP", 999]]
}), /Invalid instruction/);

assert.throws(() => runVXC({
  version: 1,
  constants: [4, 0],
  registerCount: 2,
  code: [
    ["CONST", 0, 0],
    ["CONST", 1, 1],
    ["DIV", 0, 0, 1]
  ]
}), /Division by zero/);

console.log("VXC VM prototype tests passed.");
