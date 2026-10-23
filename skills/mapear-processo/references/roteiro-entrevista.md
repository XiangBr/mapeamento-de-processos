# Roteiro de entrevista

Banco de perguntas por bloco. Não é pra ler em sequência. Escolha a próxima pergunta pelo que a pessoa acabou de dizer e pule o que já foi respondido.

Entre parênteses está o campo do `processo.json` que a resposta preenche.

A entrevista anda em três voltas:

1. **O caminho** (blocos 1, 2 e 3): do começo ao fim, quem faz, onde, e onde o caminho se divide. Sai daqui o desenho.
2. **O que cada passo precisa** (blocos 4, 5 e 6): o mínimo pra começar, o que entrega, quando está pronto, as regras, onde a informação mora. Sai daqui o documento.
3. **Dores e números** (blocos 7 e 8).

Não comece a volta 2 antes de a pessoa confirmar o caminho. Detalhar um passo que depois some do mapa é tempo jogado fora.

## 1. Começo, fim e motivo

- Como vocês chamam esse processo aí dentro? (`nome`)
- O que faz ele começar? Uma mensagem, um pedido, uma data no calendário, um e-mail? (`gatilho`)
- Quando você considera que ele terminou? O que tem na mão no fim? (`resultado`)
- Pra que ele existe? Se ninguém fizesse, o que dava errado? (`objetivo`)
- Quem responde por ele quando dá problema? (`dono`)
- Quantas vezes isso acontece por semana ou por mês? (`frequencia`)

## 2. O caminho normal

Comece pelo caso mais comum, sem exceção.

- Me conta o que acontece logo depois que [gatilho].
- E depois?
- Quem faz isso? É sempre a mesma pessoa ou depende? (`responsavel`)
- Onde isso é feito? Sistema, planilha, WhatsApp, papel, de cabeça? (`ferramenta`)
- Tem algum passo que acontece "por fora", que não está em sistema nenhum? Uma conferência, uma mensagem, uma anotação no caderno?

Pare quando chegar no `resultado`. Confira: "então do [gatilho] até [resultado] são esses N passos, certo?"

## 3. Onde o caminho se divide

- Em algum momento alguém precisa decidir ou aprovar alguma coisa? Quem? (`tipo: "decisao"`)
- O que acontece quando [passo] dá errado? Volta pra onde?
- Tem caso que pula algum passo? Cliente antigo, pedido pequeno, urgência?
- Existe um jeito de o processo terminar sem dar certo? Cancelamento, desistência, recusa. (vira um passo `fim` separado)
- Em que ponto o processo fica mais tempo parado, esperando o quê? (`tipo: "espera"` quando a espera é longa e previsível)

Aqui basta saber que a decisão existe e pra onde cada caminho vai. O critério de cada uma fica pro bloco 5.

## 4. O que cada passo precisa e entrega

É o bloco mais importante pra quem quer automatizar, e o mais cansativo pra quem responde. Por isso:

- **Priorize.** Faça o bloco completo nos passos onde a informação troca de mãos (de uma pessoa ou ferramenta pra outra), nas decisões, nos passos com dor e nos que parecem bons pra automatizar. Nos outros, deduza do que já foi dito e confirme numa tabela.
- **Peça um exemplo real.** "Tem como me mandar um print de uma mensagem dessas que chegou ontem?" Um exemplo real mostra os campos melhor que qualquer descrição, e mostra o que vem faltando na prática.
- **Use o teste da pessoa nova.** "Se alguém começasse amanhã nessa função, o que essa pessoa precisaria ter na mão pra fazer esse passo? E o que ela ia perguntar?" A resposta é o mínimo de entrada.

Perguntas, por passo:

**O que chega** (`entradas`)
- O que a pessoa precisa ter na mão pra começar? (`item`)
- Isso vem de onde? De um passo anterior, do cliente, de um fornecedor, de outro sistema? (`de`, só se não vier de um passo do mapa)
- Chega como? Texto solto no WhatsApp, formulário, planilha com colunas, PDF, foto, áudio? (`formato`)
- Dessas informações, qual é a que, se faltar, ela não consegue nem começar? (`minimo`)
- E quando chega faltando, o que ela faz? Pergunta pra quem? Devolve? Começa assim mesmo? (`se_faltar`)

**O que sai** (`saidas`)
- O que ela entrega quando termina? Pra quem, ou onde fica guardado? (`item`, `para` quando o destino está fora do mapa)
- Em que formato? Que informações vão junto? (`formato`, `campos`)

**Quando está pronto** (`pronto_quando`)
- Como ela sabe que terminou? Quem confere?
- Já aconteceu de alguém achar que estava pronto e não estava? O que faltou?

**Quando dá errado** (`excecoes`)
- Qual o problema mais comum nesse passo? O que a pessoa faz quando acontece?

