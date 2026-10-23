# Orçamento de móveis planejados

Exemplo fictício. Transformar um pedido de orçamento em pedido fechado, com projeto e preço que a fábrica consegue cumprir.

- **Começa quando:** Cliente pede orçamento pelo WhatsApp ou Instagram
- **Termina com:** Pedido fechado, com sinal pago e projeto liberado pra produção
- **Frequência:** Cerca de 12 pedidos de orçamento por semana
- **Responsável:** Dono da marcenaria
- **Quem participa:** Cliente, Comercial, Projetista, Financeiro
- **Ferramentas:** WhatsApp, Planilha de leads, Caderno, Promob, Planilha de custos, Conta Azul

## Diagnóstico

O processo funciona, mas depende de três coisas que não estão escritas: a tabela de preço de chapa, o critério de desconto e o motivo de perda. As três aparecem como lacuna e são justamente o que um agente precisaria pra calcular preço ou fazer follow-up.

A informação do cliente é digitada três vezes (planilha de leads, Promob, Conta Azul) e não existe um código de orçamento que ligue as três. Antes de automatizar qualquer passo, vale criar esse código. Sem ele, um agente não sabe que a linha da planilha, o projeto e o contrato são do mesmo cliente.

## Passo a passo

1. **Pede orçamento** (Cliente, WhatsApp)
2. **Registra o contato** (Comercial, Planilha de leads)
   Tempo: 5 min. Copia e cola na mão. Às vezes esquece e o lead some.
3. **Agenda a medição** (Comercial, WhatsApp)
   Tempo: 1 a 3 dias de troca de mensagem. A troca de mensagem pra achar horário leva até 3 dias.
4. **Mede o ambiente** (Projetista, Caderno)
   Tempo: 1h30 no local.
5. **Desenha o projeto** (Projetista, Promob)
   Tempo: 1 a 2 dias. Na primeira vez entra sem pedido de ajuste. O pedido de ajuste só existe quando o cliente volta do passo 8.
6. **Calcula o preço** (Financeiro, Planilha de custos)
   Não se sabe quanto tempo leva. Ninguém soube dizer com que frequência a tabela de chapa é atualizada, nem quanto tempo o cálculo leva.
7. **Apresenta a proposta** (Comercial, WhatsApp)
8. **Aprova?** (Cliente)
   Se sim, vai pro passo 9 (Emite contrato e cobra o sinal). Se pede ajuste, vai pro passo 5 (Desenha o projeto) (regra R5). Se não, vai pro passo 11 (Marca como perdido).
9. **Emite contrato e cobra o sinal** (Financeiro, Conta Azul)
   Tempo: 1 dia. Redigita no Conta Azul os dados do cliente que já estavam na planilha de leads.
10. **Libera pra produção** (Projetista, Promob)
11. **Marca como perdido** (Comercial, Planilha de leads)
    O motivo da perda não é registrado.

## O que cada passo precisa e entrega

O mínimo que cada passo precisa pra começar, o que ele entrega e como se sabe que terminou. "?" é o que ainda não foi respondido.

### 1. Pede orçamento

Cliente · WhatsApp

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Mensagem do cliente | passo 2 (Registra o contato) | texto livre no WhatsApp | o que quer, às vezes fotos do ambiente |

### 2. Registra o contato

Comercial · Planilha de leads · 5 min

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Mensagem do cliente | passo 1 (Pede orçamento) | texto livre no WhatsApp | nome, telefone, ambiente | pergunta de volta no WhatsApp antes de registrar |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Lead na planilha | passo 3 (Agenda a medição) | linha no Google Sheets | nome, telefone, ambiente, bairro, origem, status = novo |

**Pronto quando:** A linha existe com nome, telefone, ambiente e status 'novo'.

### 3. Agenda a medição

Comercial · WhatsApp · 1 a 3 dias de troca de mensagem

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Lead na planilha | passo 2 (Registra o contato) | linha no Google Sheets | telefone, ambiente, bairro | ? |
| Agenda do projetista | Projetista, por mensagem | mensagem no WhatsApp | dias e horários livres na semana | manda mensagem pro projetista e espera |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Visita marcada | passo 4 (Mede o ambiente) | mensagem no WhatsApp + status na planilha | endereço completo, data e hora, status = medição marcada |

**Pronto quando:** Cliente confirmou data, hora e endereço por escrito.

**Regras**

- R1: Só agenda medição se o cliente informou ambiente e bairro, e o bairro está na área atendida. (existe, mas não está escrita)

**Quando dá errado**

- Bairro fora da área atendida: avisa o cliente que não atende e marca como perdido
- Cliente some no meio da conversa: não tem regra. Às vezes alguém cobra, às vezes não

### 4. Mede o ambiente

