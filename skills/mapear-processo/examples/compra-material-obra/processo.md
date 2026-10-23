# Compra de material para a obra

Exemplo fictício. Fazer o material certo chegar na obra antes de faltar, pelo preço combinado e com a nota fiscal no financeiro.

- **Começa quando:** O mestre de obras percebe que um material vai faltar
- **Termina com:** Material conferido na obra e fornecedor pago
- **Frequência:** Cerca de 15 pedidos por semana, somando 3 obras
- **Responsável:** Engenheiro responsável pelas obras
- **Quem participa:** Mestre de obras, Engenheiro, Diretor, Compras, Fornecedor, Financeiro
- **Ferramentas:** WhatsApp, Planilha de orçamento, Planilha de compras, ERP

## Diagnóstico

O pedido nasce num áudio sem quantidade nem especificação, e essa imprecisão atravessa o processo inteiro: o engenheiro liga de volta pra confirmar, compras redigita, e na entrega o mestre não tem o pedido fechado pra conferir. O problema começa no primeiro passo, não na cotação.

Duas regras seguram o processo e nenhuma está escrita: quando a compra fora do orçamento precisa do diretor (hoje, sempre) e como se escolhe o fornecedor além do preço. A primeira trava a compra por até 2 dias. A segunda impede qualquer automação da cotação, porque sem ela um agente só sabe escolher o mais barato.

## Passo a passo

1. **Vê que vai faltar material** (Mestre de obras)
2. **Pede por áudio** (Mestre de obras, WhatsApp)
   Áudio sem quantidade exata nem especificação. O engenheiro liga de volta pra confirmar.
3. **Confere com o orçamento** (Engenheiro, Planilha de orçamento)
   Tempo: 15 a 30 min.
4. **Está previsto?** (Engenheiro)
   Se sim, vai pro passo 6 (Registra a requisição) (regra R1). Se não, vai pro passo 5 (Aprova compra fora do orçamento) (regra R1).
5. **Aprova compra fora do orçamento** (Diretor, WhatsApp)
   Tempo: 1 a 2 dias parado. Não existe valor mínimo: até compra pequena passa pelo diretor.
6. **Registra a requisição** (Compras, Planilha de compras)
   Tempo: 10 min. Redigita o que veio no WhatsApp. A aprovação do diretor só é exigida quando a compra veio do passo 5.
7. **Pede 3 cotações** (Compras, WhatsApp)
   Tempo: 30 min. Mesma mensagem copiada pra cada fornecedor.
8. **Responde a cotação** (Fornecedor, WhatsApp)
   Tempo: 1 a 3 dias.
9. **Escolhe e fecha o pedido** (Compras, Planilha de compras)
   Ninguém soube dizer o critério além do preço. Prazo e histórico do fornecedor pesam, mas não estão escritos.
10. **Entrega na obra** (Fornecedor)
11. **Bate com o pedido?** (Mestre de obras)
    O mestre confere pela nota, porque não tem o pedido fechado na mão. Se sim, vai pro passo 13 (Lança a nota fiscal) (regra R5). Se não, vai pro passo 12 (Avisa compras) (regra R5).
12. **Avisa compras** (Mestre de obras, WhatsApp)
    Segue pro passo 10 (Entrega na obra).
13. **Lança a nota fiscal** (Financeiro, ERP)
    A nota vem em papel com o motorista e às vezes se perde no canteiro.
14. **Paga o fornecedor** (Financeiro, ERP)

## O que cada passo precisa e entrega

O mínimo que cada passo precisa pra começar, o que ele entrega e como se sabe que terminou. "?" é o que ainda não foi respondido.

### 1. Vê que vai faltar material

Mestre de obras

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| O que falta | passo 2 (Pede por áudio) | de cabeça | ? |

### 2. Pede por áudio

Mestre de obras · WhatsApp

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| O que falta | passo 1 (Vê que vai faltar material) | de cabeça | material, obra | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Áudio com o pedido | passo 3 (Confere com o orçamento) | áudio no WhatsApp | material, às vezes quantidade, obra |

**Pronto quando:** Áudio enviado no grupo da obra.

### 3. Confere com o orçamento

Engenheiro · Planilha de orçamento · 15 a 30 min

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Áudio com o pedido | passo 2 (Pede por áudio) | áudio no WhatsApp | material, quantidade, obra | liga pro mestre |
| Orçamento da obra | Planilha de orçamento (feita no início da obra) | Excel | material, quantidade prevista, quantidade já comprada | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Lista de material com quantidade | passo 4 (Está previsto?), passo 5 (Aprova compra fora do orçamento), passo 6 (Registra a requisição), passo 7 (Pede 3 cotações) | mensagem no WhatsApp | obra, material, quantidade e unidade, data limite |

