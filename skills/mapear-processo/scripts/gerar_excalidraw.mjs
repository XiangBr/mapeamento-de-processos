#!/usr/bin/env node
// Gera um arquivo .excalidraw com o fluxo do processo, a partir do processo.json.
//
//   node gerar_excalidraw.mjs processo.json [saida.excalidraw] [--so-fluxo]
//
// Em cima, o fluxo, no mesmo layout da página "Fluxo" do .drawio: uma faixa por
// responsável, passos numerados da esquerda pra direita, mesmas cores pra dor,
// automação e lacuna. As faixas vêm travadas, pra dar pra arrastar os passos sem
// desmontar o fundo.
//
// Embaixo, painéis com a análise: diagnóstico, o que cada passo crítico precisa e
// entrega, regras de negócio, sistemas, o que não está claro e candidatos a
// automação com a prontidão. Cada cartão é um grupo, então move inteiro.
// --so-fluxo desenha só o fluxo.
//
// Sem dependências. Node 18+.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { calcularLayout } from "./lib/layout.mjs";
import { ACESSO, STATUS_REGRA, TIPOS_REGRA, carregar, prontidao } from "./lib/processo.mjs";

const args = process.argv.slice(2);
const [entrada, saidaArg] = args.filter((a) => !a.startsWith("--"));
const soFluxo = args.includes("--so-fluxo");
if (!entrada) {
  console.error("uso: node gerar_excalidraw.mjs processo.json [saida.excalidraw] [--so-fluxo]");
  process.exit(1);
}

const COR = {
  texto: "#1e1e1e",
  cinza: "#868e96",
  faixa: "#f8f9fa",
  faixaBorda: "#ced4da",
  cabecalho: "#e9ecef",
  dor: "#e03131",
  automacao: "#1971c2",
  automacaoFundo: "#a5d8ff",
};

const FORMA = {
  inicio: { tipo: "ellipse", w: 170, h: 80, fundo: "#b2f2bb", borda: "#2f9e44" },
  fim: { tipo: "ellipse", w: 170, h: 80, fundo: "#e9ecef", borda: "#495057" },
  tarefa: { tipo: "rectangle", w: 180, h: 84, fundo: "#ffffff", borda: "#343a40", redondo: true },
  decisao: { tipo: "diamond", w: 170, h: 120, fundo: "#ffec99", borda: "#f08c00" },
  espera: { tipo: "rectangle", w: 180, h: 72, fundo: "#f8f9fa", borda: "#868e96", redondo: true, tracejado: true },
};

const FONTE = 5; // Excalifont

function main() {
  const { proc, erros } = carregar(entrada);
  if (erros.length) {
    console.error("processo.json com problema:\n- " + erros.join("\n- "));
    process.exit(1);
  }
  const saida = saidaArg || join(dirname(entrada), `${proc.slug}.excalidraw`);
  const cena = {
    type: "excalidraw",
    version: 2,
    source: "mapear-processo",
    elements: desenhar(proc),
    appState: { viewBackgroundColor: "#ffffff", gridSize: null },
    files: {},
  };
  writeFileSync(saida, JSON.stringify(cena, null, 1), "utf8");
  console.log(saida);
}

// ---------------------------------------------------------------- desenho

