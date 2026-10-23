#!/usr/bin/env node
// Gera um arquivo .drawio (4 páginas) a partir do processo.json.
//
//   node gerar_drawio.mjs processo.json [saida.drawio]
//
// Páginas:
//   1. Fluxo              faixas por responsável, passos da esquerda pra direita
//   2. Entradas e saídas  tabela passo a passo: quem, ferramenta, o mínimo que precisa ter, entrega, pronto quando
//   3. Regras             regras de negócio, onde valem e se estão confirmadas (só se houver regras)
//   4. Ferramentas        o que passa de uma ferramenta pra outra
//
// Sem dependências. Node 18+.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { calcularLayout } from "./lib/layout.mjs";
import { ACESSO, STATUS_REGRA, TIPOS_REGRA, carregar, passagens as calcularPassagens } from "./lib/processo.mjs";

const [, , entrada, saidaArg] = process.argv;
if (!entrada) {
  console.error("uso: node gerar_drawio.mjs processo.json [saida.drawio]");
  process.exit(1);
}

function main() {
  const { proc, erros } = carregar(entrada);
  if (erros.length) {
    console.error("processo.json com problema:\n- " + erros.join("\n- "));
    process.exit(1);
  }

  const saida = saidaArg || join(dirname(entrada), `${proc.slug}.drawio`);

  const paginas = [
    { id: "fluxo", nome: "Fluxo", celulas: paginaFluxo(proc) },
    { id: "entradas-saidas", nome: "Entradas e saídas", celulas: paginaTabela(proc) },
  ];
  if (proc.regras.length) paginas.push({ id: "regras", nome: "Regras", celulas: paginaRegras(proc) });
  paginas.push({ id: "ferramentas", nome: "Ferramentas", celulas: paginaFerramentas(proc) });
  const xml = mxfile(paginas);

  writeFileSync(saida, xml, "utf8");
  console.log(saida);
}

// ---------------------------------------------------------------- estilos

const COR = {
  texto: "#263238",
  cinza: "#78909C",
  borda: "#455A64",
  faixa: "#F5F7F8",
  faixaBorda: "#B0BEC5",
  dor: "#D32F2F",
  automacao: "#1565C0",
  automacaoFundo: "#E3F2FD",
};

const TIPOS = {
  inicio: { w: 150, h: 70, estilo: "ellipse;fillColor=#E8F5E9;strokeColor=#2E7D32;spacing=12;" },
  fim: { w: 150, h: 70, estilo: "ellipse;fillColor=#ECEFF1;strokeColor=#37474F;spacing=12;" },
  tarefa: { w: 160, h: 76, estilo: `rounded=1;arcSize=10;fillColor=#FFFFFF;strokeColor=${COR.borda};` },
  decisao: { w: 140, h: 100, estilo: "rhombus;fillColor=#FFF8E1;strokeColor=#F9A825;" },
  espera: { w: 160, h: 66, estilo: `rounded=1;arcSize=50;dashed=1;fillColor=#FAFAFA;strokeColor=${COR.cinza};` },
};

const BASE = `whiteSpace=wrap;html=1;fontSize=12;fontColor=${COR.texto};`;

// ---------------------------------------------------------------- página 1: fluxo

