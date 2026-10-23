#!/usr/bin/env node
// Gera um arquivo .excalidraw com o fluxo do processo, a partir do processo.json.
//
//   node gerar_excalidraw.mjs processo.json [saida.excalidraw]
//
// Mesmo layout da página "Fluxo" do .drawio: uma faixa por responsável, passos da
// esquerda pra direita, mesmas cores pra dor, automação e lacuna. As faixas vêm
// travadas, pra dar pra arrastar os passos sem desmontar o fundo.
//
// Sem dependências. Node 18+.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { calcularLayout } from "./lib/layout.mjs";
import { carregar } from "./lib/processo.mjs";

const [, , entrada, saidaArg] = process.argv;
if (!entrada) {
  console.error("uso: node gerar_excalidraw.mjs processo.json [saida.excalidraw]");
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
    el.push(forma_, ...rotuloDentro(forma_, s.titulo + (m.has("lacuna") ? " (?)" : ""), { tamanho: 16 }));
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

  return el;
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