**Pronto quando:** Cada item tem material, quantidade com unidade e obra.

### 4. Está previsto?

Engenheiro

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Lista de material com quantidade | passo 3 (Confere com o orçamento) | mensagem no WhatsApp | material, quantidade | ? |

**Regras**

- R1: Material e quantidade que estão na planilha de orçamento da obra contam como previstos. O resto é fora do orçamento.

### 5. Aprova compra fora do orçamento

Diretor · WhatsApp · 1 a 2 dias parado

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Lista de material com quantidade | passo 3 (Confere com o orçamento) | mensagem no WhatsApp | material, quantidade, obra, por que não estava previsto | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Aprovação do diretor | passo 6 (Registra a requisição) | mensagem no WhatsApp | ? |

**Pronto quando:** Diretor respondeu 'ok' na conversa.

**Regras**

- R2: Toda compra fora do orçamento passa pelo diretor, sem valor mínimo. (existe, mas não está escrita)

### 6. Registra a requisição

Compras · Planilha de compras · 10 min

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Lista de material com quantidade | passo 3 (Confere com o orçamento) | mensagem no WhatsApp | obra, material, quantidade e unidade | pergunta pro engenheiro |
| Aprovação do diretor | passo 5 (Aprova compra fora do orçamento) | mensagem no WhatsApp | ok do diretor | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Requisição na planilha | passo 7 (Pede 3 cotações) | linha no Google Sheets | obra, material, quantidade e unidade, data limite, previsto no orçamento |

**Pronto quando:** Linha criada com todos os campos obrigatórios.

### 7. Pede 3 cotações

Compras · WhatsApp · 30 min

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Requisição na planilha | passo 6 (Registra a requisição), passo 3 (Confere com o orçamento) | linha no Google Sheets | material, quantidade e unidade, data limite, endereço da obra | ? |
| Fornecedores da categoria | Contatos no celular de compras | de cabeça | 3 fornecedores que vendem o material | pergunta pro engenheiro quem indicar |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Pedido de cotação | passo 8 (Responde a cotação) | mensagem no WhatsApp | material, quantidade, endereço de entrega, prazo desejado |

**Pronto quando:** Mensagem enviada pra 3 fornecedores.

**Regras**

- R3: Toda compra precisa de 3 cotações.

### 8. Responde a cotação

Fornecedor · WhatsApp · 1 a 3 dias

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Pedido de cotação | passo 7 (Pede 3 cotações) | mensagem no WhatsApp | material, quantidade, endereço de entrega | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Preço e prazo | passo 9 (Escolhe e fecha o pedido) | mensagem ou PDF no WhatsApp | preço unitário, frete, prazo de entrega, condição de pagamento |

**Pronto quando:** 3 respostas recebidas, ou passou o prazo combinado.

**Quando dá errado**

- Fornecedor não responde: compras cobra por mensagem. Não tem prazo pra desistir dele

### 9. Escolhe e fecha o pedido

Compras · Planilha de compras

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Preço e prazo | passo 8 (Responde a cotação) | mensagem ou PDF no WhatsApp | preço unitário, frete, prazo de entrega | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Pedido fechado | passo 10 (Entrega na obra) | mensagem pro fornecedor + linha atualizada na planilha | fornecedor, preço total, data de entrega |

**Pronto quando:** Fornecedor confirmou o pedido e a data de entrega.

**Regras**

- R4: Escolhe o fornecedor pelo preço, pesando prazo e histórico de entrega. (ninguém soube dizer)

### 10. Entrega na obra

Fornecedor

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Pedido fechado | passo 9 (Escolhe e fecha o pedido) | mensagem no WhatsApp | material, quantidade, endereço, data | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Material entregue | passo 11 (Bate com o pedido?) | físico, no canteiro | ? |
| Nota fiscal em papel | passo 11 (Bate com o pedido?), passo 13 (Lança a nota fiscal) | papel, com o motorista | fornecedor, itens, valores |

**Pronto quando:** Material descarregado e nota entregue pro mestre.

### 11. Bate com o pedido?

Mestre de obras

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Material entregue | passo 10 (Entrega na obra) | físico, no canteiro | quantidade contada | ? |
| Nota fiscal em papel | passo 10 (Entrega na obra) | papel | itens, quantidades | ? |

**Regras**

- R5: A entrega bate quando material, quantidade e especificação da nota são iguais aos do pedido fechado.

**Depende de:** Mestre saber o que foi pedido. Hoje ele não vê o pedido fechado.

### 12. Avisa compras

Mestre de obras · WhatsApp

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Foto do problema | Compras, que cobra o fornecedor | foto no WhatsApp | ? |