function paginaFluxo(p) {
  const out = [];
  const { passos, porId } = p;

  const { faixas, faixaDe, voltas, coluna, nCol } = calcularLayout(p);
  const CAB = 130; // largura do cabeçalho da faixa
  const COL = 210;
  const FAIXA_H = 150;
  const TOPO = 90;
  const largura = CAB + 30 + nCol * COL + 30;

  // título
  const sub = [p.gatilho && `Começa quando: ${p.gatilho}`, p.resultado && `Termina com: ${p.resultado}`]
    .filter(Boolean)
    .join("<br>");
  out.push(
    celula("titulo", `<b style="font-size:20px">${esc(p.nome)}</b>${sub ? `<br><span style="font-size:12px;color:${COR.cinza}">${escTexto(sub)}</span>` : ""}`,
      `text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;fontColor=${COR.texto};`, 0, 0, largura, 70)
  );

  faixas.forEach((nome, i) => {
    out.push(
      celula(`faixa-${i}`, esc(nome),
        `swimlane;horizontal=0;startSize=${CAB};html=1;whiteSpace=wrap;fontStyle=1;fontSize=13;fontColor=${COR.texto};fillColor=${COR.faixa};strokeColor=${COR.faixaBorda};swimlaneFillColor=#FFFFFF;collapsible=0;`,
        0, TOPO + i * FAIXA_H, largura, FAIXA_H)
    );
  });

  for (const s of passos) {
    const t = TIPOS[s.tipo];
    const m = new Set(s.marcadores);
    let estilo = BASE + t.estilo;
    if (m.has("automacao")) estilo += `fillColor=${COR.automacaoFundo};strokeColor=${COR.automacao};`;
    if (m.has("dor")) estilo += `strokeColor=${COR.dor};strokeWidth=2;`;
    if (m.has("lacuna")) estilo += "dashed=1;dashPattern=4 3;";

    let rotulo = `<b>${esc(s.titulo)}</b>`;
    if (m.has("lacuna")) rotulo += ` <span style="color:${COR.dor}">(?)</span>`;
    if (s.ferramenta) rotulo += `<br><span style="font-size:10px;color:${COR.cinza}">${esc(s.ferramenta)}</span>`;

    const x = CAB + 30 + coluna[s.id] * COL + (COL - t.w) / 2;
    const y = (FAIXA_H - t.h) / 2;
    out.push(celula(s.id, rotulo, estilo, x, y, t.w, t.h, `faixa-${faixaDe(s)}`, dica(s)));
  }

  // numa decisão, cada saída sai por um lado do losango: mesma faixa pela direita,
  // faixa de baixo por baixo, de cima por cima. Lado já usado cai no próximo livre.
  const LADOS = {
    direita: "exitX=1;exitY=0.5;exitDx=0;exitDy=0;",
    baixo: "exitX=0.5;exitY=1;exitDx=0;exitDy=0;",
    cima: "exitX=0.5;exitY=0;exitDx=0;exitDy=0;",
  };
  const ladoDe = {};
  for (const s of passos.filter((x) => x.tipo === "decisao")) {
    const usados = new Set();
    for (const prox of s.proximo || []) {
      if (voltas.has(`${s.id}>${prox.para}`)) continue;
      const delta = faixaDe(porId[prox.para]) - faixaDe(s);
      const preferido = delta > 0 ? "baixo" : delta < 0 ? "cima" : "direita";
      const lado = [preferido, "direita", "baixo", "cima"].find((l) => !usados.has(l));
      usados.add(lado);
      ladoDe[`${s.id}>${prox.para}`] = lado;
    }
  }

  let n = 0;
  for (const s of passos) {
    for (const prox of s.proximo || []) {
      const volta = voltas.has(`${s.id}>${prox.para}`);
      let estilo = `edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeColor=${COR.borda};fontSize=11;fontColor=${COR.texto};labelBackgroundColor=#FFFFFF;`;
      // losango recebe sempre pela esquerda; saída por baixo/cima chega no destino pela esquerda
      const lado = ladoDe[`${s.id}>${prox.para}`];
      if (lado) estilo += LADOS[lado];
      if (!volta && (porId[prox.para].tipo === "decisao" || (lado && lado !== "direita"))) {
        estilo += "entryX=0;entryY=0.5;entryDx=0;entryDy=0;";
      }
      if (volta) estilo += "dashed=1;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;";
      const rotulo = [prox.rotulo, prox.regra && `(${prox.regra})`].filter(Boolean).join(" ");
      out.push(aresta(`e${++n}`, esc(rotulo), estilo, s.id, prox.para));
    }
  }

  // legenda
  const yLeg = TOPO + faixas.length * FAIXA_H + 30;
  const itens = [
    ["Passo", `rounded=1;arcSize=10;fillColor=#FFFFFF;strokeColor=${COR.borda};`],
    ["Decisão", "rhombus;fillColor=#FFF8E1;strokeColor=#F9A825;"],
    ["Espera", `rounded=1;arcSize=50;dashed=1;fillColor=#FAFAFA;strokeColor=${COR.cinza};`],
    ["Ponto de dor", `rounded=1;arcSize=10;fillColor=#FFFFFF;strokeColor=${COR.dor};strokeWidth=2;`],
    ["Candidato a automação", `rounded=1;arcSize=10;fillColor=${COR.automacaoFundo};strokeColor=${COR.automacao};`],
    ["Ainda não está claro (?)", `rounded=1;arcSize=10;dashed=1;dashPattern=4 3;fillColor=#FFFFFF;strokeColor=${COR.borda};`],
  ];
  itens.forEach(([nome, est], i) => {
    out.push(celula(`leg-${i}`, nome, BASE + est + "fontSize=10;", CAB + 30 + i * 150, yLeg, 130, 36));
  });
  out.push(
    celula("leg-nota", "Passe o mouse num passo pra ver o que entra, o que sai e as observações.",
      `text;html=1;align=left;fontSize=10;fontColor=${COR.cinza};`, CAB + 30, yLeg + 44, 600, 20)
  );

  return out;
}

