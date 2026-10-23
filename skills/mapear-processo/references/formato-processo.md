# Formato do processo.json

É a fonte de tudo. O `gerar_drawio.mjs` e o `gerar_md.mjs` leem só este arquivo, e o `checar.mjs` confere ele antes. Você não escreve o `processo.md` à mão: ele é gerado, e o seu texto de análise entra pelo campo `diagnostico` e pelos candidatos a automação.

Veja `examples/orcamento-marcenaria/processo.json` pra um exemplo completo.

```json
{
  "nome": "Orçamento de móveis planejados",
  "slug": "orcamento-marcenaria",
  "objetivo": "Pra que o processo existe, em uma frase.",
  "dono": "Quem responde por ele",
  "gatilho": "O que faz o processo começar",
  "resultado": "O que existe quando ele termina",
  "frequencia": "Cerca de 12 por semana",
  "diagnostico": "Sua leitura do processo, em 1 a 3 parágrafos. Ver abaixo.",

  "responsaveis": ["Cliente", "Comercial", "Projetista", "Financeiro"],

  "ferramentas": [
    { "nome": "Planilha de leads", "uso": "Google Sheets", "acesso": "api", "obs": "opcional" }
  ],

  "dados": [
    {
      "nome": "Lead",
      "descricao": "Um cliente que pediu orçamento.",
      "onde_fica": "Planilha de leads",
      "dono": "Comercial",
      "chave": "Telefone do cliente",
      "campos": [
        { "nome": "telefone", "obrigatorio": true, "formato": "(41) 9xxxx-xxxx", "exemplo": "opcional" }
      ]
    }
  ],

  "regras": [
    {
      "id": "R1",
      "tipo": "permissao",
      "regra": "Desconto acima de 5% só com aprovação do dono.",
      "passos": ["p7"],
      "fonte": "entrevista (dono)",
      "status": "confirmada",
      "exemplo": "Opcional. Um caso real, ou as duas versões quando há divergência."
    }
  ],

  "passos": [
    {
      "id": "p2",
      "tipo": "tarefa",
      "responsavel": "Comercial",
      "titulo": "Registra o contato",
      "descricao": "Opcional. Uma ou duas frases a mais.",
      "ferramenta": "Planilha de leads",
      "entradas": [
        {
          "item": "Mensagem do cliente",
          "de": "só se não vier de um passo do mapa: 'Fornecedor, por e-mail'",
          "formato": "texto livre no WhatsApp",
          "minimo": ["nome", "telefone", "ambiente"],
          "se_faltar": "pergunta de volta antes de registrar"
        }
      ],
      "saidas": [
        {
          "item": "Lead na planilha",
          "dado": "Lead",
          "para": "só se o destino estiver fora do mapa: 'Fábrica'",
          "formato": "linha no Google Sheets",
          "campos": ["nome", "telefone", "ambiente", "status = novo"]
        }
      ],
      "pronto_quando": "A linha existe com nome, telefone, ambiente e status 'novo'.",
      "regras": ["R1"],
      "excecoes": [{ "quando": "Cliente não manda o telefone", "faz": "pede de novo no dia seguinte" }],
      "depende_de": ["Algo de outra área ou de fora que não é uma entrada"],
      "tempo": "5 min",
      "marcadores": ["dor", "automacao", "lacuna"],
      "nota": "Observação curta. Aparece ao passar o mouse.",
      "proximo": [{ "para": "p3", "rotulo": "opcional, use nas decisões", "regra": "R1" }]
    }
  ],

  "lacunas": [
    { "pergunta": "Pergunta que ficou aberta", "quem_sabe": "financeiro", "passo": "p6" }
  ],
  "dores": ["Opcional. Dores que não cabem num passo só."],
  "candidatos_automacao": [
    {
      "passo": "p2",
      "ideia": "O que automatizar",
      "por_que": "Redigitação, volume, espera, erro frequente",
      "precisa_antes": "O que tem que estar resolvido antes",
      "revisao": "Quem confere o que o agente fizer, e quando"
    }
  ],
  "fontes": ["Opcional. Arquivos lidos, com página ou aba."]
}
```

## Campos obrigatórios

`nome`, e em cada passo: `id`, `titulo`, `responsavel`. Todo `proximo.para` tem que apontar pra um `id` que existe, e toda regra citada tem que existir em `regras`.

Todo o resto é opcional, mas cada campo vazio aparece como "?" no `processo.md` e na checagem. Isso é proposital: o "?" mostra o que falta perguntar. Nunca preencha um campo por suposição pra sumir com o "?".

## Entradas e saídas

Podem ser texto simples (`"Lista de peças"`) ou objeto com o detalhe. Use texto simples só nos passos pouco importantes. Nos passos de troca de mãos, decisões, dores e candidatos a automação, use o objeto completo.

