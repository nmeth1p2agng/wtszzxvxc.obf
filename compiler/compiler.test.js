// compiler.test_TAMBAH.js.txt
"use strict";
const assert = require("node:assert/strict");
const { lex } = require("./lexer.js");
const { parse } = require("./parser.js");
const { lower } = require("./ir.js");
const { emit } = require("./bytecode.js");
const { runVXC } = require("../Protection/vm.js");

function compile(source) {
  return emit(lower(parse(lex(source))));
}

let result = runVXC(compile("local x = 7 + 5; print(x); return x"));
assert.deepEqual(result.output, ["12"]);
assert.equal(result.returned, 12);

result = runVXC(compile('print("VXC" .. " VM"); return 3 * (4 + 2)'));
assert.deepEqual(result.output, ["VXC VM"]);
assert.equal(result.returned, 18);

assert.throws(() => compile("print(missing)"), /belum didefinisikan/);
assert.throws(() => compile("print(1 + )"), /Ekspresi tidak valid/);
console.log("VXC subset compiler tests passed.");
