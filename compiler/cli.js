// cli_TAMBAH.js.txt
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { lex } = require("./lexer.js");
const { parse } = require("./parser.js");
const { lower } = require("./ir.js");
const { emit } = require("./bytecode.js");
const { runVXC } = require("../Protection/vm.js");

function compileSource(source) {
  return emit(lower(parse(lex(source))));
}

function usage() {
  console.log(
    "VXC subset compiler\n" +
    "Usage: node compiler/cli.js <input.lua> [output.json] [--run]\n" +
    "Example: node compiler/cli.js sample.lua sample.vxc.json --run"
  );
}

function main(args) {
  const positional = args.filter((arg) => arg !== "--run");
  const shouldRun = args.includes("--run");

  if (positional.length < 1 || positional.length > 2) {
    usage();
    return positional.length === 0 ? 0 : 2;
  }

  const inputPath = path.resolve(positional[0]);
  const outputPath = positional[1]
    ? path.resolve(positional[1])
    : `${inputPath}.vxc.json`;

  let source;
  try {
    source = fs.readFileSync(inputPath, "utf8");
  } catch (error) {
    throw new Error(`Tidak dapat membaca input '${inputPath}': ${error.message}`);
  }

  const bytecode = compileSource(source);
  fs.writeFileSync(outputPath, `${JSON.stringify(bytecode, null, 2)}\n`, "utf8");
  console.log(`Bytecode tersimpan: ${outputPath}`);
  console.log(`Instruksi: ${bytecode.code.length} | Register: ${bytecode.registerCount}`);

  if (shouldRun) {
    const result = runVXC(bytecode);
    for (const line of result.output) console.log(`[VM print] ${line}`);
    console.log(`[VM return] ${String(result.returned)}`);
    console.log(`[VM steps] ${result.steps}`);
  }
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(`VXC compile error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { compileSource, main };