**Pronto quando:** Compras confirmou que viu.

### 13. Lança a nota fiscal

Financeiro · ERP

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Nota fiscal em papel | passo 10 (Entrega na obra) | papel, trazida do canteiro | fornecedor, itens, valor, vencimento | liga pro mestre procurar a nota |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Conta a pagar | passo 14 (Paga o fornecedor) | lançamento no ERP | fornecedor, valor, vencimento, obra |

**Pronto quando:** Conta a pagar lançada com vencimento e obra.

**Depende de:** A nota chegar do canteiro até o escritório

### 14. Paga o fornecedor

Financeiro · ERP

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Conta a pagar | passo 13 (Lança a nota fiscal) | lançamento no ERP | valor, vencimento | ? |

**Pronto quando:** Pagamento feito no vencimento.

## Regras de negócio

Critérios de decisão, validações, cálculos, prazos e permissões. Uma regra que "existe, mas não está escrita" vive na cabeça de alguém: funciona até essa pessoa faltar, e um agente não tem como segui-la.

| # | Regra | Tipo | Onde vale | Fonte | Situação |
|---|---|---|---|---|---|
| R1 | Material e quantidade que estão na planilha de orçamento da obra contam como previstos. O resto é fora do orçamento. | decisão | 4 | entrevista (engenheiro) | confirmada |
| R2 | Toda compra fora do orçamento passa pelo diretor, sem valor mínimo. Ex.: Até 10 sacos de argamassa esperaram 2 dias. | permissão | 5 | entrevista (engenheiro) | existe, mas não está escrita |
| R3 | Toda compra precisa de 3 cotações. | validação | 7 | entrevista (compras) | confirmada |
| R4 | Escolhe o fornecedor pelo preço, pesando prazo e histórico de entrega. Ex.: Ninguém soube dizer quanto o prazo pesa contra o preço. | decisão | 9 | entrevista (compras) | ninguém soube dizer |
| R5 | A entrega bate quando material, quantidade e especificação da nota são iguais aos do pedido fechado. | decisão | 11 | entrevista (mestre de obras) | confirmada |

## Arquitetura

### Mapa das informações

Em que passo cada informação nasce e em quais é usada. Informação que nasce em texto livre e é usada em vários passos é onde o erro se espalha.

| Informação | Nasce em | Usada em | Formato |
|---|---|---|---|
| O que falta | 1 | 2 | de cabeça |
| Áudio com o pedido | 2 | 3 | áudio no WhatsApp |
| Requisição de compra | 3, 6 | 4, 5, 6, 7 | mensagem no WhatsApp; linha no Google Sheets |
| Aprovação do diretor | 5 | 6 | mensagem no WhatsApp |
| Pedido de cotação | 7 | 8 | mensagem no WhatsApp |
| Preço e prazo | 8 | 9 | mensagem ou PDF no WhatsApp |
| Pedido fechado | 9 | 10 | mensagem pro fornecedor + linha atualizada na planilha |
| Material entregue | 10 | 11 | físico, no canteiro |
| Nota fiscal em papel | 10 | 11, 13 | papel, com o motorista |
| Foto do problema | 12 | Compras, que cobra o fornecedor | foto no WhatsApp |
| Conta a pagar | 13 | 14 | lançamento no ERP |
| Orçamento da obra | Planilha de orçamento (feita no início da obra) | 3 | Excel |
| Fornecedores da categoria | Contatos no celular de compras | 7 | de cabeça |

### Requisição de compra

O que a obra precisa, já conferido pelo engenheiro.

- **Fica em:** Planilha de compras
- **Quem é dono:** Compras
- **Identificado por:** Obra + data (não tem número de requisição)

| Campo | Obrigatório | Formato | Exemplo |
|---|---|---|---|
| obra | sim |  |  |
| material | sim |  | cimento CP-II 50kg |
| quantidade e unidade | sim |  | 40 sacos |
| data limite na obra | sim |  |  |
| previsto no orçamento | sim | sim / não |  |

### Sistemas

"Como acessar" é o que define se um agente consegue ler e escrever ali sem alguém no meio.

| Ferramenta | Pra quê | Passos | Como acessar |
|---|---|---|---|
| WhatsApp | pedidos, aprovações e cotações | 2, 5, 7, 8, 12 | só na mão |
| Planilha de orçamento | custo previsto de cada obra | 3 | exporta arquivo. Excel no Drive |
| Planilha de compras | Google Sheets de compras | 6, 9 | tem API |
| ERP | notas fiscais e pagamentos | 13, 14 | não sabemos |

### Passagens entre ferramentas

Cada linha é um lugar onde alguém copia informação de um lugar pro outro, ou onde ela se perde.

