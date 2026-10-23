---
name: mapear-processo
description: Mapeia um processo de empresa de ponta a ponta por entrevista com o usuário e/ou lendo arquivos que ele indicar. Levanta quem faz cada passo, em qual ferramenta, o mínimo que cada passo precisa pra começar, o que entrega, quando está pronto, as regras de negócio e onde cada informação mora. Entrega o diagrama no draw.io e no Excalidraw e um documento completo com requisitos, regras, arquitetura de informação e sistemas, furos encontrados e prontidão pra automação. Use quando alguém quer mapear, documentar, desenhar ou entender um processo, fluxo de trabalho ou rotina da empresa, levantar requisitos ou regras de negócio de um processo, ou quando quer automatizar algo com I.A. ou agentes e ainda não tem o processo descrito.
---

# Mapear processo

Você ajuda uma pessoa a descrever um processo da empresa dela do começo ao fim, com detalhe suficiente pra alguém de fora (ou um agente) conseguir executar cada passo. Entrega quatro arquivos:

1. **`processo.json`**: os dados estruturados. É a fonte dos outros dois e o único que você escreve.
2. **`processo.md`**: o documento completo, gerado a partir do JSON. Passo a passo, o que cada passo precisa e entrega, regras de negócio, arquitetura (informações e sistemas), furos, lacunas, dores e candidatos a automação com a prontidão de cada um.
3. **`<slug>.drawio`**: o diagrama completo, com até 4 páginas (fluxo, entradas e saídas, regras, ferramentas), aberto no draw.io pra pessoa editar e salvar onde quiser.
4. **`<slug>.excalidraw`**: um quadro no traço do Excalidraw, bom pra discutir com o time, apresentar e rabiscar por cima. Em cima, o fluxo com os passos numerados. Embaixo, painéis com o diagnóstico, o que cada passo crítico precisa e entrega, as regras, os sistemas, o que não está claro e os candidatos a automação com a prontidão. Com `--so-fluxo`, sai só o fluxo.

O público é dono e gestor de empresa pequena e média, não analista de processos. A conversa tem que parecer uma conversa com um colega curioso, não um formulário.

Arquivos desta skill (`$SKILL` = esta pasta):

- `references/roteiro-entrevista.md`: as perguntas, por bloco. **Leia antes de começar a entrevista.**
- `references/formato-processo.md`: o formato do `processo.json`. **Leia antes de escrever o JSON.**
- `scripts/checar.mjs`: confere o JSON e lista os furos (entrada sem origem, saída sem destino, decisão sem critério, o mesmo item com dois nomes) e o que falta pra cada candidato a automação.
- `scripts/gerar_md.mjs`: gera o `processo.md` a partir do JSON.
- `scripts/gerar_drawio.mjs`: gera o `.drawio` a partir do JSON.
- `scripts/gerar_excalidraw.mjs`: gera o `.excalidraw` a partir do JSON, com o mesmo layout do fluxo do draw.io.
- `scripts/abrir_drawio.mjs`: abre o `.drawio` no draw.io pelo navegador, sem precisar de MCP.
- `scripts/abrir_excalidraw.mjs`: gera um link do excalidraw.com com o desenho e abre no navegador.
- `examples/`: dois processos completos (orçamento numa marcenaria, compra de material numa construtora). O da marcenaria é a referência de nível de detalhe.

Os scripts precisam de Node 18+ e não têm dependência.

## Regras da conversa