function dica(s) {
  const linhas = [];
  if (s.descricao) linhas.push(s.descricao);
  if (s.entradas.length) linhas.push(`Recebe: ${s.entradas.map(itemComMinimo).join("; ")}`);
  if (s.saidas.length) linhas.push(`Entrega: ${s.saidas.map((it) => it.item).join("; ")}`);
  if (s.pronto_quando) linhas.push(`Pronto quando: ${s.pronto_quando}`);
  if (s.regras.length) linhas.push(`Regras: ${s.regras.join(", ")}`);
  if (s.depende_de.length) linhas.push(`Depende de: ${s.depende_de.join("; ")}`);
  if (s.tempo) linhas.push(`Tempo: ${s.tempo}`);
  if (s.nota) linhas.push(`Obs.: ${s.nota}`);
  return linhas.join("\n");
}

function itemComMinimo(it) {
  return it.minimo.length ? `${it.item} (mínimo: ${it.minimo.join(", ")})` : it.item;
}

// ---------------------------------------------------------------- página 2: tabela

function paginaTabela(p) {
  const out = [];
  const cols = [
    ["Passo", 190],
    ["Quem", 120],
    ["Ferramenta", 120],
    ["Precisa ter pra começar", 250],
    ["Entrega", 210],
    ["Pronto quando", 190],
    ["Regras", 80],
    ["Tempo", 100],
  ];
  const largura = cols.reduce((a, [, w]) => a + w, 0);

  out.push(
    celula("titulo", `<b style="font-size:20px">${esc(p.nome)}</b><br><span style="font-size:12px;color:${COR.cinza}">O que entra e o que sai em cada passo</span>`,
      `text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;fontColor=${COR.texto};`, 0, 0, largura, 60)
  );

  let y = 70;
  const linha = (valores, cabecalho, idx) => {
    const alturas = valores.map((v, i) => estimarAltura(v, cols[i][1]));
    const h = Math.max(cabecalho ? 34 : 44, ...alturas);
    let x = 0;
    valores.forEach((v, i) => {
      const est = cabecalho
        ? `rounded=0;${BASE}align=left;spacingLeft=8;fontStyle=1;fillColor=#263238;fontColor=#FFFFFF;strokeColor=#263238;`
        : `rounded=0;${BASE}align=left;verticalAlign=middle;spacingLeft=8;spacingRight=6;fontSize=11;fillColor=${idx % 2 ? "#FFFFFF" : "#F7F9FA"};strokeColor=#CFD8DC;`;
      out.push(celula(`t-${idx}-${i}`, escTexto(v), est, x, y, cols[i][1], h));
      x += cols[i][1];
    });
    y += h;
  };

  linha(cols.map(([n]) => n), true, "h");
  p.passos.forEach((s, i) => {
    linha(
      [
        `${s.n}. ${s.titulo}` + (s.marcadores.includes("lacuna") ? " (?)" : ""),
        s.responsavel,
        s.ferramenta || "",
        s.entradas.map(itemComMinimo).join("\n"),
        s.saidas.map((it) => it.item).join("\n"),
        s.pronto_quando || "",
        s.regras.join(", "),
        s.tempo || "",
      ],
      false,
      i
    );
  });
  return out;
}

