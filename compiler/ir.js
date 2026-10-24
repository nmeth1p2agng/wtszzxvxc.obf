// ir_TAMBAH.js.txt
"use strict";

// IR sederhana: daftar instruksi simbolik yang kemudian dipetakan ke register VM.
function lower(ast) {
  const instructions = [];
  const constants = [];
  const variables = new Map();
  let nextReg = 0;

  const alloc = () => {
    if (nextReg >= 4096) throw new Error("Batas register VM terlampaui.");
    return nextReg++;
  };
  const constant = (value) => {
    const index = constants.length;
    constants.push(value);
    const dst = alloc();
    instructions.push({ op: "CONST", dst, constant: index });
    return dst;
  };

  function expr(node) {
    if (node.kind === "literal") return constant(node.value);
    if (node.kind === "variable") {
      if (!variables.has(node.name)) throw new Error(`Variabel '${node.name}' belum didefinisikan.`);
      return variables.get(node.name);
    }
    if (node.kind === "unary" && node.op === "-") {
      const zero = constant(0);
      const rhs = expr(node.value);
      const dst = alloc();
      instructions.push({ op: "SUB", dst, left: zero, right: rhs });
      return dst;
    }
    if (node.kind === "binary") {
      const left = expr(node.left);
      const right = expr(node.right);
      const dst = alloc();
      const op = ({ "+": "ADD", "-": "SUB", "*": "MUL", "/": "DIV", "..": "CONCAT" })[node.op];
      if (!op) throw new Error(`Operator tidak didukung: ${node.op}`);
      instructions.push({ op, dst, left, right });
      return dst;
    }
    throw new Error(`Node AST tidak didukung: ${node.kind}`);
  }

  for (const stmt of ast.body) {
    if (stmt.kind === "assign") {
      const src = expr(stmt.value);
      // VM prototype tidak memiliki STORE; assignment memakai alias register.
      variables.set(stmt.name, src);
    } else if (stmt.kind === "print") {
      instructions.push({ op: "PRINT", src: expr(stmt.value) });
    } else if (stmt.kind === "return") {
      instructions.push({ op: "RETURN", src: expr(stmt.value) });
      break;
    } else if (stmt.kind === "expression") {
      expr(stmt.value);
    }
  }

  if (!instructions.length || instructions[instructions.length - 1].op !== "RETURN") {
    const nilReg = constant(null);
    instructions.push({ op: "RETURN", src: nilReg });
  }
  return { constants, instructions, registerCount: Math.max(1, nextReg) };
}

if (typeof module !== "undefined") module.exports = { lower };