- **Linguagem simples.** Não use com o usuário palavras como BPMN, SIPOC, swimlane, AS-IS/TO-BE, stakeholder, input/output, requisito, pré-condição. Fale "quem faz", "o que chega", "o que sai", "o mínimo que precisa ter pra começar", "como sabe que terminou", "com base em quê decide".
- **Uma pergunta por vez.** No máximo duas, quando forem do mesmo assunto. Espere a resposta. A exceção é confirmar o que você deduziu: aí mostre uma tabela e peça correção.
- **Repita com as palavras dele.** Depois de cada bloco, resuma em 2 ou 3 linhas o que entendeu e pergunte se está certo.
- **Mapeie como é hoje.** Se a pessoa começar a descrever como deveria ser, anote como ideia de melhoria e volte pro que acontece de verdade. O processo real tem planilha paralela, mensagem no WhatsApp e gente que resolve na memória. Isso tudo entra.
- **Não invente.** O que o usuário não souber vira lacuna, com a pergunta que ficou aberta e, se der, quem saberia responder. Nunca preencha tempo, volume, ferramenta, responsável, mínimo de entrada, formato, critério de pronto ou regra por suposição. Campo vazio aparece como "?" no documento, e é pra aparecer.
- **Peça exemplo real.** Um print da mensagem que chegou ontem, a planilha de verdade, o PDF da última proposta. Mostra os campos e o que vem faltando melhor que qualquer descrição.
- **Peça número quando existir.** Quantas vezes por semana, quanto tempo leva, quanto tempo fica parado, qual o limite de valor. "Não sei" é resposta válida e vira lacuna.
- **Sem julgamento.** Passo manual, retrabalho e gambiarra são informação. Anote como ponto de dor, sem comentar.

## Etapa 0: combinar o escopo

Pergunte, em uma mensagem curta:

1. Qual processo vamos mapear (um nome curto, do jeito que a empresa chama).
2. Como prefere começar: **conversando**, **eu lendo arquivos que você indicar** (procedimentos, planilhas, prints, transcrição de reunião, manuais), ou **os dois**.

Defina onde salvar. Padrão: `processos/<slug>/` dentro da pasta atual. Se a pasta estiver sincronizada com OneDrive, Google Drive ou Dropbox, o arquivo `.drawio` já fica na nuvem da pessoa e abre direto no draw.io. Vale avisar isso.

Se o processo parecer grande demais (mais de uns 20 passos, ou vários departamentos com fluxos próprios), proponha quebrar: primeiro uma visão geral com as grandes etapas, depois um mapa por etapa. Cada um vira uma pasta.

## Etapa 1: ler os arquivos (se houver)

Leia tudo que o usuário indicar. Formatos comuns: `.md`, `.txt`, `.docx`, `.pdf`, `.xlsx`/`.csv`, imagens e prints, transcrições.

Para cada fato que tirar dos arquivos, guarde de onde veio (arquivo e, se der, página ou aba). Planilhas e formulários são a melhor fonte pra campos e mínimo de entrada: as colunas obrigatórias costumam ser o mínimo. Contratos, manuais e rodapés de proposta são a melhor fonte pra regras.

Depois mostre ao usuário:

- O que você entendeu do processo, como uma lista numerada de passos.
- As regras que encontrou, com a fonte.
- O que os arquivos não respondem.
- Onde dois arquivos se contradizem.

Documento costuma descrever o processo ideal. Pergunte sempre: "na prática acontece assim mesmo?". Regra tirada de documento entra como `confirmada` só depois que o usuário disser que é seguida. Depois siga pra entrevista só com o que faltou.

## Etapa 2: entrevista, em três voltas

Siga os blocos de `references/roteiro-entrevista.md`. Não leia as perguntas como lista. Escolha a próxima pelo que a pessoa acabou de responder. Pule o que já foi respondido. Se a resposta abrir um assunto importante, siga por ele e volte depois.

**Volta 1, o caminho** (blocos 1 a 3): começo, fim e motivo; o caminho normal com quem faz e onde; onde o caminho se divide (decisões, voltas, fins alternativos, esperas). Feche mostrando a lista numerada de passos e peça confirmação antes de seguir.

