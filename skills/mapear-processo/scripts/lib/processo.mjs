// Lê, valida, normaliza e confere o processo.json. Usado por gerar_drawio, gerar_md e checar.
//
// Entradas e saídas podem ser texto simples ("Lista de peças") ou objeto com o
// detalhe ({ item, de, formato, minimo, se_faltar }). Aqui tudo vira objeto.
//
// Sem dependências. Node 18+.

import { readFileSync } from "node:fs";

export const TIPOS_PASSO = ["inicio", "tarefa", "decisao", "espera", "fim"];

export const TIPOS_REGRA = {
  decisao: "decisão",
  validacao: "validação",
  calculo: "cálculo",
  prazo: "prazo",
  permissao: "permissão",
  restricao: "restrição",
};

export const STATUS_REGRA = {
  confirmada: "confirmada",
  "de-cabeca": "existe, mas não está escrita",
  lacuna: "ninguém soube dizer",
};

export const ACESSO = {
  api: "tem API",
  integracao: "tem integração pronta",
  exportacao: "exporta arquivo",
  manual: "só na mão",
  "nao-sei": "não sabemos",
};

// ---------------------------------------------------------------- carregar

export function carregar(caminho) {
  let bruto;
  try {
    bruto = JSON.parse(readFileSync(caminho, "utf8"));
  } catch (err) {
    return { erros: [`não consegui ler ${caminho}: ${err.message}`] };
  }
  const erros = validar(bruto);
  if (erros.length) return { erros };
  return { proc: normalizar(bruto), erros: [] };
}

// ---------------------------------------------------------------- validação (erros que impedem gerar)

function validar(p) {
  const e = [];
  if (!p.nome) e.push('falta "nome"');
  if (!Array.isArray(p.passos) || !p.passos.length) e.push('falta "passos"');
  if (e.length) return e;

  const ids = new Set();
  for (const s of p.passos) {
    if (!s.id) e.push(`passo sem "id": ${JSON.stringify(s.titulo)}`);
    else if (ids.has(s.id)) e.push(`id repetido: ${s.id}`);
    ids.add(s.id);
    if (!s.titulo) e.push(`passo ${s.id} sem "titulo"`);
    if (!s.responsavel) e.push(`passo ${s.id} sem "responsavel"`);
    if (s.tipo && !TIPOS_PASSO.includes(s.tipo)) e.push(`passo ${s.id}: tipo "${s.tipo}" não existe (use ${TIPOS_PASSO.join(", ")})`);
    for (const campo of ["entradas", "saidas"]) {
      for (const it of s[campo] || []) {
        if (typeof it !== "string" && !it?.item) e.push(`passo ${s.id}: item de "${campo}" sem "item": ${JSON.stringify(it)}`);
      }
    }
  }

  const regras = new Set();
  for (const r of p.regras || []) {
    if (!r.id) e.push(`regra sem "id": ${JSON.stringify(r.regra)}`);
    else if (regras.has(r.id)) e.push(`regra com id repetido: ${r.id}`);
    regras.add(r.id);
    if (!r.regra) e.push(`regra ${r.id} sem "regra"`);
    if (r.tipo && !TIPOS_REGRA[r.tipo]) e.push(`regra ${r.id}: tipo "${r.tipo}" não existe (use ${Object.keys(TIPOS_REGRA).join(", ")})`);
    if (r.status && !STATUS_REGRA[r.status]) e.push(`regra ${r.id}: status "${r.status}" não existe (use ${Object.keys(STATUS_REGRA).join(", ")})`);
    for (const id of r.passos || []) if (!ids.has(id)) e.push(`regra ${r.id} cita o passo "${id}", que não existe`);
  }

  for (const s of p.passos) {
    for (const prox of s.proximo || []) {
      if (!ids.has(prox.para)) e.push(`passo ${s.id} aponta pra "${prox.para}", que não existe`);
      if (prox.regra && !regras.has(prox.regra)) e.push(`passo ${s.id}: seta pra ${prox.para} cita a regra "${prox.regra}", que não existe`);
    }
    for (const id of s.regras || []) if (!regras.has(id)) e.push(`passo ${s.id} cita a regra "${id}", que não existe`);
  }

  for (const f of p.ferramentas || []) {
    if (f.acesso && !ACESSO[f.acesso]) e.push(`ferramenta ${f.nome}: acesso "${f.acesso}" não existe (use ${Object.keys(ACESSO).join(", ")})`);
  }
  for (const c of p.candidatos_automacao || []) {
    if (c.passo && !ids.has(c.passo)) e.push(`candidato a automação cita o passo "${c.passo}", que não existe`);
  }
  return e;
}

