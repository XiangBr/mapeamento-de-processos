#!/usr/bin/env node
// Gera o processo.md completo a partir do processo.json.
//
//   node gerar_md.mjs processo.json [saida.md]
//
// O .md e o .drawio saem do mesmo JSON, então nunca contam histórias diferentes.
// O texto de análise (diagnóstico, por que automatizar) vem dos campos do JSON;
// o resto (requisitos de cada passo, regras, mapa de informações, sistemas,
// checagem de furos, prontidão pra agente) é montado aqui.
//
// Sem dependências. Node 18+.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ACESSO, STATUS_REGRA, TIPOS_REGRA, carregar, checar, chave, destino, indices, origem, passagens, prontidao } from "./lib/processo.mjs";

const [, , entrada, saidaArg] = process.argv;
if (!entrada) {
  console.error("uso: node gerar_md.mjs processo.json [saida.md]");
  process.exit(1);
}

function main() {
  const { proc, erros } = carregar(entrada);
  if (erros.length) {
    console.error("processo.json com problema:\n- " + erros.join("\n- "));
    process.exit(1);
  }
  const saida = saidaArg || join(dirname(entrada), "processo.md");
  writeFileSync(saida, montar(proc), "utf8");
  console.log(saida);
}

function montar(p) {
  const idx = indices(p);
  const avisos = checar(p);
  const ref = (id) => `passo ${p.porId[id].n} (${p.porId[id].titulo})`;
  const refs = (ids) => ids.map(ref).join(", ");
  const partes = [];
  const sec = (titulo, corpo) => {
    if (corpo && corpo.trim()) partes.push(`## ${titulo}\n\n${corpo.trim()}\n`);
  };

  // ------------------------------------------------ cabeçalho
  const cab = [`# ${p.nome}`, ""];
  if (p.objetivo) cab.push(p.objetivo, "");
  const ficha = [
    ["Começa quando", p.gatilho],
    ["Termina com", p.resultado],
    ["Frequência", p.frequencia],
    ["Responsável", p.dono],
    ["Quem participa", p.responsaveis.join(", ")],
    ["Ferramentas", p.ferramentas.map((f) => f.nome).join(", ")],
  ].filter(([, v]) => v);
  cab.push(...ficha.map(([k, v]) => `- **${k}:** ${v}`));
  partes.push(cab.join("\n") + "\n");

  sec("Diagnóstico", p.diagnostico);

  // ------------------------------------------------ passo a passo
  sec("Passo a passo", p.passos.map((s) => {
    const meta = [s.responsavel, s.ferramenta].filter(Boolean).join(", ");
    const linhas = [`${s.n}. **${s.titulo}**${meta ? ` (${meta})` : ""}`];
    const corpo = [];
    if (s.descricao) corpo.push(s.descricao);
    if (s.tempo === "?") corpo.push("Não se sabe quanto tempo leva.");
    else if (s.tempo) corpo.push(`Leva ${s.tempo}.`);
    if (s.nota) corpo.push(s.nota);
    if (s.tipo === "decisao" || s.proximo.length > 1) {
      for (const prox of s.proximo) {
        const regra = prox.regra ? ` (regra ${prox.regra})` : "";
        corpo.push(`${prox.rotulo ? `Se ${prox.rotulo}` : "Ou"}, vai pro ${ref(prox.para)}${regra}.`);
      }
    } else if (s.proximo.length === 1 && p.porId[s.proximo[0].para].n !== s.n + 1) {
      corpo.push(`Segue pro ${ref(s.proximo[0].para)}.`);
    }
    if (corpo.length) linhas.push(" ".repeat(`${s.n}. `.length) + corpo.join(" "));
    return linhas.join("\n");
  }).join("\n"));

  // ------------------------------------------------ requisitos de cada passo
  const blocos = [
    "O mínimo que cada passo precisa pra começar, o que ele entrega e como se sabe que terminou. " +
    "\"?\" é o que ainda não foi respondido.",
  ];
  for (const s of p.passos) {
    const temAlgo = s.entradas.length || s.saidas.length || s.pronto_quando || s.regras.length || s.excecoes.length || s.depende_de.length;
    if (!temAlgo) continue;
    const b = [`### ${s.n}. ${s.titulo}`, ""];
    b.push([s.responsavel, s.ferramenta, s.tempo].filter(Boolean).join(" · "), "");

    if (s.entradas.length) {
      b.push("**Precisa ter pra começar**", "");
      b.push(tabela(["O quê", "De onde vem", "Formato", "Mínimo pra começar", "Se faltar"],
        s.entradas.map((it) => {
          const o = origem(p, idx, s, it);
          return [it.item, o.externo || (o.passos.length ? refs(o.passos) : "?"), it.formato || "?", it.minimo.join(", ") || "?", it.se_faltar || "?"];
        })), "");
    }
    if (s.saidas.length) {
      b.push("**Entrega**", "");
      b.push(tabela(["O quê", "Pra quem / onde", "Formato", "Campos"],
        s.saidas.map((it) => {
          const d = destino(p, idx, s, it);
          return [it.item, d.externo || (d.passos.length ? refs(d.passos) : s.tipo === "fim" ? "fim do processo" : "?"), it.formato || "?", it.campos.join(", ") || "?"];
        })), "");
    }
    if (s.tipo !== "inicio" && s.tipo !== "decisao") b.push(`**Pronto quando:** ${s.pronto_quando || "?"}`, "");
    if (s.regras.length) {
      b.push("**Regras**", "", ...s.regras.map((id) => `- ${id}: ${p.regraPorId[id].regra}${statusCurto(p.regraPorId[id])}`), "");
    } else if (s.tipo === "decisao") {
      b.push("**Regras:** nenhum critério registrado (?)", "");
    }
    if (s.excecoes.length) b.push("**Quando dá errado**", "", ...s.excecoes.map((x) => `- ${x.quando}: ${x.faz}`), "");
    if (s.depende_de.length) b.push(`**Depende de:** ${s.depende_de.join("; ")}`, "");
    blocos.push(b.join("\n").trim());
  }
  sec("O que cada passo precisa e entrega", blocos.join("\n\n"));

  // ------------------------------------------------ regras
  if (p.regras.length) {
    const corpo = [
      "Critérios de decisão, validações, cálculos, prazos e permissões. Uma regra que \"existe, mas não está escrita\" vive na cabeça de alguém: funciona até essa pessoa faltar, e um agente não tem como segui-la.",
      "",
      tabela(["#", "Regra", "Tipo", "Onde vale", "Fonte", "Situação"],
        p.regras.map((r) => [r.id, r.regra + (r.exemplo ? ` Ex.: ${r.exemplo}` : ""), TIPOS_REGRA[r.tipo] || "", r.passos.map((id) => p.porId[id].n).join(", "), r.fonte || "", STATUS_REGRA[r.status || "confirmada"]])),
    ];
    sec("Regras de negócio", corpo.join("\n"));
  }

  // ------------------------------------------------ arquitetura
  const arq = [];

  // formato vale o de quem cria; o de quem usa só entra se ninguém disse como nasce
  // uma saída ligada a um "dado" responde tanto pelo nome do dado quanto pelo nome do item
  const itens = new Map();
  const apelido = {};
  for (const s of p.passos) {
    for (const it of s.saidas) {
      const k = chave(it.dado || it.item);
      apelido[chave(it.item)] ??= k;
      apelido[k] ??= k;
    }
  }
  const chaveDo = (it) => (it.dado && apelido[chave(it.dado)]) || apelido[chave(it.item)] || chave(it.dado || it.item);
  const novo = (nome) => ({ nome, nasce: [], usa: [], origens: new Set(), destinos: new Set(), formatoNasce: new Set(), formatoUsa: new Set() });
  for (const s of p.passos) {
    for (const it of s.saidas) {
      const k = chaveDo(it);
      const e = itens.get(k) || novo(it.dado || it.item);
      if (!e.nasce.includes(s.id)) e.nasce.push(s.id);
      if (it.formato) e.formatoNasce.add(it.formato);
      if (it.para && !p.porId[it.para]) e.destinos.add(it.para);
      itens.set(k, e);
    }
  }
  for (const s of p.passos) {
    for (const it of s.entradas) {
      const k = chaveDo(it);
      const e = itens.get(k) || novo(it.dado || it.item);
      if (!e.usa.includes(s.id)) e.usa.push(s.id);
      if (it.formato) e.formatoUsa.add(it.formato);
      if (it.de && !p.porId[it.de]) e.origens.add(it.de);
      itens.set(k, e);
    }
  }
  if (itens.size) {
    arq.push("### Mapa das informações", "", "Em que passo cada informação nasce e em quais é usada. Informação que nasce em texto livre e é usada em vários passos é onde o erro se espalha.", "");
    arq.push(tabela(["Informação", "Nasce em", "Usada em", "Formato"],
      [...itens.values()].map((e) => [
        e.nome,
        [...e.nasce.map((id) => p.porId[id].n), ...e.origens].join(", ") || "?",
        [...e.usa.map((id) => p.porId[id].n), ...e.destinos].join(", ") || "ninguém usa",
        [...(e.formatoNasce.size ? e.formatoNasce : e.formatoUsa)].join("; ") || "?",
      ])), "");
  }

  for (const d of p.dados) {
    arq.push(`### ${d.nome}`, "");
    if (d.descricao) arq.push(d.descricao, "");
    const ficha = [["Fica em", d.onde_fica], ["Quem é dono", d.dono], ["Identificado por", d.chave]].filter(([, v]) => v);
    if (ficha.length) arq.push(...ficha.map(([k, v]) => `- **${k}:** ${v}`), "");
    if (d.campos.length) {
      arq.push(tabela(["Campo", "Obrigatório", "Formato", "Exemplo"],
        d.campos.map((c) => [c.nome, c.obrigatorio === true ? "sim" : c.obrigatorio === false ? "não" : "?", c.formato || "", c.exemplo || ""])), "");
    }
  }

  if (p.ferramentas.length) {
    arq.push("### Sistemas", "", "\"Como acessar\" é o que define se um agente consegue ler e escrever ali sem alguém no meio.", "");
    arq.push(tabela(["Ferramenta", "Pra quê", "Passos", "Como acessar"],
      p.ferramentas.map((f) => [
        f.nome,
        f.uso || "",
        p.passos.filter((s) => s.ferramenta === f.nome).map((s) => s.n).join(", "),
        (f.acesso ? ACESSO[f.acesso] : "?") + (f.obs ? `. ${f.obs}` : ""),
      ])), "");
  }

  const pass = passagens(p);
  if (pass.length) {
    arq.push("### Passagens entre ferramentas", "", "Cada linha é um lugar onde alguém copia informação de um lugar pro outro, ou onde ela se perde.", "");
    arq.push(tabela(["De", "Pra", "O que passa", "Passos"],
      pass.map((pa) => [pa.de, pa.para, pa.itens.join(", ") || "?", `${pa.passoDe.n} → ${pa.passoPara.n}`])), "");
  }
  sec("Arquitetura", arq.join("\n"));

  // ------------------------------------------------ furos
  sec("Furos encontrados na checagem",
    avisos.length
      ? "Conferência automática entre o que cada passo recebe e o que os outros entregam. Cada item é uma pergunta pra levar de volta a quem conhece o processo.\n\n" +
        avisos.map((a) => `- ${a.msg}`).join("\n")
      : "A checagem não achou entrada sem origem, saída sem destino nem decisão sem critério.");

  // ------------------------------------------------ lacunas e dores
  sec("O que ainda não está claro", p.lacunas.map((l) => {
    const extra = [l.passo && p.porId[l.passo] && `passo ${p.porId[l.passo].n}`, l.quem_sabe && `quem deve saber: ${l.quem_sabe}`].filter(Boolean).join("; ");
    return `- ${l.pergunta}${extra ? ` (${extra})` : ""}`;
  }).join("\n"));

  const dores = [
    ...p.passos.filter((s) => s.marcadores.includes("dor")).map((s) => `- **Passo ${s.n}, ${s.titulo}:** ${s.nota || "marcado como ponto de dor"}`),
    ...p.dores.map((d) => `- ${d}`),
  ];
  sec("Onde dói", dores.join("\n"));

  // ------------------------------------------------ automação
  if (p.candidatos_automacao.length) {
    const corpo = [
      "Para cada candidato, a lista de prontidão mostra o que já está definido pra um agente fazer esse passo e o que falta perguntar antes.",
    ];
    for (const c of p.candidatos_automacao) {
      const b = [`### ${c.ideia}`, ""];
      if (c.passo) b.push(`- **Passo:** ${p.porId[c.passo].n}. ${p.porId[c.passo].titulo}`);
      if (c.por_que) b.push(`- **Por quê:** ${c.por_que}`);
      if (c.precisa_antes) b.push(`- **Precisa estar resolvido antes:** ${c.precisa_antes}`);
      if (c.revisao) b.push(`- **Quem revisa:** ${c.revisao}`);
      const pr = prontidao(p, c);
      if (pr.length) {
        b.push("", `**Prontidão: ${pr.filter((x) => x.ok).length} de ${pr.length}**`, "", ...pr.map((x) => `- [${x.ok ? "x" : " "}] ${x.texto}`));
      }
      corpo.push(b.join("\n"));
    }
    sec("Onde faz sentido automatizar", corpo.join("\n\n"));
  }

  sec("Fontes", p.fontes.map((f) => `- ${f}`).join("\n"));

  return partes.join("\n");
}

function statusCurto(r) {
  const st = r.status || "confirmada";
  return st === "confirmada" ? "" : ` (${STATUS_REGRA[st]})`;
}

function tabela(cab, linhas) {
  const cel = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  return [
    `| ${cab.join(" | ")} |`,
    `|${cab.map(() => "---").join("|")}|`,
    ...linhas.map((l) => `| ${l.map(cel).join(" | ")} |`),
  ].join("\n");
}

main();