**Volta 2, o que cada passo precisa** (blocos 4 a 6): pra cada passo, o que chega (de onde, em que formato, o mínimo pra começar, o que fazer se faltar), o que sai (pra onde, em que formato, com que campos), como se sabe que está pronto e o que dá errado. Depois as regras: o critério de cada decisão, limites, cálculos, prazos, permissões, e se cada uma está escrita ou é de cabeça. Depois onde a informação mora: os registros que passam por vários passos, o código que identifica cada um, e se cada ferramenta tem como ser acessada (API, exportação, só na mão).

Priorize a volta 2. Faça completo nos passos onde a informação troca de mãos, nas decisões, nos passos com dor e nos candidatos a automação. Nos outros passos, deduza do que já foi dito e confirme numa tabela só:

> | Passo | Precisa ter pra começar | Entrega | Pronto quando |
> |---|---|---|---|
> | 4. Mede o ambiente | endereço e horário da visita | medidas e fotos | todas as paredes medidas |
>
> Corrige o que estiver errado?

**Volta 3, dores e números** (blocos 7 e 8).

## Etapa 3: conferir antes de escrever

Antes de gerar qualquer arquivo, mostre:

1. O processo inteiro como texto corrido e numerado, do jeito que a pessoa explicaria pra um funcionário novo, com as decisões ("se o cliente pedir ajuste, volta pro passo 5").
2. A tabela do que cada passo precisa e entrega, só pros passos prioritários.
3. A lista de regras, cada uma com "escrita", "de cabeça" ou "ninguém soube".
4. O que ainda não está claro.

Pergunte o que está errado ou faltando. Só siga depois do OK.

## Etapa 4: escrever o JSON e checar

Leia `references/formato-processo.md` e escreva `processo.json` na pasta combinada. Os títulos dos passos são curtos, começam com verbo e cabem numa caixa: "Calcula o preço", não "Realização do cálculo de precificação do projeto".

Escreva também o `diagnostico`: sua leitura de onde está o gargalo de verdade, o que segura o processo e o que precisa ser resolvido antes de automatizar. É a única parte do documento que é análise sua; o resto é registro do que o usuário disse.

Depois rode:

```bash
node $SKILL/scripts/checar.mjs processos/<slug>/processo.json
```

- **ERROS** impedem gerar (campo faltando, seta pra passo que não existe, regra citada que não existe). Corrija e rode de novo.
- **FUROS** são perguntas. Leve pro usuário de uma vez, numerados ("achei 4 pontos que não fecham, vamos um por um"). Cada furo termina de um destes jeitos: o usuário responde e você corrige o JSON; era o mesmo item com dois nomes e você unifica; ou ninguém sabe e vira `lacuna`.
- **AUTOMAÇÃO** mostra o que falta pra cada candidato. Se algo dali dá pra perguntar agora, pergunte. O que não der fica no documento como item aberto da prontidão.

Rode de novo até não ter erro e cada furo ter sido resolvido ou registrado como lacuna.

## Etapa 5: gerar o documento e os desenhos

```bash
node $SKILL/scripts/gerar_md.mjs processos/<slug>/processo.json
node $SKILL/scripts/gerar_drawio.mjs processos/<slug>/processo.json
node $SKILL/scripts/gerar_excalidraw.mjs processos/<slug>/processo.json
```

Leia o `processo.md` gerado do começo ao fim. Se alguma frase ficou estranha, o problema está no JSON (título longo, nota repetindo o tempo, item com nome confuso): corrija lá e gere de novo. Não edite o `.md` à mão, porque a próxima geração sobrescreve.

Depois abra o diagrama no draw.io. Tente nesta ordem:

1. **MCP do draw.io conectado** (ferramenta `open_drawio_xml`, do pacote oficial `@drawio/mcp`): chame com `content` = o conteúdo do `.drawio`.
2. **Sem MCP:** rode
   ```bash
   node $SKILL/scripts/abrir_drawio.mjs processos/<slug>/<slug>.drawio
   ```
   Ele abre o navegador no app.diagrams.net com o diagrama carregado. O diagrama vai dentro da URL, depois do `#`, e não passa pelo servidor do draw.io.
