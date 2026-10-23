#!/usr/bin/env node
// Confere o processo.json antes de gerar os arquivos.
//
//   node checar.mjs processo.json
//
// Mostra:
//   - erros que impedem gerar (campo faltando, seta pra passo que não existe)
//   - furos: entrada que nenhum passo entrega, saída que ninguém usa,
//     decisão sem critério, a mesma coisa com dois nomes
//   - o que falta pra cada candidato a automação
//
// Cada furo é uma pergunta pra fazer ao usuário. Sai com código 1 só se houver erro.
//
// Sem dependências. Node 18+.

import { carregar, checar, prontidao } from "./lib/processo.mjs";

const [, , entrada] = process.argv;
if (!entrada) {
  console.error("uso: node checar.mjs processo.json");
  process.exit(1);
}

const { proc, erros } = carregar(entrada);
if (erros.length) {
  console.log("ERROS (corrija antes de gerar):\n- " + erros.join("\n- "));
  process.exit(1);
}

const avisos = checar(proc);
console.log(avisos.length ? `FUROS (${avisos.length}):\n- ${avisos.map((a) => a.msg).join("\n- ")}` : "FUROS: nenhum");

for (const c of proc.candidatos_automacao) {
  const pr = prontidao(proc, c);
  if (!pr.length) continue;
  const faltam = pr.filter((x) => !x.ok);
  console.log(`\nAUTOMAÇÃO: ${c.ideia} (${pr.length - faltam.length} de ${pr.length})`);
  for (const x of faltam) console.log(`- falta: ${x.texto}`);
}

const semPronto = proc.passos.filter((s) => (s.tipo === "tarefa" || s.tipo === "espera") && !s.pronto_quando);
const semMinimo = proc.passos.filter((s) => s.entradas.some((it) => !it.minimo.length));
console.log(`\nCOBERTURA: ${proc.passos.length} passos, ${semMinimo.length} com entrada sem mínimo definido, ${semPronto.length} sem critério de pronto, ${proc.regras.length} regras.`);