Projetista · Caderno · 1h30 no local

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Visita marcada | passo 3 (Agenda a medição) | mensagem no WhatsApp | endereço completo, data e hora | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Medidas do ambiente | passo 5 (Desenha o projeto) | anotação à mão no caderno | paredes, pé-direito, pontos de água e luz, janelas e portas |
| Preferências do cliente | passo 5 (Desenha o projeto) | anotação à mão + fotos no celular | cor, puxador, o que vai guardar |

**Pronto quando:** Todas as paredes do ambiente medidas, com pontos de água e luz marcados.

### 5. Desenha o projeto

Projetista · Promob · 1 a 2 dias

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Medidas do ambiente | passo 4 (Mede o ambiente) | anotação à mão no caderno | paredes, pé-direito, pontos de água e luz | liga pro cliente e pede foto com trena, ou volta no local |
| Preferências do cliente | passo 4 (Mede o ambiente) | anotação + fotos | cor | ? |
| Pedido de ajuste | passo 8 (Aprova?) | mensagem no WhatsApp | o que mudar | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Projeto 3D | passo 7 (Apresenta a proposta), passo 10 (Libera pra produção) | arquivo Promob + imagens renderizadas | ? |
| Lista de peças | passo 6 (Calcula o preço) | CSV exportado do Promob | peça, material / cor da chapa, medidas, quantidade, ferragens |

**Pronto quando:** Projeto renderizado e lista de peças exportada.

**Depende de:** Medidas passadas do caderno pro computador

### 6. Calcula o preço

Financeiro · Planilha de custos · ?

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Lista de peças | passo 5 (Desenha o projeto) | CSV exportado do Promob | material / cor da chapa, medidas, quantidade | devolve pro projetista |
| Tabela de preço de chapa | Fornecedor de chapa, PDF por e-mail | PDF | preço por chapa de cada material e cor | usa a última tabela que tiver |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Preço final | passo 7 (Apresenta a proposta) | valor na planilha de custos | custo, margem, preço à vista, preço parcelado |

**Pronto quando:** ?

**Regras**

- R2: Preço = custo das chapas pela tabela + ferragens + mão de obra por m² + margem. (existe, mas não está escrita)
- R3: Margem mínima de 35% sobre o custo.

### 7. Apresenta a proposta

Comercial · WhatsApp

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Projeto 3D | passo 5 (Desenha o projeto) | imagens renderizadas | imagens de todos os ambientes orçados | ? |
| Preço final | passo 6 (Calcula o preço) | valor na planilha de custos | preço à vista, preço parcelado | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Proposta em PDF | passo 8 (Aprova?) | PDF pelo WhatsApp | imagens, descrição dos móveis, preço, condições, validade de 15 dias |

**Pronto quando:** PDF enviado e cliente visualizou.

**Regras**

- R4: Desconto acima de 5% só com aprovação do dono. (ninguém soube dizer)
- R6: A proposta vale 15 dias. Depois disso o preço é recalculado.

### 8. Aprova?

Cliente

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Proposta em PDF | passo 7 (Apresenta a proposta) | PDF pelo WhatsApp | preço, imagens | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Proposta aprovada | passo 9 (Emite contrato e cobra o sinal) | mensagem no WhatsApp | ? |
| Pedido de ajuste | passo 5 (Desenha o projeto) | mensagem no WhatsApp | ? |

**Regras**

- R5: Cliente pode pedir até 2 rodadas de ajuste sem custo. Da terceira em diante, cobra o projeto.

### 9. Emite contrato e cobra o sinal

Financeiro · Conta Azul · 1 dia

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Proposta aprovada | passo 8 (Aprova?) | mensagem no WhatsApp | valor fechado, forma de pagamento | ? |
| Dados do cliente pro contrato | Cliente, pedidos por WhatsApp | mensagem no WhatsApp | nome completo, CPF, endereço da obra | não emite o contrato |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Contrato assinado | Pasta do cliente no Drive | PDF assinado | ? |
| Sinal pago | passo 10 (Libera pra produção) | pagamento compensado no Conta Azul | valor, data |

**Pronto quando:** Contrato assinado pelas duas partes e boleto do sinal emitido.

### 10. Libera pra produção

Projetista · Promob

**Precisa ter pra começar**

| O quê | De onde vem | Formato | Mínimo pra começar | Se faltar |
|---|---|---|---|---|
| Sinal pago | passo 9 (Emite contrato e cobra o sinal) | pagamento compensado no Conta Azul | 50% do valor compensado | ? |
| Projeto 3D | passo 5 (Desenha o projeto) | arquivo Promob | versão aprovada pelo cliente | ? |

**Entrega**

| O quê | Pra quem / onde | Formato | Campos |
|---|---|---|---|
| Plano de corte | Fábrica | arquivo gerado pelo Promob | ? |