| Campo | O que é |
|---|---|
| `item` | O nome da coisa. **Use exatamente o mesmo nome** na saída de um passo e na entrada do outro. É assim que o script liga os passos. |
| `minimo` | Só nas entradas. O que, se faltar, impede o passo de começar. Não é tudo que pode vir: é o mínimo. |
| `se_faltar` | Só nas entradas. O que a pessoa faz hoje quando chega incompleto. |
| `formato` | Como chega ou sai: texto livre, formulário, planilha, PDF, áudio, papel. |
| `campos` | Só nas saídas. As informações que vão junto. |
| `de` | Só nas entradas, e só quando vem de fora do mapa (cliente por e-mail, fornecedor, outro processo). Se vem de um passo, deixe vazio: o script descobre pelo nome. |
| `para` | Só nas saídas, e só quando vai pra fora do mapa (fábrica, arquivo morto, contador). |
| `dado` | Liga o item a um registro de `dados` quando o nome é diferente ("Lead na planilha" é o dado "Lead"). |

## Regras

| `tipo` | Quando |
|---|---|
| `decisao` | Escolhe um caminho. Toda decisão do fluxo precisa de pelo menos uma. |
| `validacao` | O que precisa estar certo pra seguir |
| `calculo` | Como se chega num valor |
| `prazo` | Até quando, e o que acontece se passar |
| `permissao` | Quem pode aprovar ou mudar |
| `restricao` | Limite que não pode ser passado (margem mínima, valor máximo) |

| `status` | Quando |
|---|---|
| `confirmada` | Escrita em algum lugar, ou quem decide confirmou |
| `de-cabeca` | Existe e é seguida, mas só na cabeça de alguém |
| `lacuna` | Ninguém soube dizer, ou duas pessoas divergem |

Ligue a regra aos passos por `regras[].passos`, por `passos[].regras` ou por `proximo[].regra`. Pode usar qualquer um: o script junta os três.

## Ferramentas: `acesso`

| `acesso` | Significa |
|---|---|
| `api` | Tem API |
| `integracao` | Tem integração pronta com outra ferramenta (Zapier, nativa) |
| `exportacao` | Exporta arquivo (CSV, Excel, XML) |
| `manual` | Só dá pra usar na mão |
| `nao-sei` | Ninguém soube dizer |

## Tipos de passo

| `tipo` | Quando usar | Forma no desenho |
|---|---|---|
| `inicio` | O gatilho. Normalmente um só. | elipse verde |
| `tarefa` | Alguém faz alguma coisa. É o padrão se `tipo` faltar. | retângulo |
| `decisao` | Alguém escolhe um caminho. Título em forma de pergunta ("Aprova?"). Cada saída tem `rotulo`. | losango |
| `espera` | O processo fica parado esperando algo previsível (prazo, resposta, entrega). | retângulo tracejado arredondado |
| `fim` | Um jeito de o processo terminar. Pode ter mais de um (deu certo, cancelado, perdido). | elipse cinza |

## Marcadores

| Marcador | Significa | No desenho |
|---|---|---|
| `dor` | O usuário reclamou desse passo, ou tem erro, retrabalho, redigitação | borda vermelha |
| `automacao` | Bom candidato a automação | fundo azul |
| `lacuna` | Falta informação sobre esse passo | borda pontilhada e "(?)" no título |

## O campo `diagnostico`

É a única parte do documento que é análise sua, e não registro do que o usuário disse. Escreva em 1 a 3 parágrafos curtos:

- Onde está o gargalo de verdade, que nem sempre é onde o usuário reclamou. Siga a informação: onde ela nasce mal e quantos passos carregam o erro.
- Quais regras de cabeça ou lacunas seguram o processo.
- O que precisa ser resolvido antes de automatizar qualquer coisa (um identificador comum, um dono pra uma tabela, um critério escrito).

Português direto, sem jargão, sem prometer ganho que o usuário não deu número. Use `\n\n` entre parágrafos.

## Dicas

- `responsaveis` define a ordem das faixas, de cima pra baixo. Ponha o cliente (ou quem dispara o processo) em cima.
- Use papel ("Financeiro"), não nome de pessoa, a menos que o usuário prefira.
- Se um passo volta pra trás (ajuste, correção), é só apontar `proximo` pro passo anterior. O script desenha essa seta tracejada por cima.
- `ferramenta` é uma só por passo. Se o passo usa duas, ou ele são dois passos, ou escolha a principal e cite a outra em `nota`.
- Entrada que só existe numa volta (o "pedido de ajuste" que só chega quando o cliente pede ajuste) entra normalmente. Explique em `nota`.

## O que o processo.md gerado contém

1. Ficha do processo (gatilho, resultado, frequência, dono, participantes, ferramentas)
2. Diagnóstico (o seu texto)
3. Passo a passo, com as decisões e voltas
4. O que cada passo precisa e entrega: tabela de entradas (origem, formato, mínimo, se faltar), tabela de saídas, pronto quando, regras, exceções
5. Regras de negócio, com tipo, onde valem, fonte e situação
6. Arquitetura: mapa das informações (onde nasce, onde é usada), os `dados` detalhados, sistemas com forma de acesso, passagens entre ferramentas
7. Furos encontrados pela checagem
8. O que ainda não está claro
9. Onde dói
10. Onde faz sentido automatizar, com a lista de prontidão de cada candidato
11. Fontes
