// Replacement test suite for Protection/vm.test.js
// Rename this file to vm.test.js to run: node Protection/vm.test.js
const assert = require("node:assert/strict");
const { validateProgram, runVXC } = require("./vm.js");

const program = {
  version: 1,
  constants: [7, 5, "VXC VM OK"],
  registerCount: 3,
  code: [
    ["CONST", 0, 0],
    ["CONST", 1, 1],
    ["ADD", 2, 0, 1],
    ["PRINT", 2],
    ["CONST", 2, 2],
    ["RETURN", 2]
  ]
};

assert.equal(validateProgram(program), true);
const result = runVXC(program);
assert.deepEqual(result.output, ["12"]);
assert.equal(result.returned, "VXC VM OK");
assert.equal(result.steps, 6);

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

assert.throws(() => runVXC({
  version: 1,
  constants: [1],
  registerCount: 1,
  code: [["CONST", 0, 0], ["PRINT", 0]],
  maxSteps: 1
}, { maxSteps: 1 }), /VM instruction budget exceeded/);

console.log("VXC VM prototype tests passed.");