function desenhar(p) {
  const el = [];
  const { faixas, faixaDe, voltas, coluna, nCol } = calcularLayout(p);
  const CAB = 150;
  const COL = 240;
  const FAIXA_H = 180;
  const TOPO = 120;
  const largura = CAB + 30 + nCol * COL + 30;

  // título
  el.push(texto("titulo", p.nome, 0, 0, { tamanho: 28 }));
  const sub = [p.gatilho && `Começa quando: ${p.gatilho}`, p.resultado && `Termina com: ${p.resultado}`].filter(Boolean).join("\n");
  if (sub) el.push(texto("subtitulo", sub, 0, 44, { tamanho: 16, cor: COR.cinza }));

  // faixas (travadas, desenhadas primeiro pra ficar no fundo)
  faixas.forEach((nome, i) => {
    const y = TOPO + i * FAIXA_H;
    el.push(forma("rectangle", `faixa-${i}`, 0, y, largura, FAIXA_H, { backgroundColor: COR.faixa, strokeColor: COR.faixaBorda, locked: true, roughness: 0 }));
    const cab = forma("rectangle", `faixa-cab-${i}`, 0, y, CAB, FAIXA_H, { backgroundColor: COR.cabecalho, strokeColor: COR.faixaBorda, locked: true, roughness: 0 });
    el.push(cab, ...rotuloDentro(cab, nome, { tamanho: 18, locked: true }));
  });

  // passos
  const caixa = {};
  for (const s of p.passos) {
    const f = FORMA[s.tipo];
    const m = new Set(s.marcadores);
    const x = CAB + 30 + coluna[s.id] * COL + (COL - f.w) / 2;
    const y = TOPO + faixaDe(s) * FAIXA_H + (FAIXA_H - f.h) / 2;
    const extra = {
      backgroundColor: f.fundo,
      strokeColor: f.borda,
      roundness: f.redondo ? { type: 3 } : f.tipo === "rectangle" ? null : { type: 2 },
      strokeStyle: f.tracejado ? "dashed" : "solid",
    };
    if (m.has("automacao")) Object.assign(extra, { backgroundColor: COR.automacaoFundo, strokeColor: COR.automacao });
    if (m.has("dor")) Object.assign(extra, { strokeColor: COR.dor, strokeWidth: 2 });
    if (m.has("lacuna")) extra.strokeStyle = "dotted";

    const forma_ = forma(f.tipo, s.id, x, y, f.w, f.h, extra);
    caixa[s.id] = forma_;
    el.push(forma_, ...rotuloDentro(forma_, `${s.n}. ${s.titulo}` + (m.has("lacuna") ? " (?)" : ""), { tamanho: 16 }));
    if (s.ferramenta) {
      const t = texto(`${s.id}-ferr`, s.ferramenta, 0, y + f.h + 6, { tamanho: 13, cor: COR.cinza });
      t.x = x + (f.w - t.width) / 2;
      el.push(t);
    }
  }

  // setas. Numa decisão, cada saída usa um lado do losango, como no draw.io
  const ladoDe = {};
  for (const s of p.passos.filter((x) => x.tipo === "decisao")) {
    const usados = new Set();
    for (const prox of s.proximo) {
      if (voltas.has(`${s.id}>${prox.para}`)) continue;
      const delta = faixaDe(p.porId[prox.para]) - faixaDe(s);
      const preferido = delta > 0 ? "baixo" : delta < 0 ? "cima" : "direita";
      const lado = [preferido, "direita", "baixo", "cima"].find((l) => !usados.has(l));
      usados.add(lado);
      ladoDe[`${s.id}>${prox.para}`] = lado;
    }
  }

  let n = 0;
  for (const s of p.passos) {
    for (const prox of s.proximo) {
      const a = caixa[s.id];
      const b = caixa[prox.para];
      const volta = voltas.has(`${s.id}>${prox.para}`);
      const lado = ladoDe[`${s.id}>${prox.para}`] || "direita";
      const cy = (r) => r.y + r.height / 2;
      const cx = (r) => r.x + r.width / 2;
      let pts;
      let rotuloEm;
      if (volta) {
        const yTopo = Math.min(a.y, b.y) - 28;
        pts = [[cx(a), a.y], [cx(a), yTopo], [cx(b), yTopo], [cx(b), b.y]];
        rotuloEm = [(cx(a) + cx(b)) / 2, yTopo - 22];
      } else if (lado === "baixo" || lado === "cima") {
        const ySai = lado === "baixo" ? a.y + a.height : a.y;
        pts = [[cx(a), ySai], [cx(a), cy(b)], [b.x, cy(b)]];
        rotuloEm = [cx(a) + 8, lado === "baixo" ? ySai + 6 : ySai - 24];
      } else if (Math.abs(cy(a) - cy(b)) < 1) {
        pts = [[a.x + a.width, cy(a)], [b.x, cy(b)]];
        rotuloEm = [a.x + a.width + 8, cy(a) - 24];
      } else {
        const xMeio = (a.x + a.width + b.x) / 2;
        pts = [[a.x + a.width, cy(a)], [xMeio, cy(a)], [xMeio, cy(b)], [b.x, cy(b)]];
        rotuloEm = [a.x + a.width + 8, cy(a) - 24];
      }
      const id = `seta-${++n}`;
      el.push(seta(id, pts, a, b, volta));
      a.boundElements.push({ type: "arrow", id });
      b.boundElements.push({ type: "arrow", id });
      const rot = [prox.rotulo, prox.regra && `(${prox.regra})`].filter(Boolean).join(" ");
      if (rot) el.push(texto(`${id}-rot`, rot, rotuloEm[0], rotuloEm[1], { tamanho: 14, cor: COR.texto }));
    }
  }

  // legenda
  const yLeg = TOPO + faixas.length * FAIXA_H + 40;
  const itens = [
    ["Passo", FORMA.tarefa, {}],
    ["Decisão", FORMA.decisao, {}],
    ["Espera", FORMA.espera, {}],
    ["Ponto de dor", FORMA.tarefa, { strokeColor: COR.dor, strokeWidth: 2 }],
    ["Candidato a automação", FORMA.tarefa, { backgroundColor: COR.automacaoFundo, strokeColor: COR.automacao }],
    ["Ainda não está claro (?)", FORMA.tarefa, { strokeStyle: "dotted" }],
  ];
  itens.forEach(([nome, f, extra], i) => {
    const r = forma(f.tipo, `leg-${i}`, CAB + 30 + i * 170, yLeg, 150, 50, {
      backgroundColor: f.fundo,
      strokeColor: f.borda,
      roundness: f.redondo ? { type: 3 } : f.tipo === "rectangle" ? null : { type: 2 },
      strokeStyle: f.tracejado ? "dashed" : "solid",
      ...extra,
    });
    el.push(r, ...rotuloDentro(r, nome, { tamanho: 13 }));
  });
  el.push(texto("leg-nota", "O que cada passo precisa e entrega, as regras e os sistemas estão no processo.md e nas outras páginas do .drawio.",
    CAB + 30, yLeg + 66, { tamanho: 14, cor: COR.cinza }));

  // largura fixa: num fluxo comprido, cartão da largura do fluxo fica ilegível
  if (!soFluxo) el.push(...paineis(p, yLeg + 160, 2000));
  return el;
}