**Pronto quando:** Plano de corte entregue pra fábrica.

**Regras**

- R7: Só libera pra produção com sinal de 50% compensado na conta.

### 11. Marca como perdido

Comercial · Planilha de leads

**Pronto quando:** Status 'perdido' na planilha.

## Regras de negócio

Critérios de decisão, validações, cálculos, prazos e permissões. Uma regra que "existe, mas não está escrita" vive na cabeça de alguém: funciona até essa pessoa faltar, e um agente não tem como segui-la.

| # | Regra | Tipo | Onde vale | Fonte | Situação |
|---|---|---|---|---|---|
| R1 | Só agenda medição se o cliente informou ambiente e bairro, e o bairro está na área atendida. Ex.: Fora de Curitiba e região metropolitana não atende. | validação | 3 | entrevista (comercial) | existe, mas não está escrita |
| R2 | Preço = custo das chapas pela tabela + ferragens + mão de obra por m² + margem. | cálculo | 6 | entrevista (financeiro) | existe, mas não está escrita |
| R3 | Margem mínima de 35% sobre o custo. | restrição | 6 | entrevista (dono) | confirmada |
| R4 | Desconto acima de 5% só com aprovação do dono. Ex.: O comercial disse 5%, o dono disse 'depende do cliente'. | permissão | 7 | entrevista (comercial) | ninguém soube dizer |
| R5 | Cliente pode pedir até 2 rodadas de ajuste sem custo. Da terceira em diante, cobra o projeto. | decisão | 8 | contrato padrão, cláusula 4 | confirmada |
| R6 | A proposta vale 15 dias. Depois disso o preço é recalculado. | prazo | 7 | rodapé do PDF da proposta | confirmada |
| R7 | Só libera pra produção com sinal de 50% compensado na conta. | validação | 10 | entrevista (financeiro) | confirmada |

## Arquitetura

### Mapa das informações

Em que passo cada informação nasce e em quais é usada. Informação que nasce em texto livre e é usada em vários passos é onde o erro se espalha.

| Informação | Nasce em | Usada em | Formato |
|---|---|---|---|
| Mensagem do cliente | 1 | 2 | texto livre no WhatsApp |
| Lead | 2 | 3 | linha no Google Sheets |
| Visita marcada | 3 | 4 | mensagem no WhatsApp + status na planilha |
| Medidas do ambiente | 4 | 5 | anotação à mão no caderno |
| Preferências do cliente | 4 | 5 | anotação à mão + fotos no celular |
| Projeto 3D | 5 | 7, 10 | arquivo Promob + imagens renderizadas |
| Lista de peças | 5 | 6 | CSV exportado do Promob |
| Preço final | 6 | 7 | valor na planilha de custos |
| Proposta em PDF | 7 | 8 | PDF pelo WhatsApp |
| Proposta aprovada | 8 | 9 | mensagem no WhatsApp |
| Pedido de ajuste | 8 | 5 | mensagem no WhatsApp |
| Contrato assinado | 9 | Pasta do cliente no Drive | PDF assinado |
| Sinal pago | 9 | 10 | pagamento compensado no Conta Azul |
| Plano de corte | 10 | Fábrica | arquivo gerado pelo Promob |
| Agenda do projetista | Projetista, por mensagem | 3 | mensagem no WhatsApp |
| Tabela de preço de chapa | Fornecedor de chapa, PDF por e-mail | 6 | PDF |
| Dados do cliente pro contrato | Cliente, pedidos por WhatsApp | 9 | mensagem no WhatsApp |

### Lead

Um cliente que pediu orçamento.

- **Fica em:** Planilha de leads
- **Quem é dono:** Comercial
- **Identificado por:** Telefone do cliente (não existe código de orçamento)

| Campo | Obrigatório | Formato | Exemplo |
|---|---|---|---|
| nome | sim |  |  |
| telefone | sim | (41) 9xxxx-xxxx |  |
| ambiente | sim |  | cozinha, dormitório casal |
| bairro | não |  |  |
| origem | não |  | Instagram, indicação |
| status | sim |  | novo, medição marcada, proposta enviada, fechado, perdido |

### Lista de peças

Saída do Promob com cada peça do projeto.

- **Fica em:** Promob (exportada em CSV)
- **Quem é dono:** Projetista
- **Identificado por:** Nome do arquivo do projeto

| Campo | Obrigatório | Formato | Exemplo |
|---|---|---|---|
| peça | sim |  |  |
| material / cor da chapa | sim |  | MDF 18mm branco TX |
| largura x altura (mm) | sim |  |  |
| quantidade | sim |  |  |
| ferragens | não |  |  |

### Sistemas