function estimarAltura(texto, largura) {
  const porLinha = Math.max(8, Math.floor((largura - 16) / 6.4));
  const linhas = String(texto || "")
    .split("\n")
    .reduce((a, l) => a + Math.max(1, Math.ceil(l.length / porLinha)), 0);
  return linhas * 15 + 16;
}

// ---------------------------------------------------------------- página 3: regras

function paginaRegras(p) {
  const out = [];
  const cols = [
    ["#", 50],
    ["Regra", 420],
    ["Tipo", 100],
    ["Onde vale", 220],
    ["Situação", 170],
  ];
  const largura = cols.reduce((a, [, w]) => a + w, 0);
  out.push(
    celula("titulo", `<b style="font-size:20px">${esc(p.nome)}</b><br><span style="font-size:12px;color:${COR.cinza}">Regras de negócio. O que não está confirmado, um agente ainda não consegue seguir.</span>`,
      `text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;fontColor=${COR.texto};`, 0, 0, largura, 60)
  );

  let y = 70;
  const linha = (valores, cabecalho, idx, alerta) => {
    const h = Math.max(cabecalho ? 34 : 44, ...valores.map((v, i) => estimarAltura(v, cols[i][1])));
    let x = 0;
    valores.forEach((v, i) => {
      let est = cabecalho
        ? `rounded=0;${BASE}align=left;spacingLeft=8;fontStyle=1;fillColor=#263238;fontColor=#FFFFFF;strokeColor=#263238;`
        : `rounded=0;${BASE}align=left;verticalAlign=middle;spacingLeft=8;spacingRight=6;fontSize=11;fillColor=${idx % 2 ? "#FFFFFF" : "#F7F9FA"};strokeColor=#CFD8DC;`;
      if (alerta && i === cols.length - 1) est += `fontColor=${COR.dor};fontStyle=1;`;
      out.push(celula(`r-${idx}-${i}`, escTexto(v), est, x, y, cols[i][1], h));
      x += cols[i][1];
    });
    y += h;
  };

  linha(cols.map(([n]) => n), true, "h");
  p.regras.forEach((r, i) => {
    const status = r.status || "confirmada";
    linha(
      [
        r.id,
        r.regra,
        TIPOS_REGRA[r.tipo] || "",
        r.passos.map((id) => `${p.porId[id].n}. ${p.porId[id].titulo}`).join("\n"),
        STATUS_REGRA[status],
      ],
      false,
      i,
      status !== "confirmada"
    );
  });
  return out;
}

// ---------------------------------------------------------------- página 4: ferramentas