// ---------------------------------------------------------------- painéis de análise

function paineis(p, y0, largura) {
  const el = [];
  let y = y0;
  const GAP = 24;

  const secao = (titulo, subtitulo) => {
    el.push(texto(`sec-${y}`, titulo, 0, y, { tamanho: 28 }));
    if (subtitulo) el.push(texto(`sec-sub-${y}`, subtitulo, 0, y + 40, { tamanho: 16, cor: COR.cinza }));
    y += subtitulo ? 80 : 50;
  };

  // cartões em colunas, cada um entra na coluna mais baixa
  const grade = (cartoes, nCols) => {
    const w = (largura - GAP * (nCols - 1)) / nCols;
    const alturas = Array(nCols).fill(y);
    for (const c of cartoes) {
      const col = alturas.indexOf(Math.min(...alturas));
      const { elementos, altura } = cartao(c, col * (w + GAP), alturas[col], w);
      el.push(...elementos);
      alturas[col] += altura + GAP;
    }
    y = Math.max(...alturas) + 40;
  };

  if (p.diagnostico) {
    secao("Diagnóstico");
    const paragrafos = p.diagnostico.split(/\n\s*\n/);
    grade(paragrafos.map((par, i) => ({ id: `diag-${i}`, linhas: [par], fundo: "#fff9db", borda: "#f08c00", tamanho: 18 })), Math.min(3, paragrafos.length));
  }

  const criticos = p.passos.filter((s) => s.tipo === "decisao" || s.marcadores.includes("dor") || s.marcadores.includes("automacao"));
  if (criticos.length) {
    secao("O que cada passo crítico precisa e entrega", "Passos com decisão, dor ou candidato a automação. \"?\" é o que ainda falta perguntar.");
    grade(criticos.map((s) => {
      const m = new Set(s.marcadores);
      const linhas = [];
      if (s.entradas.length) linhas.push("Precisa ter:", ...s.entradas.map((it) => `• ${it.item} (mínimo: ${it.minimo.join(", ") || "?"})`));
      if (s.saidas.length) linhas.push("Entrega:", ...s.saidas.map((it) => `• ${it.item}`));
      if (s.tipo !== "decisao") linhas.push(`Pronto quando: ${s.pronto_quando || "?"}`);
      if (s.regras.length) linhas.push(`Regras: ${s.regras.join(", ")}`);
      else if (s.tipo === "decisao") linhas.push("Critério: ?");
      if (s.tempo) linhas.push(`Tempo: ${s.tempo}`);
      return {
        id: `req-${s.id}`,
        titulo: `${s.n}. ${s.titulo}`,
        sub: [s.responsavel, s.ferramenta].filter(Boolean).join(" · "),
        linhas,
        fundo: m.has("automacao") ? "#e7f5ff" : s.tipo === "decisao" ? "#fff9db" : "#ffffff",
        borda: m.has("dor") ? COR.dor : m.has("automacao") ? COR.automacao : "#f08c00",
      };
    }), 4);
  }

  if (p.regras.length) {
    secao("Regras de negócio", "Em vermelho, as que vivem na cabeça de alguém ou que ninguém soube dizer. É o que um agente ainda não consegue seguir.");
    grade(p.regras.map((rg) => {
      const st = rg.status || "confirmada";
      const fraca = st !== "confirmada";
      return {
        id: `regra-${rg.id}`,
        titulo: `${rg.id} · ${TIPOS_REGRA[rg.tipo] || "regra"}`,
        sub: `${STATUS_REGRA[st]} · passo ${rg.passos.map((id) => p.porId[id].n).join(", ")}`,
        linhas: [rg.regra, ...(rg.exemplo ? [`Ex.: ${rg.exemplo}`] : [])],
        fundo: fraca ? "#fff5f5" : "#ebfbee",
        borda: fraca ? COR.dor : "#2f9e44",
      };
    }), 4);
  }

  if (p.ferramentas.length) {
    secao("Sistemas", "Verde: um agente consegue ler e escrever. Vermelho: só na mão, ou ninguém sabe.");
    grade(p.ferramentas.map((f, i) => {
      const ok = ["api", "integracao", "exportacao"].includes(f.acesso);
      return {
        id: `sis-${i}`,
        titulo: f.nome,
        sub: f.acesso ? ACESSO[f.acesso] : "acesso não perguntado",
        linhas: [f.uso, f.obs, `Passos: ${p.passos.filter((s) => s.ferramenta === f.nome).map((s) => s.n).join(", ") || "nenhum"}`].filter(Boolean),
        fundo: ok ? "#ebfbee" : "#fff5f5",
        borda: ok ? "#2f9e44" : COR.dor,
      };
    }), 5);
  }

  if (p.lacunas.length) {
    secao("O que ainda não está claro", "Cada nota é uma pergunta pra levar de volta a quem conhece o processo.");
    grade(p.lacunas.map((l, i) => ({
      id: `lac-${i}`,
      linhas: [l.pergunta, [l.quem_sabe && `quem sabe: ${l.quem_sabe}`, l.passo && p.porId[l.passo] && `passo ${p.porId[l.passo].n}`].filter(Boolean).join(" · ")].filter(Boolean),
      fundo: "#ffec99",
      borda: "#f08c00",
    })), 5);
  }

  if (p.candidatos_automacao.length) {
    secao("Onde faz sentido automatizar", "Prontidão: o que já está definido pra um agente fazer o passo, e o que falta.");
    grade(p.candidatos_automacao.map((c, i) => {
      const pr = prontidao(p, c);
      const passo = p.porId[c.passo];
      return {
        id: `auto-${i}`,
        titulo: c.ideia,
        sub: [passo && `passo ${passo.n}`, pr.length && `prontidão ${pr.filter((x) => x.ok).length} de ${pr.length}`].filter(Boolean).join(" · "),
        linhas: [
          ...(c.por_que ? [`Por quê: ${c.por_que}`] : []),
          ...(c.precisa_antes ? [`Antes: ${c.precisa_antes}`] : []),
          ...pr.map((x) => `${x.ok ? "[ok]" : "[falta]"} ${x.texto}`),
        ],
        fundo: "#e7f5ff",
        borda: COR.automacao,
      };
    }), 3);
  }
  return el;
}