"Como acessar" é o que define se um agente consegue ler e escrever ali sem alguém no meio.

| Ferramenta | Pra quê | Passos | Como acessar |
|---|---|---|---|
| WhatsApp | conversa com o cliente | 1, 3, 7 | só na mão. WhatsApp comum no celular do comercial, sem API |
| Planilha de leads | Google Sheets | 2, 11 | tem API |
| Caderno | anotação da medição | 4 | só na mão |
| Promob | projeto 3D | 5, 10 | exporta arquivo. exporta a lista de peças em CSV |
| Planilha de custos | Excel do financeiro | 6 | não sabemos. fica no computador do financeiro, não ficou claro se está na nuvem |
| Conta Azul | contrato e cobrança | 9 | tem API |

### Passagens entre ferramentas

Cada linha é um lugar onde alguém copia informação de um lugar pro outro, ou onde ela se perde.

| De | Pra | O que passa | Passos |
|---|---|---|---|
| WhatsApp | Planilha de leads | Mensagem do cliente | 1 → 2 |
| Planilha de leads | WhatsApp | Lead na planilha | 2 → 3 |
| WhatsApp | Caderno | Visita marcada | 3 → 4 |
| Caderno | Promob | Medidas do ambiente, Preferências do cliente | 4 → 5 |
| Promob | Planilha de custos | Lista de peças | 5 → 6 |
| Planilha de custos | WhatsApp | Preço final | 6 → 7 |
| Conta Azul | Promob | Sinal pago | 9 → 10 |

## Furos encontrados na checagem

A checagem não achou entrada sem origem, saída sem destino nem decisão sem critério.

## O que ainda não está claro

- Com que frequência a tabela de preço de chapa é atualizada, e por quem? (passo 6; quem deve saber: financeiro)
- Quanto tempo leva o cálculo de preço, e como se sabe que ele está certo? (passo 6; quem deve saber: financeiro)
- Qual o limite real de desconto sem falar com o dono? O comercial diz 5%, o dono diz 'depende'. (passo 7; quem deve saber: dono)
- Por que o cliente desiste? Não há registro do motivo. (passo 11; quem deve saber: comercial)
- A planilha de custos está na nuvem ou só no computador do financeiro? (quem deve saber: financeiro)

## Onde dói

- **Passo 3, Agenda a medição:** A troca de mensagem pra achar horário leva até 3 dias.
- **Passo 9, Emite contrato e cobra o sinal:** Redigita no Conta Azul os dados do cliente que já estavam na planilha de leads.

## Onde faz sentido automatizar

Para cada candidato, a lista de prontidão mostra o que já está definido pra um agente fazer esse passo e o que falta perguntar antes.

### Agente lê a primeira mensagem e cria o lead na planilha

- **Passo:** 2. Registra o contato
- **Por quê:** É cópia manual, e quando falha o cliente some.
- **Precisa estar resolvido antes:** Um número de WhatsApp com API (o atual é o celular do comercial). Sem isso o agente não lê a mensagem.
- **Quem revisa:** Comercial confere a planilha no fim do dia

**Prontidão: 5 de 7**

- [x] Mínimo de cada entrada definido
- [x] De onde vem cada entrada e em que formato chega
- [x] Critério de pronto do passo: A linha existe com nome, telefone, ambiente e status 'novo'.
- [ ] Regras do passo. Nenhuma registrada: confirmar se o passo segue algum critério
- [ ] Acesso às ferramentas: Planilha de leads (tem API), WhatsApp (só na mão)
- [x] O que fazer quando falta informação ou dá errado
- [x] Quem revisa o que o agente fizer: Comercial confere a planilha no fim do dia

### Cálculo de preço a partir da lista de peças exportada do Promob

- **Passo:** 6. Calcula o preço
- **Por quê:** O projeto já gera a lista de peças em CSV, e o cálculo é repetitivo.
- **Precisa estar resolvido antes:** Alguém ser dono da tabela de preço de chapa e a fórmula (R2) ser escrita. Sem isso, o agente calcula rápido com o preço errado.
- **Quem revisa:** Financeiro aprova o preço antes de ir pro comercial

**Prontidão: 4 de 7**

- [x] Mínimo de cada entrada definido
- [x] De onde vem cada entrada e em que formato chega
- [ ] Critério de pronto do passo
- [ ] Regras do passo confirmadas. Ainda não: R2 (existe, mas não está escrita)
- [ ] Acesso às ferramentas: Planilha de custos (não sabemos), Promob (exporta arquivo)
- [x] O que fazer quando falta informação ou dá errado
- [x] Quem revisa o que o agente fizer: Financeiro aprova o preço antes de ir pro comercial

## Fontes

- Entrevista com o dono e o comercial (fictícia)
- Modelo de contrato, cláusula 4 (fictício)
