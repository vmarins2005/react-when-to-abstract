# ADR-002 — Adotar a regra de três como gatilho de extração no time

- **Status:** Aceito
- **Data:** 2026-09-04

## Contexto

Discussões sobre "isso deveria estar abstraído?" consomem tempo de code review
recorrentemente e terminam em preferência pessoal, porque não há critério
compartilhado. O resultado prático é inconsistência: quem revisa determina o
padrão, e o padrão muda conforme quem revisa.

Precisamos de um critério objetivo o bastante para encerrar a discussão sem
transformá-la em opinião — e simples o bastante para caber num comentário de PR.

## Decisão

Adotar a **regra de três** como gatilho padrão de extração, com uma exceção
explícita.

**Regra:** duplique até a terceira ocorrência. Só extraia na terceira.

**Exceção — extrair já na primeira ou segunda quando o trecho for uma regra de
corretude, não de forma.** Isto é, quando estar errado significa estar errado em
todos os lugares ao mesmo tempo: acessibilidade, cálculo monetário,
autorização, formatação de data com fuso, tratamento de erro de rede.

O critério para decidir qual dos dois caminhos vale: *"se este trecho estiver
errado, é o mesmo bug em N lugares, ou são N bugs diferentes?"* Se for o mesmo
bug, extraia agora.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Extrair na segunda ocorrência | Menos duplicação transitória | Com dois exemplos é impossível distinguir variação essencial de acidental; produz abstração com parâmetro demais | É exatamente como o `SuperForm` da v2 nasceu |
| Nunca extrair sem aprovação de tech lead | Consistência | Cria gargalo; não escala; ensina ninguém | Critério deve viver no time, não numa pessoa |
| Regra de três pura, sem exceção | Simples de lembrar | Deixaria regra de acessibilidade duplicada por tempo demais, com risco real de divergir | Exceção é pequena, nomeável e verificável |
| Regra de três + exceção de corretude | Objetiva; encerra a discussão; cobre o caso perigoso | Exige julgamento na fronteira | **Escolhida** |

## Consequências

**Positivas**
- A discussão em PR passa a ser factual: "quantas ocorrências existem hoje?".
  Duas, não extrai. Três, extrai. Sem debate de gosto.
- Reduz drasticamente abstração especulativa, que é a mais cara de remover.
- A exceção dá cobertura ao caso genuinamente perigoso sem abrir a porta para
  extrair tudo.

**Negativas**
- Existe uma janela em que a duplicação está visível no código e alguém vai
  querer "arrumar". Isso precisa estar documentado (este ADR) e ser dito em
  onboarding, ou a regra é revertida por instinto.
- Contar ocorrências exige busca no repositório; nem sempre é óbvio que a terceira
  chegou, especialmente em base grande.

**Monitorar**
- Se aparecerem três casos de duplicação que causaram bug real por divergência,
  o limiar deve ser reavaliado — a exceção de corretude talvez esteja estreita
  demais.

## Nota transferível

A assimetria que justifica a regra: **desfazer duplicação é refatoração local;
desfazer a abstração errada é migração**. Na dúvida, escolha o erro barato.