function cartao({ id, titulo, sub, linhas, fundo, borda, tamanho = 15 }, x, y, w) {
  const PAD = 16;
  const util = w - PAD * 2;
  const grupo = `g-${id}`;
  const partes = [];
  let cy = y + PAD;
  if (titulo) {
    const t = texto(`${id}-tit`, quebrar(titulo, util, 20), x + PAD, cy, { tamanho: 20 });
    partes.push(t);
    cy += t.height + 4;
  }
  if (sub) {
    const t = texto(`${id}-sub`, quebrar(sub, util, 14), x + PAD, cy, { tamanho: 14, cor: COR.cinza });
    partes.push(t);
    cy += t.height + 8;
  }
  linhas.forEach((l, i) => {
    const t = texto(`${id}-l${i}`, quebrar(l, util, tamanho), x + PAD, cy, { tamanho });
    partes.push(t);
    cy += t.height + 6;
  });
  const altura = cy - y + PAD - 6;
  const caixa = forma("rectangle", `${id}-box`, x, y, w, altura, { backgroundColor: fundo, strokeColor: borda, roundness: { type: 3 }, groupIds: [grupo] });
  for (const t of partes) t.groupIds = [grupo];
  return { elementos: [caixa, ...partes], altura };
}

// ---------------------------------------------------------------- elementos