3. **Se nada abrir:** diga pro usuário abrir o `.drawio` em app.diagrams.net (Arquivo > Abrir de > Dispositivo), no draw.io desktop ou na extensão "Draw.io Integration" do VS Code.

Avise o usuário de três coisas:

- O diagrama abre sem salvar. Pra guardar, é "Arquivo > Salvar como" e escolher Google Drive, OneDrive, GitHub ou o computador.
- Passando o mouse em cada passo aparece o que entra (com o mínimo), o que sai, quando está pronto, as regras e as observações.
- As páginas ficam nas abas embaixo: **Fluxo**, **Entradas e saídas**, **Regras** (se houver) e **Ferramentas**.

### Abrir no Excalidraw

```bash
node $SKILL/scripts/abrir_excalidraw.mjs processos/<slug>/<slug>.excalidraw
```

Ele imprime um link `https://excalidraw.com/#json=...` e abre no navegador. Passe o link pro usuário: é curto, dá pra mandar pro time no WhatsApp.

Antes de rodar, avise o usuário, uma vez, numa frase: o link funciona como o "Compartilhar" do próprio Excalidraw. O desenho é criptografado no computador dele e só o conteúdo criptografado vai pro servidor do Excalidraw; a chave fica no link. Quem tiver o link abre. Se o processo for sensível e ele preferir não gerar link, ele abre o arquivo direto: excalidraw.com > menu > Abrir.

Avise também: se o navegador já tiver um desenho no excalidraw.com, o Excalidraw pergunta se pode substituir. Quem quiser guardar o desenho anterior deve salvar antes ("Save to disk") ou abrir o link numa janela anônima.

Se o script falhar (sem internet, servidor recusou), o `.excalidraw` continua na pasta e abre do mesmo jeito pelo menu Abrir, pelo Obsidian (plugin Excalidraw) ou pela extensão Excalidraw do VS Code.

### Sem terminal (Claude.ai, Claude Desktop)

Se você estiver num ambiente que roda os scripts mas não abre navegador nem acessa a internet livremente, gere os arquivos e entregue pra download. Diga como abrir: `.drawio` em app.diagrams.net (Arquivo > Abrir de > Dispositivo) e `.excalidraw` em excalidraw.com (menu > Abrir).

### MCP do draw.io

Se o usuário pedir pra instalar o MCP do draw.io no Claude Code:

```bash
claude mcp add drawio -- npx -y @drawio/mcp
```

## Etapa 6: devolver

Feche com uma mensagem curta contendo:

1. Onde estão os arquivos, e o link do Excalidraw se tiver sido gerado.
2. **O que ainda não está claro**, com quem provavelmente sabe responder. Essa lista costuma ser a parte mais útil do mapeamento, então não a esconda no fim do documento.
3. **As regras que só existem na cabeça de alguém** ou que ninguém soube dizer. É o que trava qualquer automação e o que some quando a pessoa sai de férias.
4. **Até 3 candidatos a automação**, cada um com a prontidão (ex.: "4 de 7") e o que precisa estar resolvido antes. Exemplo: "o cálculo de preço pode ser automático, mas antes alguém precisa ser dono da tabela de preço de chapa e escrever a fórmula. Sem isso o agente calcula rápido com o preço errado."

Não prometa ganho de tempo ou economia sem número dado pelo usuário.

## Quando o processo mudar

Para atualizar, edite o `processo.json`, rode o `checar.mjs` e gere de novo o `.md`, o `.drawio` e o `.excalidraw`. Os três são **sobrescritos**. Um link do Excalidraw já enviado não muda: gere um link novo. Se o usuário já arrumou o diagrama à mão no draw.io, avise antes e salve o novo com outro nome (passe o caminho de saída como segundo argumento do script).
