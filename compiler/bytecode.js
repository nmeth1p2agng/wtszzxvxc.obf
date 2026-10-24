// bytecode_TAMBAH.js.txt
"use strict";

function emit(ir) {
  const code = ir.instructions.map((ins) => {
    switch (ins.op) {
      case "CONST": return ["CONST", ins.dst, ins.constant];
      case "ADD": case "SUB": case "MUL": case "DIV": case "CONCAT":
        return [ins.op, ins.dst, ins.left, ins.right];
      case "PRINT": return ["PRINT", ins.src];
      case "RETURN": return ["RETURN", ins.src];
      default: throw new Error(`IR opcode tidak dikenal: ${ins.op}`);
    }
  });
  return { version: 1, constants: ir.constants, registerCount: ir.registerCount, code };
}

if (typeof module !== "undefined") module.exports = { emit };