// ---------------------------------------------------------------- normalização

const lista = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x !== "?");
// "?" no JSON é o mesmo que campo vazio: aparece como pendente, não como respondido
const valor = (v) => (v === "?" ? undefined : v);

function normalizar(p) {
  const passos = p.passos.map((s, i) => ({
    ...s,
    n: i + 1,
    tipo: s.tipo || "tarefa",
    pronto_quando: valor(s.pronto_quando),
    entradas: lista(s.entradas).map((it) =>
      typeof it === "string" ? { item: it, minimo: [] } : { ...it, formato: valor(it.formato), minimo: lista(it.minimo) }
    ),
    saidas: lista(s.saidas).map((it) =>
      typeof it === "string" ? { item: it, campos: [] } : { ...it, formato: valor(it.formato), campos: lista(it.campos) }
    ),
    regras: [...lista(s.regras)],
    excecoes: lista(s.excecoes),
    depende_de: lista(s.depende_de),
    marcadores: lista(s.marcadores),
    proximo: lista(s.proximo),
  }));
  const porId = Object.fromEntries(passos.map((s) => [s.id, s]));

  // regra e passo se citam nos dois sentidos: junta tudo dos dois lados
  const regras = lista(p.regras).map((r) => ({ ...r, passos: [...lista(r.passos)] }));
  const regraPorId = Object.fromEntries(regras.map((r) => [r.id, r]));
  const ligar = (rid, sid) => {
    if (!regraPorId[rid].passos.includes(sid)) regraPorId[rid].passos.push(sid);
    if (!porId[sid].regras.includes(rid)) porId[sid].regras.push(rid);
  };
  for (const s of passos) {
    for (const rid of [...s.regras]) ligar(rid, s.id);
    for (const prox of s.proximo) if (prox.regra) ligar(prox.regra, s.id);
  }
  for (const r of regras) for (const sid of [...r.passos]) ligar(r.id, sid);
  for (const r of regras) r.passos.sort((a, b) => porId[a].n - porId[b].n);

  // ferramenta usada num passo e não declarada entra no fim da lista
  const ferramentas = lista(p.ferramentas).map((f) => ({ ...f }));
  for (const s of passos) {
    if (s.ferramenta && !ferramentas.some((f) => f.nome === s.ferramenta)) ferramentas.push({ nome: s.ferramenta });
  }

  const lacunas = lista(p.lacunas).map((l) => (typeof l === "string" ? { pergunta: l } : l));
  const dados = lista(p.dados).map((d) => ({
    ...d,
    campos: lista(d.campos).map((c) => (typeof c === "string" ? { nome: c } : c)),
  }));

  return {
    ...p,
    slug: p.slug || slugify(p.nome),
    responsaveis: lista(p.responsaveis),
    passos,
    porId,
    regras,
    regraPorId,
    ferramentas,
    dados,
    lacunas,
    dores: lista(p.dores),
    candidatos_automacao: lista(p.candidatos_automacao),
    fontes: lista(p.fontes),
  };
}

// ---------------------------------------------------------------- de onde vem, pra onde vai

