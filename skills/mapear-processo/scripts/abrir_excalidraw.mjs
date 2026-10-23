#!/usr/bin/env node
// Abre um .excalidraw no excalidraw.com com um clique.
//
//   node abrir_excalidraw.mjs arquivo.excalidraw [--nao-abrir]
//
// Faz o mesmo que o botão "Compartilhar > Link" do Excalidraw: criptografa o
// desenho aqui, no seu computador, manda só o conteúdo criptografado pro
// servidor do Excalidraw e monta o link. A chave fica depois do # no link e
// nunca vai pro servidor. Quem tiver o link consegue abrir, então trate o link
// como o próprio arquivo.
//
// Grava ao lado do arquivo um abrir-<nome>.html que abre o link com dois cliques.
//
// Sem dependências. Node 18+.

import { readFileSync, writeFileSync } from "node:fs";
import { createCipheriv, randomBytes } from "node:crypto";
import { deflateSync } from "node:zlib";
import { spawn } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const arquivo = args.find((a) => !a.startsWith("--"));
const naoAbrir = args.includes("--nao-abrir");
if (!arquivo) {
  console.error("uso: node abrir_excalidraw.mjs arquivo.excalidraw [--nao-abrir]");
  process.exit(1);
}

const BACKEND = process.env.EXCALIDRAW_BACKEND || "https://json.excalidraw.com/api/v2/post/";
const APP = process.env.EXCALIDRAW_APP || "https://excalidraw.com/";

// formato do Excalidraw (packages/excalidraw/data/encode.ts):
// concatBuffers = versão (uint32) e, pra cada pedaço, tamanho (uint32 big-endian) + bytes
function concatBuffers(...bufs) {
  const out = Buffer.alloc(4 + 4 * bufs.length + bufs.reduce((a, b) => a + b.length, 0));
  let c = out.writeUInt32BE(1, 0);
  for (const b of bufs) {
    c = out.writeUInt32BE(b.length, c);
    b.copy(out, c);
    c += b.length;
  }
  return out;
}

async function main() {
  const cena = JSON.parse(readFileSync(arquivo, "utf8"));
  if (cena.type !== "excalidraw") throw new Error(`${arquivo} não parece um arquivo .excalidraw`);

  const chave = randomBytes(16);
  const iv = randomBytes(12);
  const conteudo = concatBuffers(Buffer.from(JSON.stringify(null)), Buffer.from(JSON.stringify(cena)));
  const cifra = createCipheriv("aes-128-gcm", chave, iv);
  const cifrado = Buffer.concat([cifra.update(deflateSync(conteudo)), cifra.final(), cifra.getAuthTag()]);
  const info = Buffer.from(JSON.stringify({ version: 2, compression: "pako@1", encryption: "AES-GCM" }));
  const corpo = concatBuffers(info, iv, cifrado);

  const resp = await fetch(BACKEND, { method: "POST", body: corpo });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || !json.id) {
    throw new Error(`o servidor do Excalidraw recusou (${resp.status}): ${JSON.stringify(json).slice(0, 200)}`);
  }
  const url = `${APP}#json=${json.id},${chave.toString("base64url")}`;

  const html = join(dirname(resolve(arquivo)), `abrir-${basename(arquivo, ".excalidraw")}-excalidraw.html`);
  writeFileSync(
    html,
    `<!doctype html><meta charset="utf-8"><title>Abrindo no Excalidraw</title>
<p style="font-family:sans-serif">Abrindo no Excalidraw... Se não abrir, <a id="l">clique aqui</a>.</p>
<script>const u=${JSON.stringify(url)};document.getElementById("l").href=u;location.replace(u);</script>
`,
    "utf8"
  );

  console.log(`link: ${url}`);
  console.log(`html: ${html}`);

  if (!naoAbrir) {
    const [cmd, cmdArgs] =
      process.platform === "win32"
        ? ["cmd", ["/c", "start", "", html]]
        : process.platform === "darwin"
          ? ["open", [html]]
          : ["xdg-open", [html]];
    spawn(cmd, cmdArgs, { detached: true, stdio: "ignore" }).unref();
  }
}

main().catch((err) => {
  console.error(`não deu pra gerar o link: ${err.message}`);
  console.error(`Abra o arquivo direto: excalidraw.com > menu > Abrir, e escolha ${arquivo}`);
  process.exit(1);
});