let semente = 1000;
const proxSemente = () => (semente = (semente * 48271) % 2147483647);

function forma(tipo, id, x, y, w, h, extra = {}) {
  return {
    id,
    type: tipo,
    x: r(x),
    y: r(y),
    width: r(w),
    height: r(h),
    angle: 0,
    strokeColor: COR.texto,
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: proxSemente(),
    version: 1,
    versionNonce: proxSemente(),
    isDeleted: false,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
    ...extra,
  };
}

function texto(id, conteudo, x, y, { tamanho = 16, cor = COR.texto, largura = 0, alinhar = "left", containerId = null, original = conteudo, locked = false } = {}) {
  const linhas = conteudo.split("\n");
  const w = largura || Math.max(...linhas.map((l) => medir(l, tamanho)));
  return {
    ...forma("text", id, x, y, w, linhas.length * tamanho * 1.25, { strokeColor: cor, locked }),
    text: conteudo,
    originalText: original,
    fontSize: tamanho,
    fontFamily: FONTE,
    textAlign: alinhar,
    verticalAlign: containerId ? "middle" : "top",
    containerId,
    lineHeight: 1.25,
    autoResize: true,
  };
}

// texto preso dentro de uma forma: quebra as linhas pra caber e centraliza
function rotuloDentro(container, conteudo, { tamanho, locked = false }) {
  const util = {
    rectangle: container.width - 20,
    ellipse: container.width * 0.7 - 10,
    diamond: container.width * 0.5,
  }[container.type];
  const quebrado = quebrar(conteudo, util, tamanho);
  const t = texto(`${container.id}-txt`, quebrado, 0, 0, { tamanho, alinhar: "center", containerId: container.id, original: conteudo, locked });
  t.x = r(container.x + (container.width - t.width) / 2);
  t.y = r(container.y + (container.height - t.height) / 2);
  container.boundElements.push({ type: "text", id: t.id });
  return [t];
}

function seta(id, pts, de, para, volta) {
  const [x0, y0] = pts[0];
  const rel = pts.map(([x, y]) => [r(x - x0), r(y - y0)]);
  const xs = rel.map((p) => p[0]);
  const ys = rel.map((p) => p[1]);
  return {
    ...forma("arrow", id, x0, y0, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), {
      strokeColor: "#495057",
      strokeStyle: volta ? "dashed" : "solid",
      roughness: 0,
    }),
    points: rel,
    lastCommittedPoint: null,
    startBinding: { elementId: de.id, focus: 0, gap: 1 },
    endBinding: { elementId: para.id, focus: 0, gap: 1 },
    startArrowhead: null,
    endArrowhead: "arrow",
    elbowed: false,
  };
}

// largura aproximada da Excalifont: o suficiente pra quebrar linha sem estourar a caixa
function medir(s, tamanho) {
  return Math.ceil(s.length * tamanho * 0.58);
}

function quebrar(s, largura, tamanho) {
  if (s.includes("\n")) return s.split("\n").map((l) => quebrar(l, largura, tamanho)).join("\n");
  const linhas = [];
  let atual = "";
  for (const palavra of s.split(/\s+/)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (atual && medir(tentativa, tamanho) > largura) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = tentativa;
    }
  }
  if (atual) linhas.push(atual);
  return linhas.join("\n");
}

const r = (n) => Math.round(n);

main();
