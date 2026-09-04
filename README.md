# DRY, AHA, KISS, YAGNI

> **Stack:** React 19 + Vite + TypeScript strict
> **Conceito:** quando abstrair, quando não abstrair, e por que abstrair cedo é
> mais caro do que duplicar

---

## O problema que este projeto ataca

DRY é o princípio mais citado e o mais mal aplicado da engenharia de software.
A leitura ingênua — "código repetido é sempre errado" — produz mais dano em base
de código React do que a duplicação que ela tenta evitar.

O enunciado original (Hunt & Thomas, *The Pragmatic Programmer*) fala de
**conhecimento**, não de texto:

> Every piece of **knowledge** must have a single, unambiguous, authoritative
> representation within a system.

Dois trechos idênticos que mudam **por razões diferentes** não violam DRY. Eles
apenas se parecem — e uni-los cria um acoplamento entre coisas que o negócio
trata como independentes.

Este projeto mostra a mesma feature em três versões, e a lição está na
**cronologia**: como uma abstração criada cedo apodrece requisito a requisito.

---

## Rodando

```bash
npm install
npm run dev
```

---

## As três versões

| Versão | O que é | Custo de "adicionar cupom só no cadastro" |
|---|---|---|
| `v1-duplicado/` | Três formulários independentes | Edita um arquivo simples |
| `v2-abstracao-precoce/` | Um `SuperForm` dirigido por config | Edita a config **e** o SuperForm; risco nos três |
| `v3-abstracao-madura/` | Extraído só o conhecimento compartilhado | Edita um arquivo simples |

Leia nesta ordem, e leia os comentários — eles são o conteúdo:

1. **`v1-duplicado/forms.tsx`** — a pergunta "isto está errado?" e por que a
   resposta honesta é "ainda não".
2. **`v2-abstracao-precoce/SuperForm.tsx`** — a cronologia sprint a sprint da
   degradação. Esta é a parte mais importante do projeto inteiro.
3. **`v3-abstracao-madura/`** — o que foi extraído (mecânica de submit,
   estrutura acessível do campo) e, principalmente, **o que não foi**.

E dois exemplos menores, mas que aparecem em toda revisão de código:

- **`kiss/formatDuration.ts`** — conciso ≠ simples.
- **`yagni/notifications.ts`** — o requisito era um toast; virou um barramento
  com middlewares, retry e cinco canais.

---

## O teste de decisão (o que levar para o code review)

Antes de extrair qualquer abstração, responda:

1. **Os trechos mudam pelo mesmo motivo?**
   Se um muda por regra de segurança e outro por regra de marketing, são
   conhecimentos diferentes. Não una.

2. **Já são três?**
   Regra de três. Com dois exemplos você não consegue distinguir o que varia por
   acidente do que varia por natureza. Com três, o eixo de variação aparece.

3. **A abstração tem nome no domínio?**
   `useFormSubmit` e `Field` nomeiam conceitos reais. `SuperForm`, `GenericTable`
   e `BaseHandler` nomeiam a ausência de um conceito — e o prefixo `Generic`,
   `Base` ou `Super` é um sinal confiável de que ninguém sabia o que estava
   modelando.

4. **Qual é o custo de estar errado?**
   Duplicação errada: você corrige em N lugares, e o compilador nem sempre ajuda.
   Abstração errada: você precisa desfazê-la em N consumidores, com todos eles em
   produção. O segundo é muito mais caro — e é por isso que, na dúvida, **duplique**.

---

## Sinais de que a abstração apodreceu

Se você ver dois destes num PR, o assunto merece discussão:

- prop de escape: `renderCustom`, `overrideX`, `extraProps`, `slots`
- união de strings que despacha comportamento dentro do componente
- lógica condicional dentro de um objeto de configuração (`showIf`)
- a configuração precisa de comentário para ser entendida
- mudar a abstração exige rodar os testes de todos os consumidores
- ninguém consegue dizer o que o componente faz em uma frase

---

## Decisões documentadas

- [ADR-001 — Extrair a mecânica de submit, não a estrutura do formulário](./docs/ADR-001-extrair-mecanica-nao-estrutura.md)
- [ADR-002 — Adotar a regra de três como gatilho de extração](./docs/ADR-002-regra-de-tres.md)

---

## Exercícios

1. **Sinta a degradação.** Implemente em todas as três versões: *"no cadastro,
   mostrar um campo de cupom quando o usuário marcar os termos"*. Cronometre.
   Depois anote quantos arquivos compartilhados com outras telas cada versão
   obrigou você a tocar.

2. **Force a abstração a quebrar.** Novo requisito: *"o login precisa de um passo
   de 2FA depois do envio, mantendo os campos preenchidos"*. Tente na v2 sem
   adicionar mais um escape hatch. Você não vai conseguir — e entender **por que**
   é o objetivo do exercício.

