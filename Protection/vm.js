/**
 * VXC VM prototype — sistem tambahan.
 * Runtime demo kecil, BUKAN compiler Luau dan bukan VM produksi.
 *
 * Format instruksi:
 * ["CONST", dst, constantIndex]
 * ["MOVE", dst, src]
 * ["ADD"|"SUB"|"MUL"|"DIV", dst, leftReg, rightReg]
 * ["CONCAT", dst, leftReg, rightReg]
 * ["PRINT", src]
 * ["RETURN", src]
 */
"use strict";

const VXC_OPS = new Set([
  "CONST", "MOVE", "ADD", "SUB", "MUL", "DIV", "CONCAT", "PRINT", "RETURN"
]);

function validateProgram(program) {
  if (!program || program.version !== 1) throw new Error("Unsupported VXC bytecode version.");
  if (!Array.isArray(program.constants) || !Array.isArray(program.code)) {
    throw new Error("Malformed bytecode: constants/code must be arrays.");
  }
  if (!Number.isInteger(program.registerCount) ||
      program.registerCount < 1 || program.registerCount > 4096) {
    throw new Error("Malformed bytecode: registerCount must be 1..4096.");
  }
  if (program.code.length > 100000) throw new Error("Bytecode instruction limit exceeded.");

  const validRegister = n =>
    Number.isInteger(n) && n >= 0 && n < program.registerCount;

  for (let pc = 0; pc < program.code.length; pc++) {
    const ins = program.code[pc];
    if (!Array.isArray(ins) || typeof ins[0] !== "string" || !VXC_OPS.has(ins[0])) {
      throw new Error(`Invalid instruction at pc=${pc}.`);
    }

    const op = ins[0];
    const operandCount = {
      CONST: 3, MOVE: 3, ADD: 4, SUB: 4, MUL: 4,
      DIV: 4, CONCAT: 4, PRINT: 2, RETURN: 2
    }[op];

    if (ins.length !== operandCount) throw new Error(`Wrong operand count at pc=${pc}.`);

    if (op === "CONST") {
      if (!validRegister(ins[1]) ||
          !Number.isInteger(ins[2]) ||
          ins[2] < 0 || ins[2] >= program.constants.length) {
        throw new Error(`Invalid CONST operands at pc=${pc}.`);
      }
    } else if (op === "MOVE") {
      if (!validRegister(ins[1]) || !validRegister(ins[2])) {
        throw new Error(`Invalid MOVE registers at pc=${pc}.`);
      }
    } else if (["ADD", "SUB", "MUL", "DIV", "CONCAT"].includes(op)) {
      if (!validRegister(ins[1]) || !validRegister(ins[2]) || !validRegister(ins[3])) {
        throw new Error(`Invalid registers at pc=${pc}.`);
      }
    } else if (!validRegister(ins[1])) {
      throw new Error(`Invalid register at pc=${pc}.`);
    }
  }

  return true;
}

function runVXC(program, options = {}) {
  validateProgram(program);

  const registers = new Array(program.registerCount);
  const output = [];
  const maxSteps = Number.isInteger(options.maxSteps)
    ? Math.max(1, options.maxSteps)
    : 100000;

  let steps = 0;
  let returned;

  for (let pc = 0; pc < program.code.length; pc++) {
    if (++steps > maxSteps) throw new Error("VM instruction budget exceeded.");

    const [op, a, b, c] = program.code[pc];

    switch (op) {
      case "CONST":
        registers[a] = program.constants[b];
        break;
      case "MOVE":
        registers[a] = registers[b];
        break;
      case "ADD":
        registers[a] = registers[b] + registers[c];
        break;
      case "SUB":
        registers[a] = registers[b] - registers[c];
        break;
      case "MUL":
        registers[a] = registers[b] * registers[c];
        break;
      case "DIV":
        if (registers[c] === 0) throw new Error(`Division by zero at pc=${pc}.`);
        registers[a] = registers[b] / registers[c];
        break;
      case "CONCAT":
        registers[a] = String(registers[b]) + String(registers[c]);
        break;
      case "PRINT": {
        const value = String(registers[a]);
        output.push(value);
        if (typeof options.onPrint === "function") options.onPrint(value);
        break;
      }
      case "RETURN":
        returned = registers[a];
        return { output, returned, steps };
      default:
        throw new Error(`Unsupported instruction ${op}.`);
    }
  }

  return { output, returned, steps };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { validateProgram, runVXC };
}
if (typeof globalThis !== "undefined") {
  globalThis.VXCVM = Object.freeze({ validateProgram, runVXC });
}
