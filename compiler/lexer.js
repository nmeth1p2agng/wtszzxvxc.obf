// lexer_TAMBAH.js.txt
"use strict";

function lex(source) {
  if (typeof source !== "string") throw new TypeError("Source harus berupa string.");
  if (source.length > 200000) throw new Error("Source terlalu panjang (maksimum 200 KB).");

  const tokens = [];
  let i = 0;
  const push = (type, value, at) => tokens.push({ type, value, at });

  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) { i++; continue; }

    // Komentar satu baris Luau/Lua.
    if (ch === "-" && source[i + 1] === "-") {
      i += 2;
      while (i < source.length && source[i] !== "\n") i++;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(source[i + 1] || ""))) {
      const at = i;
      const match = source.slice(i).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!match) throw new Error(`Angka tidak valid pada posisi ${i}.`);
      const value = Number(match[0]);
      if (!Number.isFinite(value)) throw new Error(`Angka tidak valid pada posisi ${i}.`);
      push("number", value, at);
      i += match[0].length;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const at = i;
      const quote = ch;
      i++;
      let value = "";
      let closed = false;
      while (i < source.length) {
        const c = source[i++];
        if (c === quote) { closed = true; break; }
        if (c === "\\") {
          if (i >= source.length) break;
          const esc = source[i++];
          const map = { n: "\n", r: "\r", t: "\t", "\\": "\\", "'": "'", '"': '"' };
          value += Object.prototype.hasOwnProperty.call(map, esc) ? map[esc] : esc;
        } else {
          value += c;
        }
      }
      if (!closed) throw new Error(`String tidak ditutup pada posisi ${at}.`);
      push("string", value, at);
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      const at = i;
      const match = source.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/)[0];
      push("identifier", match, at);
      i += match.length;
      continue;
    }

    if (source.slice(i, i + 2) === "..") {
      push("operator", "..", i); i += 2; continue;
    }
    if ("+-*/()=;".includes(ch)) {
      push("operator", ch, i); i++; continue;
    }
    throw new Error(`Karakter tidak didukung '${ch}' pada posisi ${i}.`);
  }

  push("eof", "", source.length);
  return tokens;
}

if (typeof module !== "undefined") module.exports = { lex };