3. **Justifique a duplicação.** Escreva o comentário de PR que você deixaria ao
   receber a v1 de um colega, defendendo manter a duplicação. Depois escreva a
   resposta de quem discorda. Saber sustentar os dois lados é o que permite
   conduzir essa discussão num time real sem que ela vire preferência pessoal.

4. **Aplique a regra de três de verdade.** Adicione um quarto formulário
   (mudança de senha) na v3. Só agora, com quatro exemplos, decida se vale
   extrair mais alguma coisa — e escreva um ADR curto registrando a decisão,
   inclusive se ela for "não extrair nada".

5. **KISS na prática.** Escreva testes para `formatDurationRuim` cobrindo 0, 59,
   60, 3599 e 3600 segundos. Observe quantos você acerta de primeira só lendo o
   código, sem executar. Repita com `formatDuration`.

6. **YAGNI com honestidade.** Liste três coisas que você já construiu "porque um
   dia a gente vai precisar" e que nunca foram usadas. É o exercício mais
   desconfortável da lista e o que mais muda comportamento.

---

## A frase para levar

> **DRY é sobre conhecimento duplicado, não sobre linhas parecidas.**
> E na dúvida entre duplicar e abstrair cedo: duplique. Desfazer duplicação é
> refatoração local; desfazer a abstração errada é migração.


---

## Faz parte de uma série

16 projetos independentes, um por conceito, sobre o que separa um dev pleno de um
senior/tech lead em React e Next.js. Cada um tem README, ADRs documentando as
decisões, e exercícios.

| Projeto | Conceito |
|---|---|
| [react-solid-na-pratica](https://github.com/vmarins2005/react-solid-na-pratica) | Os 5 principios SOLID traduzidos para componentes React, com anti-exemplo e versao boa lado a lado |
| `react-quando-abstrair` **(você está aqui)** | A mesma feature em 3 versoes: duplicada, abstraida cedo demais, e abstraida na hora certa |
| [react-padroes-de-componentes](https://github.com/vmarins2005/react-padroes-de-componentes) | Compound, headless, slots, state reducer e estado controlavel: como absorver variacao sem explodir em props |
| [react-arquitetura-por-feature](https://github.com/vmarins2005/react-arquitetura-por-feature) | Organizacao por feature em Next.js, com fronteiras garantidas por ESLint em vez de disciplina |
| [react-regra-de-negocio-no-front](https://github.com/vmarins2005/react-regra-de-negocio-no-front) | Clean Architecture no front: dominio puro, portas e adaptadores, sem uma linha de React no nucleo |
| [react-onde-mora-o-estado](https://github.com/vmarins2005/react-onde-mora-o-estado) | Os 6 tipos de estado em React e a ferramenta certa para cada um |
| [react-estados-impossiveis](https://github.com/vmarins2005/react-estados-impossiveis) | Da sopa de booleanos ao XState: tornar estados invalidos inexprimiveis |
| [react-typescript-na-fronteira](https://github.com/vmarins2005/react-typescript-na-fronteira) | Tipo nao existe em runtime: validacao com Zod, branded types e verificacao de exaustividade |
| [react-testes-que-valem-a-pena](https://github.com/vmarins2005/react-testes-que-valem-a-pena) | Testing Trophy com Vitest, Testing Library, MSW, Playwright e axe |
| [react-performance-no-next](https://github.com/vmarins2005/react-performance-no-next) | Waterfalls de requisicao, streaming com Suspense e o que RSC realmente economiza de bundle |
| [react-entendendo-o-cache-do-next](https://github.com/vmarins2005/react-entendendo-o-cache-do-next) | As 4 camadas de cache do App Router e como diagnosticar dado velho na tela |
| [react-acessibilidade-na-pratica](https://github.com/vmarins2005/react-acessibilidade-na-pratica) | WCAG 2.2 AA em React: foco, teclado, live regions e os requisitos invisiveis em code review |
| [react-seguranca-no-next](https://github.com/vmarins2005/react-seguranca-no-next) | Server Action e endpoint publico: autorizacao, validacao, rate limit e CSP com nonce |
| [react-quando-quebra-em-producao](https://github.com/vmarins2005/react-quando-quebra-em-producao) | Taxonomia de erros, error boundaries, log estruturado e feature flags com kill switch |
| [react-design-system-em-monorepo](https://github.com/vmarins2005/react-design-system-em-monorepo) | Design system como pacote versionado: Turborepo, design tokens e changesets |
| [react-commits-que-contam-historia](https://github.com/vmarins2005/react-commits-que-contam-historia) | Commit atomico e Conventional Commits, com historico curado e um bug para achar via git bisect |

---

## Licença

[MIT](./LICENSE) — use, copie e adapte à vontade, inclusive em projeto comercial.
Se este material ajudou, uma estrela no repositório é o suficiente.