function paginaFerramentas(p) {
  const out = [];
  const usos = {};
  for (const s of p.passos) {
    if (!s.ferramenta) continue;
    usos[s.ferramenta] ??= [];
    usos[s.ferramenta].push(s.titulo);
  }
  for (const f of p.ferramentas) usos[f.nome] ??= [];

  const nomes = Object.keys(usos);
  out.push(
    celula("titulo", `<b style="font-size:20px">${esc(p.nome)}</b><br><span style="font-size:12px;color:${COR.cinza}">O que passa de uma ferramenta pra outra. Cada passagem é um lugar onde informação pode se perder, e um ponto natural pra integração.</span>`,
      `text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;fontColor=${COR.texto};`, 0, 0, 900, 70)
  );
  if (!nomes.length) {
    out.push(celula("vazio", "Nenhuma ferramenta registrada nos passos.", `text;html=1;fontColor=${COR.cinza};`, 0, 90, 400, 30));
    return out;
  }

  // ferramentas em círculo: seta reta entre dois pontos do círculo não atravessa outra caixa
  const info = Object.fromEntries(p.ferramentas.map((f) => [f.nome, f]));
  const W = 170;
  const H = 72;
  const raio = Math.max(240, nomes.length * 60);
  const cx = raio + W / 2 + 40;
  const cy = 110 + raio + H / 2;
  const ids = {};
  nomes.forEach((nome, i) => {
    const id = `f-${i}`;
    ids[nome] = id;
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / nomes.length;
    const f = info[nome] || {};
    const extra = f.uso || (usos[nome].length ? `${usos[nome].length} passo(s)` : "");
    const acesso = f.acesso ? ACESSO[f.acesso] : "";
    const corAcesso = f.acesso === "manual" || f.acesso === "nao-sei" ? COR.dor : COR.automacao;
    const rotulo = `<b>${esc(nome)}</b>` +
      (extra ? `<br><span style="font-size:10px;color:${COR.cinza}">${esc(extra)}</span>` : "") +
      (acesso ? `<br><span style="font-size:10px;color:${corAcesso}">${esc(acesso)}</span>` : "");
    out.push(
      celula(id, rotulo, `rounded=1;arcSize=14;${BASE}fillColor=#FFFFFF;strokeColor=${COR.borda};`,
        cx + raio * Math.cos(ang) - W / 2, cy + raio * Math.sin(ang) - H / 2, W, H, "1",
        usos[nome].length ? `Usada em:\n${usos[nome].join("\n")}` : "")
    );
  });

  // passagens: passo A (ferramenta X) -> passo B (ferramenta Y), X != Y
  const passagens = {};
  for (const pa of calcularPassagens(p)) {
    const k = `${pa.de}>${pa.para}`;
    passagens[k] ??= new Set();
    for (const item of pa.itens) passagens[k].add(item);
  }
  // ida e volta entre o mesmo par vira uma seta só, com as duas direções no rótulo
  const feitos = new Set();
  let n = 0;
  for (const k of Object.keys(passagens)) {
    if (feitos.has(k)) continue;
    const [de, para] = k.split(">");
    const volta = `${para}>${de}`;
    const linhas = [];
    const itensIda = [...passagens[k]];
    if (passagens[volta]) {
      feitos.add(volta);
      linhas.push(
        `pra ${para}: ${itensIda.join(", ") || "?"}`,
        `pra ${de}: ${[...passagens[volta]].join(", ") || "?"}`
      );
    } else {
      linhas.push(...itensIda);
    }
    feitos.add(k);
    out.push(
      aresta(`fe${++n}`, linhas.map(esc).join("<br>"),
        `html=1;endArrow=block;endFill=1;${passagens[volta] ? "startArrow=block;startFill=1;" : ""}strokeColor=${COR.automacao};fontSize=10;fontColor=${COR.texto};labelBackgroundColor=#FFFFFF;`,
        ids[de], ids[para])
    );
  }
  return out;
}

// ---------------------------------------------------------------- xml

function mxfile(paginas) {
  const corpo = paginas
    .map(
      (pg) => `  <diagram id="${pg.id}" name="${escAttr(pg.nome)}">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${pg.celulas.map((c) => "        " + c).join("\n")}
      </root>
    </mxGraphModel>
  </diagram>`
    )
    .join("\n");
  return `<mxfile host="mapear-processo" agent="mapear-processo">\n${corpo}\n</mxfile>\n`;
}

function celula(id, rotulo, estilo, x, y, w, h, pai = "1", tooltip = "") {
  const geo = `<mxGeometry x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" as="geometry" />`;
  if (tooltip) {
    return `<UserObject label="${escAttr(rotulo)}" tooltip="${escAttr(tooltip)}" id="${escAttr(id)}"><mxCell style="${escAttr(estilo)}" vertex="1" parent="${escAttr(pai)}">${geo}</mxCell></UserObject>`;
  }
  return `<mxCell id="${escAttr(id)}" value="${escAttr(rotulo)}" style="${escAttr(estilo)}" vertex="1" parent="${escAttr(pai)}">${geo}</mxCell>`;
}

function aresta(id, rotulo, estilo, de, para) {
  return `<mxCell id="${escAttr(id)}" value="${escAttr(rotulo)}" style="${escAttr(estilo)}" edge="1" parent="1" source="${escAttr(de)}" target="${escAttr(para)}"><mxGeometry relative="1" as="geometry" /></mxCell>`;
}

const r = (n) => Math.round(n);

// texto que vai dentro de um rótulo html
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escTexto(s) {
  return esc(s).replace(/\n/g, "<br>").replace(/&lt;br&gt;/g, "<br>");
}
// valor de atributo xml
function escAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "&#xa;");
}

main();