export function chave(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// um item é reconhecido pelo nome e, se tiver, pelo "dado" que ele representa
const chavesDe = (it) => [...new Set([chave(it.item), it.dado && chave(it.dado)].filter(Boolean))];

export function indices(proc) {
  const produz = {};
  const consome = {};
  for (const s of proc.passos) {
    for (const it of s.saidas) for (const k of chavesDe(it)) (produz[k] ??= []).push(s.id);
    for (const it of s.entradas) for (const k of chavesDe(it)) (consome[k] ??= []).push(s.id);
  }
  return { produz, consome };
}

// origem de uma entrada: { passos: [ids], externo: "texto" }
export function origem(proc, idx, s, it) {
  if (it.de) return proc.porId[it.de] ? { passos: [it.de] } : { externo: it.de };
  const passos = [...new Set(chavesDe(it).flatMap((k) => idx.produz[k] || []))].filter((id) => id !== s.id);
  return { passos };
}

// destino de uma saída: { passos: [ids], externo: "texto" }
export function destino(proc, idx, s, it) {
  if (it.para) return proc.porId[it.para] ? { passos: [it.para] } : { externo: it.para };
  const passos = [...new Set(chavesDe(it).flatMap((k) => idx.consome[k] || []))].filter((id) => id !== s.id);
  return { passos };
}

// passagens de uma ferramenta pra outra: passo A (ferramenta X) -> passo B (ferramenta Y), X != Y.
// Leva só o que A entrega pra B (ou o que não tem destino conhecido).
export function passagens(proc) {
  const idx = indices(proc);
  const out = [];
  for (const s of proc.passos) {
    for (const prox of s.proximo) {
      const d = proc.porId[prox.para];
      if (!s.ferramenta || !d.ferramenta || s.ferramenta === d.ferramenta) continue;
      const itens = s.saidas
        .filter((it) => {
          const dest = destino(proc, idx, s, it);
          return dest.passos?.includes(d.id) || (!dest.externo && !dest.passos?.length);
        })
        .map((it) => it.item);
      out.push({ de: s.ferramenta, para: d.ferramenta, itens, passoDe: s, passoPara: d });
    }
  }
  return out;
}

// ---------------------------------------------------------------- checagem (furos que viram pergunta)

export function checar(proc) {
  const idx = indices(proc);
  const avisos = [];
  const rotulo = (s) => `Passo ${s.n} (${s.titulo})`;
  const todasSaidas = proc.passos.flatMap((s) => s.saidas.map((it) => ({ s, it })));

  for (const s of proc.passos) {
    for (const it of s.entradas) {
      const o = origem(proc, idx, s, it);
      if (it.de && proc.porId[it.de] && !proc.porId[it.de].saidas.some((x) => chavesDe(x).some((k) => chavesDe(it).includes(k)))) {
        avisos.push({ passo: s.id, msg: `${rotulo(s)} diz que "${it.item}" vem do passo ${proc.porId[it.de].n}, mas esse passo não entrega nada com esse nome.` });
      }
      if (!o.externo && !o.passos.length) {
        const parecido = todasSaidas.find(({ s: x, it: y }) => x.id !== s.id && parecidos(y.item, it.item));
        avisos.push({
          passo: s.id,
          msg: `${rotulo(s)} precisa de "${it.item}", mas nenhum passo entrega isso e não está dito de onde vem.` +
            (parecido ? ` É o mesmo que "${parecido.it.item}" (passo ${parecido.s.n})? Se for, use o mesmo nome.` : ""),
        });
      }
    }

    const termina = s.tipo === "fim" || !s.proximo.length;
    for (const it of s.saidas) {
      const d = destino(proc, idx, s, it);
      if (!termina && !d.externo && !d.passos.length && !parecidos(it.item, proc.resultado)) {
        avisos.push({ passo: s.id, msg: `${rotulo(s)} entrega "${it.item}", mas nenhum passo usa isso depois. Vai pra onde?` });
      }
    }

    if (s.tipo === "decisao" && !s.regras.length) {
      avisos.push({ passo: s.id, msg: `A decisão do passo ${s.n} (${s.titulo}) não tem critério registrado. Com base em quê se escolhe cada caminho?` });
    }
    if (s.tipo === "decisao" && s.proximo.length < 2) {
      avisos.push({ passo: s.id, msg: `A decisão do passo ${s.n} (${s.titulo}) só tem um caminho de saída.` });
    }
  }

  for (const r of proc.regras) {
    if (!r.passos.length) avisos.push({ msg: `A regra ${r.id} não está ligada a nenhum passo.` });
  }

  // a mesma coisa com dois nomes quebra o rastro entre passos
  const nomes = [...new Set(proc.passos.flatMap((s) => [...s.entradas, ...s.saidas].map((it) => it.item)))];
  const ditos = new Set();
  for (const a of nomes) {
    for (const b of nomes) {
      if (a >= b || chave(a) === chave(b) || !parecidos(a, b)) continue;
      const k = `${a}|${b}`;
      if (ditos.has(k)) continue;
      ditos.add(k);
      const jaAvisado = avisos.some((x) => x.msg.includes(`"${a}"`) && x.msg.includes(`"${b}"`));
      if (!jaAvisado) avisos.push({ msg: `"${a}" e "${b}" são a mesma coisa? Se forem, use o mesmo nome nos dois passos.` });
    }
  }
  return avisos;
}

function parecidos(a, b) {
  const x = chave(a);
  const y = chave(b);
  if (!x || !y || x === y) return false;
  const [curto, longo] = x.length <= y.length ? [x, y] : [y, x];
  // "Proposta em PDF" x "Proposta em PDF enviada" sim; "Material" x "Lista de material com quantidade" não
  return curto.length >= 6 && curto.length / longo.length >= 0.5 && longo.includes(curto);
}

// ---------------------------------------------------------------- prontidão de um candidato a automação

export function prontidao(proc, cand) {
  const s = proc.porId[cand.passo];
  if (!s) return [];
  const idx = indices(proc);
  const itens = [];

  if (!s.entradas.length) {
    itens.push({ ok: false, texto: "O que o passo recebe. Nenhuma entrada registrada" });
  } else {
    const semMinimo = s.entradas.filter((it) => !it.minimo.length).map((it) => it.item);
    itens.push({
      ok: !semMinimo.length,
      texto: "Mínimo de cada entrada definido" + (semMinimo.length ? `. Falta: ${semMinimo.join(", ")}` : ""),
    });

    const semOrigem = s.entradas.filter((it) => {
      const o = origem(proc, idx, s, it);
      return !o.externo && !o.passos.length;
    }).map((it) => it.item);
    const semFormato = s.entradas.filter((it) => !it.formato).map((it) => it.item);
    itens.push({
      ok: !semOrigem.length && !semFormato.length,
      texto: "De onde vem cada entrada e em que formato chega" +
        (semOrigem.length ? `. Sem origem: ${semOrigem.join(", ")}` : "") +
        (semFormato.length ? `. Sem formato: ${semFormato.join(", ")}` : ""),
    });
  }

  itens.push({ ok: !!s.pronto_quando, texto: "Critério de pronto do passo" + (s.pronto_quando ? `: ${s.pronto_quando}` : "") });

  const regras = s.regras.map((id) => proc.regraPorId[id]);
  const fracas = regras.filter((r) => (r.status || "confirmada") !== "confirmada");
  itens.push({
    ok: regras.length > 0 && !fracas.length,
    texto: !regras.length
      ? "Regras do passo. Nenhuma registrada: confirmar se o passo segue algum critério"
      : fracas.length
        ? `Regras do passo confirmadas. Ainda não: ${fracas.map((r) => `${r.id} (${STATUS_REGRA[r.status]})`).join(", ")}`
        : `Regras do passo confirmadas (${regras.map((r) => r.id).join(", ")})`,
  });

  // o agente precisa ler onde a entrada nasce e escrever onde o passo acontece
  const nomesFerr = [s.ferramenta];
  for (const it of s.entradas) {
    for (const id of origem(proc, idx, s, it).passos || []) nomesFerr.push(proc.porId[id].ferramenta);
  }
  const usadas = [...new Set(nomesFerr.filter(Boolean))].map((nome) => proc.ferramentas.find((f) => f.nome === nome) || { nome });
  const acessivel = (f) => ["api", "integracao", "exportacao"].includes(f.acesso);
  itens.push({
    ok: usadas.length > 0 && usadas.every(acessivel),
    texto: !usadas.length
      ? "Ferramenta do passo. Nenhuma registrada"
      : `Acesso às ferramentas: ${usadas.map((f) => `${f.nome} (${f.acesso ? ACESSO[f.acesso] : "não perguntado"})`).join(", ")}`,
  });

  const temExcecao = s.excecoes.length > 0 || s.entradas.some((it) => it.se_faltar);
  itens.push({ ok: temExcecao, texto: "O que fazer quando falta informação ou dá errado" });

  itens.push({ ok: !!cand.revisao, texto: "Quem revisa o que o agente fizer" + (cand.revisao ? `: ${cand.revisao}` : "") });
  return itens;
}

// ---------------------------------------------------------------- utilidades

export function slugify(s) {
  return chave(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "processo";
}
