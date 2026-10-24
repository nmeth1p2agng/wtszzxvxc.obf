
"use strict";

(function () {
  function compile(source) {
    if (typeof source !== "string") {
      throw new TypeError("Source harus berupa string.");
    }

    // Lexer -> Parser -> IR -> Bytecode
    const tokens = lex(source);
    const ast = parse(tokens);
    const ir = lower(ast);
    const bytecode = emit(ir);

    return bytecode;
  }

  window.VXCCompiler = Object.freeze({
    compile,
    lex,
    parse,
    lower,
    emit
  });
})();