| De | Pra | O que passa | Passos |
|---|---|---|---|
| WhatsApp | Planilha de orçamento | Áudio com o pedido | 2 → 3 |
| WhatsApp | Planilha de compras | Aprovação do diretor | 5 → 6 |
| Planilha de compras | WhatsApp | Requisição na planilha | 6 → 7 |
| WhatsApp | Planilha de compras | Preço e prazo | 8 → 9 |

## Furos encontrados na checagem

A checagem não achou entrada sem origem, saída sem destino nem decisão sem critério.

## O que ainda não está claro

- Qual o critério pra escolher o fornecedor além do preço? (passo 9; quem deve saber: compras e engenheiro)
- Existe um valor abaixo do qual a compra fora do orçamento não precisa do diretor? (passo 5; quem deve saber: diretor)
- Quantas entregas por mês chegam erradas? (passo 11; quem deve saber: mestre de obras)
- O ERP tem API ou importa XML de nota fiscal? (quem deve saber: financeiro)

## Onde dói

- **Passo 2, Pede por áudio:** Áudio sem quantidade exata nem especificação. O engenheiro liga de volta pra confirmar.
- **Passo 5, Aprova compra fora do orçamento:** Não existe valor mínimo: até compra pequena passa pelo diretor.
- **Passo 11, Bate com o pedido?:** O mestre confere pela nota, porque não tem o pedido fechado na mão.
- **Passo 13, Lança a nota fiscal:** A nota vem em papel com o motorista e às vezes se perde no canteiro.

## Onde faz sentido automatizar

Para cada candidato, a lista de prontidão mostra o que já está definido pra um agente fazer esse passo e o que falta perguntar antes.

### Agente ouve o áudio do mestre e devolve a requisição pronta: material, quantidade e obra

- **Passo:** 2. Pede por áudio
- **Por quê:** O áudio é a origem da imprecisão que atravessa o processo.
- **Precisa estar resolvido antes:** Uma lista padrão dos materiais mais pedidos, com o nome que a obra usa, e um número de WhatsApp com API.
- **Quem revisa:** Engenheiro confirma a requisição antes de ir pra compras

**Prontidão: 4 de 7**

- [x] Mínimo de cada entrada definido
- [x] De onde vem cada entrada e em que formato chega
- [x] Critério de pronto do passo: Áudio enviado no grupo da obra.
- [ ] Regras do passo. Nenhuma registrada: confirmar se o passo segue algum critério
- [ ] Acesso às ferramentas: WhatsApp (só na mão)
- [ ] O que fazer quando falta informação ou dá errado
- [x] Quem revisa o que o agente fizer: Engenheiro confirma a requisição antes de ir pra compras

### Agente manda a cotação pros fornecedores da categoria e junta as respostas numa tabela

- **Passo:** 7. Pede 3 cotações
- **Por quê:** É a mesma mensagem copiada três vezes, e as respostas chegam em formatos diferentes.
- **Precisa estar resolvido antes:** Cadastro de fornecedores por categoria e o critério de escolha (R4) escrito. Sem isso o agente só sabe escolher o mais barato.
- **Quem revisa:** Compras escolhe o fornecedor a partir da tabela

**Prontidão: 6 de 7**

- [x] Mínimo de cada entrada definido
- [x] De onde vem cada entrada e em que formato chega
- [x] Critério de pronto do passo: Mensagem enviada pra 3 fornecedores.
- [x] Regras do passo confirmadas (R3)
- [ ] Acesso às ferramentas: WhatsApp (só na mão), Planilha de compras (tem API), Planilha de orçamento (exporta arquivo)
- [x] O que fazer quando falta informação ou dá errado
- [x] Quem revisa o que o agente fizer: Compras escolhe o fornecedor a partir da tabela

### Lançar a nota a partir do XML que o fornecedor manda por e-mail e conferir com o pedido

- **Passo:** 13. Lança a nota fiscal
- **Por quê:** A nota em papel se perde, e o XML tem os mesmos dados sem digitação.
- **Precisa estar resolvido antes:** Pedir pra todo fornecedor mandar o XML da nota por e-mail, e descobrir se o ERP importa XML.
- **Quem revisa:** Financeiro confere o lançamento antes de pagar

**Prontidão: 5 de 7**

- [x] Mínimo de cada entrada definido
- [x] De onde vem cada entrada e em que formato chega
- [x] Critério de pronto do passo: Conta a pagar lançada com vencimento e obra.
- [ ] Regras do passo. Nenhuma registrada: confirmar se o passo segue algum critério
- [ ] Acesso às ferramentas: ERP (não sabemos)
- [x] O que fazer quando falta informação ou dá errado
- [x] Quem revisa o que o agente fizer: Financeiro confere o lançamento antes de pagar
