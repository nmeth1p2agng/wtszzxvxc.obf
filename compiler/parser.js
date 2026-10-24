// parser_TAMBAH.js.txt
"use strict";

// Grammar subset:
// chunk := statement*
// statement := "local" IDENT "=" expr
//            | IDENT "=" expr
//            | "print" "(" expr ")"
//            | "return" expr
//            | expr
// expr := concat; concat := add (".." add)*
// add := mul (("+"|"-") mul)*
// mul := unary (("*"|"/") unary)*
// unary := "-" unary | primary
// primary := NUMBER | STRING | IDENT | "(" expr ")"

function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];
  const is = (value) => peek().value === value;
  const expect = (value) => {
    if (!is(value)) throw new Error(`Diharapkan '${value}' pada posisi ${peek().at}.`);
    return take();
  };
  const identifier = () => {
    if (peek().type !== "identifier") throw new Error(`Diharapkan nama variabel pada posisi ${peek().at}.`);
    return take().value;
  };

  function primary() {
    const t = take();
    if (t.type === "number" || t.type === "string") return { kind: "literal", value: t.value };
    if (t.type === "identifier") return { kind: "variable", name: t.value };
    if (t.value === "(") {
      const e = expression();
      expect(")");
      return e;
    }
    throw new Error(`Ekspresi tidak valid pada posisi ${t.at}.`);
  }
  function unary() {
    if (is("-")) { take(); return { kind: "unary", op: "-", value: unary() }; }
    return primary();
  }
  function binary(next, ops) {
    let left = next();
    while (ops.includes(peek().value)) {
      const op = take().value;
      left = { kind: "binary", op, left, right: next() };
    }
    return left;
  }
  function multiply() { return binary(unary, ["*", "/"]); }
  function add() { return binary(multiply, ["+", "-"]); }
  function concat() { return binary(add, [".."]); }
  function expression() { return concat(); }

  const body = [];
  while (peek().type !== "eof") {
    if (is(";")) { take(); continue; }

    if (is("local")) {
      take();
      const name = identifier();
      expect("=");
      body.push({ kind: "assign", name, value: expression(), local: true });
    } else if (peek().type === "identifier" && tokens[pos + 1]?.value === "=") {
      const name = take().value;
      take();
      body.push({ kind: "assign", name, value: expression(), local: false });
    } else if (is("print")) {
      take(); expect("(");
      const value = expression();
      expect(")");
      body.push({ kind: "print", value });
    } else if (is("return")) {
      take();
      if (peek().type === "eof" || is(";")) {
        body.push({ kind: "return", value: { kind: "literal", value: null } });
      } else {
        body.push({ kind: "return", value: expression() });
      }
      if (is(";")) take();
      if (peek().type !== "eof") throw new Error("Subset compiler mengharuskan return sebagai statement terakhir.");
      break;
    } else {
      body.push({ kind: "expression", value: expression() });
    }

    if (is(";")) take();
    else if (peek().type !== "eof") {
      throw new Error(`Diharapkan ';' atau akhir input pada posisi ${peek().at}.`);
    }
  }
  return { kind: "chunk", body };
}

if (typeof module !== "undefined") module.exports = { parse };
