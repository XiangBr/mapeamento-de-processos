// Posição de cada passo no fluxo: em que faixa (responsável) e em que coluna.
// Usado pelo gerar_drawio e pelo gerar_excalidraw, pra os dois desenhos saírem iguais.
//
// Sem dependências. Node 18+.

export function calcularLayout(p) {
  const { passos, porId } = p;

  // faixas: ordem declarada, depois quem aparecer nos passos
  const faixas = [...p.responsaveis];
  for (const s of passos) if (!faixas.includes(s.responsavel)) faixas.push(s.responsavel);
  const faixaDe = (s) => faixas.indexOf(s.responsavel);

  // arestas de volta (laços) não contam pra posição horizontal
  const voltas = arestasDeVolta(passos);
  const ordem = ordemTopologica(passos, voltas);

  // cada saída de uma decisão anda uma coluna a mais, pra uma seta não passar por cima da outra
  const coluna = {};
  const ocupado = new Set();
  for (const id of ordem) {
    let c = 0;
    for (const s of passos) {
      const saidas = s.proximo.filter((x) => !voltas.has(`${s.id}>${x.para}`));
      saidas.forEach((prox, i) => {
        if (prox.para === id && coluna[s.id] !== undefined) {
          c = Math.max(c, coluna[s.id] + 1 + (s.tipo === "decisao" ? i : 0));
        }
      });
    }
    while (ocupado.has(`${faixaDe(porId[id])}:${c}`)) c++;
    coluna[id] = c;
    ocupado.add(`${faixaDe(porId[id])}:${c}`);
  }

  const nCol = Math.max(...Object.values(coluna)) + 1;
  return { faixas, faixaDe, voltas, coluna, nCol };
}

function arestasDeVolta(passos) {
  const filhos = Object.fromEntries(passos.map((s) => [s.id, s.proximo.map((x) => x.para)]));
  const estado = {};
  const voltas = new Set();
  const visitar = (id) => {
    estado[id] = 1;
    for (const f of filhos[id] || []) {
      if (estado[f] === 1) voltas.add(`${id}>${f}`);
      else if (!estado[f]) visitar(f);
    }
    estado[id] = 2;
  };
  const inicios = passos.filter((s) => s.tipo === "inicio").map((s) => s.id);
  for (const id of [...inicios, ...passos.map((s) => s.id)]) if (!estado[id]) visitar(id);
  return voltas;
}

function ordemTopologica(passos, voltas) {
  const grau = Object.fromEntries(passos.map((s) => [s.id, 0]));
  for (const s of passos) for (const x of s.proximo) if (!voltas.has(`${s.id}>${x.para}`)) grau[x.para]++;
  const fila = passos.filter((s) => grau[s.id] === 0).map((s) => s.id);
  const ordem = [];
  while (fila.length) {
    const id = fila.shift();
    ordem.push(id);
    const s = passos.find((x) => x.id === id);
    for (const x of s.proximo) {
      if (voltas.has(`${id}>${x.para}`)) continue;
      if (--grau[x.para] === 0) fila.push(x.para);
    }
  }
  return ordem;
}
