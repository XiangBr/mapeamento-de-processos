# mapeamento-de-processos

Skill pra Claude (Claude Code, Claude.ai, Claude Desktop) e outros agentes que leem skills. Mapeia um processo da sua empresa de ponta a ponta, desenha o resultado no draw.io e no Excalidraw e entrega um documento com o que cada passo precisa, as regras de negócio e os sistemas envolvidos.

Antes de colocar I.A. ou um agente pra fazer parte de um trabalho, você precisa saber descrever esse trabalho: quem faz cada passo, em qual ferramenta, o mínimo que precisa chegar pra ele começar, o que ele entrega, como se sabe que terminou, com base em quê cada decisão é tomada e o que acontece quando dá errado. Essa skill faz essas perguntas com você.

## O que ela faz

1. **Entrevista você** sobre o processo, uma pergunta por vez, em linguagem simples. Ou **lê os arquivos que você indicar** (procedimentos, planilhas, prints, transcrição de reunião) e só pergunta o que faltou.
2. **Confere com você** o processo inteiro, em texto, antes de escrever qualquer arquivo.
3. **Procura furos**: um passo que precisa de algo que nenhum outro entrega, uma saída que ninguém usa, uma decisão sem critério, a mesma coisa com dois nomes. Cada furo vira uma pergunta.
4. **Escreve o documento** (`processo.md`), com:
   - o passo a passo e um diagnóstico de onde está o gargalo;
   - **o que cada passo precisa e entrega**: de onde vem cada informação, em que formato, o mínimo pra começar, o que fazer se faltar, e quando o passo está pronto;
   - **as regras de negócio**: critérios de decisão, cálculos, limites, prazos e permissões, cada uma marcada como escrita, de cabeça ou desconhecida;
   - **a arquitetura**: onde cada informação nasce e é usada, os registros principais e seus campos, e se cada sistema tem API, exporta arquivo ou é só na mão;
   - o que não está claro, onde dói, e até 3 candidatos a automação com uma lista de prontidão ("4 de 7: falta o critério de pronto, a regra de cálculo e saber se a planilha tem API").
5. **Desenha no draw.io**, com até quatro páginas:
   - **Fluxo:** uma faixa por pessoa ou área, passos da esquerda pra direita, decisões, voltas, e os pontos de dor, de automação e de dúvida marcados com cor.
   - **Entradas e saídas:** quem faz, ferramenta, o mínimo que precisa ter, o que entrega, quando está pronto e as regras de cada passo.
   - **Regras:** as regras de negócio, com as que não estão confirmadas em destaque.
   - **Ferramentas:** o que passa de uma ferramenta pra outra e como cada uma pode ser acessada.

6. **Desenha no Excalidraw** o mesmo fluxo, no traço de quadro branco, e gera um link curto que abre direto no excalidraw.com. Bom pra discutir com o time e rabiscar por cima.

Os diagramas abrem com um clique. Você edita e salva onde quiser: Google Drive, OneDrive, GitHub ou no computador.

## Instalar e usar

Escolha onde você usa o Claude. A skill é a mesma pasta, `skills/mapear-processo`.

### Claude Code (terminal, VS Code, app desktop)

1. Instale com um comando:
   ```
   npx skills add XiangBr/mapeamento-de-processos
   ```
   Ou baixe o repositório e copie a pasta `skills/mapear-processo` pra `~/.claude/skills/` (vale pra todos os projetos) ou pra `.claude/skills/` dentro de um projeto.
2. Abra o Claude Code na pasta onde quer guardar os mapas e peça:
   ```
   quero mapear o processo de orçamento da minha empresa
   ```
   ou chame direto:
   ```
   /mapear-processo lê a pasta ./procedimentos e mapeia o processo de compras
   ```
3. Responda a entrevista. No fim, o draw.io e o Excalidraw abrem no navegador.

**Requisito:** Node 18 ou mais novo (`node --version` pra conferir; baixe em nodejs.org).

### Claude.ai ou Claude Desktop (chat)

1. Baixe o `mapear-processo.zip` na página de [Releases](https://github.com/XiangBr/mapeamento-de-processos/releases).
2. No Claude, vá em **Configurações > Capacidades**, ative a execução de código e, em **Skills**, envie o zip.
3. Num chat novo, peça "quero mapear o processo de compras da minha empresa".

No chat, o Claude gera os arquivos e te entrega pra baixar. Abra o `.drawio` em [app.diagrams.net](https://app.diagrams.net) (Arquivo > Abrir de > Dispositivo) e o `.excalidraw` em [excalidraw.com](https://excalidraw.com) (menu > Abrir).

### Outros agentes (Codex, Cursor, Gemini CLI e afins)

O `npx skills add` pergunta em qual agente instalar. Se o seu não aparecer, copie a pasta `skills/mapear-processo` pro projeto e peça: "leia `skills/mapear-processo/SKILL.md` e siga pra mapear o processo de X".

### Opcional: MCP oficial do draw.io

A skill funciona sem MCP: ela gera um link que abre o diagrama no draw.io pelo navegador. Se você tiver o MCP oficial do draw.io instalado, ela usa ele.

```
claude mcp add drawio -- npx -y @drawio/mcp
```

## O que você recebe

Os arquivos ficam em `processos/<nome-do-processo>/`:

| Arquivo | O que é |
|---|---|
| `processo.md` | O documento completo: passo a passo, requisitos de cada passo, regras, arquitetura, furos, dúvidas, dores e candidatos a automação |
| `<nome>.drawio` | O diagrama completo, com 4 páginas |
| `<nome>.excalidraw` | O fluxo no Excalidraw |
| `processo.json` | Os dados estruturados. É a fonte dos outros três |

Se a pasta estiver no OneDrive, Google Drive ou Dropbox, os arquivos já ficam na sua nuvem.

**Sobre o link do Excalidraw:** funciona como o botão "Compartilhar" do próprio Excalidraw. O desenho é criptografado no seu computador, só o conteúdo criptografado vai pro servidor deles, e a chave fica no link. Quem tiver o link abre. Se preferir não gerar link, abra o `.excalidraw` pelo menu do excalidraw.com.

## Exemplos

Dois processos completos, fictícios, em [`skills/mapear-processo/examples`](skills/mapear-processo/examples):

- `compra-material-obra`: compra de material numa construtora pequena, do áudio do mestre de obras até o pagamento do fornecedor.
- `orcamento-marcenaria`: orçamento numa marcenaria de móveis planejados, do primeiro contato até o pedido fechado.

Pra abrir um deles:

```
node skills/mapear-processo/scripts/abrir_drawio.mjs skills/mapear-processo/examples/compra-material-obra/compra-material-obra.drawio
node skills/mapear-processo/scripts/abrir_excalidraw.mjs skills/mapear-processo/examples/compra-material-obra/compra-material-obra.excalidraw
```

Pra regenerar tudo depois de editar o `processo.json`:

```
node skills/mapear-processo/scripts/checar.mjs processo.json
node skills/mapear-processo/scripts/gerar_md.mjs processo.json
node skills/mapear-processo/scripts/gerar_drawio.mjs processo.json
node skills/mapear-processo/scripts/gerar_excalidraw.mjs processo.json
```

## Mapeando software?

Pra arquitetura de sistema e código, recomendo o [archify](https://github.com/tt-a1i/archify). Ele lê o repositório e monta o diagrama da arquitetura.

## Licença

MIT