Se a mesma informação é digitada em dois lugares, pergunte: "isso que ela digita aqui já estava em algum outro lugar?". Redigitação é dor e quase sempre candidato a automação.

Use o mesmo nome pra mesma coisa em todos os passos. É assim que o `checar.mjs` encontra entrada sem origem e saída que ninguém usa.

## 5. Regras

Uma regra é qualquer critério que decide, valida, calcula, limita ou dá prazo. Toda decisão do bloco 3 precisa de uma. (`regras`)

- **Decisão:** "Com base em quê ele escolhe esse caminho?" Se a resposta for "depende", pergunte "depende de quê? Me dá um exemplo de uma vez que foi pra cada lado."
- **Limite:** "Tem algum número? Valor, prazo, quantidade, porcentagem?"
- **Cálculo:** "Como se chega nesse valor? Me mostra a conta de um caso de verdade."
- **Permissão:** "Quem pode aprovar ou mudar isso? Alguém mais pode, quando essa pessoa não está?"
- **Prazo:** "Até quando isso precisa acontecer? E se passar?"
- **Validação:** "O que precisa estar certo pra seguir? O que faz voltar?"
- **Exceção:** "Tem cliente, produto ou situação que fura essa regra?"

Depois de cada regra, pergunte: **"isso está escrito em algum lugar, ou é de cabeça?"** (`fonte`, `status`)

| `status` | Quando |
|---|---|
| `confirmada` | Está escrita (contrato, manual, sistema) ou quem decide confirmou na conversa |
| `de-cabeca` | Existe e é seguida, mas só está na cabeça de alguém |
| `lacuna` | Ninguém soube dizer, ou duas pessoas disseram coisas diferentes |

"O gerente aprova" não é regra, é responsável. "O gerente aprova se o desconto passar de 10%" é regra. Se ninguém souber o critério, registre com `status: "lacuna"` e a pergunta em `lacunas`.

Quando duas pessoas dão respostas diferentes pra mesma regra, registre as duas no `exemplo` e marque `lacuna`. Essa divergência costuma ser o achado mais valioso do mapeamento.

## 6. Onde a informação mora

Pras informações que passam por vários passos (pedido, cliente, orçamento, obra):

- Depois que essa informação existe, ela fica guardada onde? (`dados[].onde_fica`)
- Quem pode mudar? Quem é o dono dela? (`dono`)
- Tem um número ou código que identifica cada uma? Número do pedido, código da obra? (`chave`)
- Quais campos ela sempre tem? Quais às vezes ficam em branco? (`campos`, `obrigatorio`)

Se não existe código e a informação é identificada pelo nome do cliente ou pela data, anote em `chave`. Sem identificador, um agente não consegue ligar a mesma informação em dois sistemas.

Pras ferramentas:

- Esse sistema exporta planilha? Tem integração com outro? Alguém sabe se tem API? (`ferramentas[].acesso`)
- Quem administra? Fica na nuvem ou num computador específico? (`obs`)

"Não sei" é resposta válida e vira `acesso: "nao-sei"`. Não chute.

## 7. Dores

- Qual parte desse processo mais te incomoda?
- Onde mais acontece erro ou retrabalho?
- Tem alguma coisa que você já tentou mudar e não deu certo? Por quê?
- Se você pudesse tirar um passo amanhã, qual seria?
- Se a pessoa X sai de férias, o que trava?

Marque os passos citados com `"marcadores": ["dor"]` e registre o motivo em `nota`.

## 8. Números

Só pergunte o que ainda não apareceu.

- Volume: quantos por semana/mês?
- Tempo total, do gatilho ao resultado, num caso normal e num caso ruim.
- Quantas pessoas encostam no processo?
- Quanto custa um erro? Pedido perdido, multa, retrabalho.

Se não souber, registre como lacuna. Não estime pela pessoa.

## Fechando

- Tem alguém que conhece uma parte disso melhor que você e que valeria ouvir?
- Tem algum documento, planilha ou print que mostre isso funcionando?

## Sinais de que falta coisa

O `checar.mjs` encontra a maioria destes sozinho. Mesmo assim, fique atento durante a conversa:

- Um passo que recebe algo que nenhum passo anterior entrega.
- Um passo que entrega algo que ninguém usa depois.
- Uma decisão sem critério.
- A mesma coisa chamada por dois nomes ("proposta" e "orçamento em PDF").
- Uma ferramenta que aparece uma vez só (pode ser um passo escondido antes ou depois).
- Uma pessoa que só aparece no fim.
- Um "mínimo pra começar" que nenhum passo anterior entrega completo. Exemplo: o passo 6 precisa do CPF, mas o passo 2 só registra nome e telefone. Alguém está buscando essa informação por fora.

Quando encontrar um desses, pergunte antes de desenhar.
