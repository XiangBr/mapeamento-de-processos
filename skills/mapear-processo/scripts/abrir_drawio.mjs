#!/usr/bin/env node
// Abre um .drawio no editor web do draw.io (app.diagrams.net), sem MCP.
//
//   node abrir_drawio.mjs arquivo.drawio [--nao-abrir]
//
// O diagrama vai comprimido no #create da URL. O que vem depois do # não é
// enviado pro servidor do draw.io: ele só monta o diagrama no seu navegador.
// Lá você salva onde preferir (Google Drive, OneDrive, GitHub ou no computador).
//
// Como a URL pode passar do limite de linha de comando do Windows, o script
// grava um HTML pequeno ao lado do arquivo que redireciona pra ela, e abre esse HTML.
//
// Sem dependências. Node 18+.

import { readFileSync, writeFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { spawn } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const arquivo = args.find((a) => !a.startsWith("--"));
const naoAbrir = args.includes("--nao-abrir");
if (!arquivo) {
  console.error("uso: node abrir_drawio.mjs arquivo.drawio [--nao-abrir]");
  process.exit(1);
}

const xml = readFileSync(arquivo, "utf8");
const base = process.env.DRAWIO_BASE_URL || "https://app.diagrams.net/";

// mesmo formato do @drawio/mcp: deflateRaw(encodeURIComponent(xml)) em base64
const dados = deflateRawSync(Buffer.from(encodeURIComponent(xml), "utf8")).toString("base64");
const create = { type: "xml", compressed: true, data: dados };
const titulo = basename(arquivo);
const url = `${base}?pv=0&grid=0&title=${encodeURIComponent(titulo)}#create=${encodeURIComponent(JSON.stringify(create))}`;

const html = join(dirname(resolve(arquivo)), `abrir-${basename(arquivo, ".drawio")}.html`);
writeFileSync(
  html,
  `<!doctype html><meta charset="utf-8"><title>Abrindo no draw.io</title>
<p style="font-family:sans-serif">Abrindo no draw.io... Se não abrir, <a id="l">clique aqui</a>.</p>
<script>const u=${JSON.stringify(url)};document.getElementById("l").href=u;location.replace(u);</script>
`,
  "utf8"
);

console.log(`html: ${html}`);
console.log(`tamanho da url: ${url.length} caracteres`);

if (!naoAbrir) {
  const [cmd, cmdArgs] =
    process.platform === "win32"
      ? ["cmd", ["/c", "start", "", html]]
      : process.platform === "darwin"
        ? ["open", [html]]
        : ["xdg-open", [html]];
  spawn(cmd, cmdArgs, { detached: true, stdio: "ignore" }).unref();
}
