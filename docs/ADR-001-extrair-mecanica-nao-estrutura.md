# ADR-001 — Extrair a mecânica de submit e a estrutura do campo; manter o JSX de cada formulário duplicado

- **Status:** Aceito
- **Data:** 2026-09-04

## Contexto

Temos três formulários de autenticação (login, cadastro, recuperação de senha)
com aparência semelhante. Uma proposta anterior (`SuperForm`, ver
`src/v2-abstracao-precoce/`) unificou os três numa configuração declarativa e, em
poucos sprints, acumulou quatro props de escape: `labelNode`, `showIf`,
`successView` e `renderAfter`.

O diagnóstico da falha: a unificação foi feita sobre **semelhança visual**, que é
acidental, e não sobre **razão de mudança**, que é o que importa. Os três
formulários mudam por motivos distintos e independentes:

| Formulário | Muda quando |
|---|---|
| Login | Segurança pede 2FA, captcha, bloqueio por tentativas |
| Cadastro | Marketing pede cupom, origem de campanha, aceite de termos |
| Recuperação | Trocamos provedor de email, muda o fluxo de token |

Nenhum desses eventos afeta os outros dois. Acoplá-los significa que toda
mudança de um passa a exigir regressão dos três.

## Decisão

Extrair **apenas duas coisas**, que são conhecimento genuinamente único:

1. `useFormSubmit` — a mecânica de submissão assíncrona: guarda contra duplo
   envio, limpeza de erro anterior, tradução de exceção em mensagem, e garantia
   de que o estado de "enviando" sempre volta ao normal.
2. `Field` — a estrutura acessível de um campo: `id` único via `useId`, `label`
   associado, `aria-describedby` e `aria-invalid` ligados à mensagem de erro.

O JSX de cada formulário **permanece duplicado**, por decisão explícita.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Manter tudo duplicado (v1) | Máxima independência; leitura trivial | Regra de acessibilidade e de duplo envio repetida três vezes — se estiver errada, está errada em três lugares | Isto **é** conhecimento único; deixar duplicado é a violação real de DRY |
| `SuperForm` dirigido por config (v2) | Menos linhas por formulário | Acopla três razões de mudança; escape hatches se multiplicam; total de complexidade sobe | Já observado degradando em produção |
| Formulários herdando de um `BaseForm` | Reuso | React não tem herança de componente; simularia com HOC e pioraria a rastreabilidade | Composição resolve melhor |
| Extrair mecânica + estrutura, manter JSX (v3) | Cada formulário evolui isolado; a regra compartilhada tem um dono | Mais linhas totais que a v2 | **Escolhido** |

## Consequências

**Positivas**
- Um requisito novo em um formulário é uma mudança local, revisável e reversível.
- A regra de acessibilidade tem um único lugar para estar certa. Corrigir `Field`
  corrige os três de uma vez — que é exatamente o benefício que DRY promete.
- `useFormSubmit` e `Field` são testáveis isoladamente e têm nome de conceito
  real, não de categoria (`Field`, não `GenericInputWrapper`).

**Negativas**
- Mais linhas no total que a v2. Quem mede produtividade por linha vai reclamar,
  e a resposta é que o custo relevante é o de mudança, não o de escrita.
- A estrutura do formulário continua repetida. Se um dia os três passarem a mudar
  **juntos** — por exemplo, se o design system impuser um layout único de
  formulário — esta decisão deve ser revisitada com um ADR novo.

**Monitorar**
- Gatilho de revisão: se três mudanças consecutivas exigirem editar os três
  formulários da mesma forma, a razão de mudança passou a ser compartilhada e a
  extração passa a se justificar.

## Nota transferível

A pergunta que resolve 90% dos debates de "isso é DRY?": **estes trechos mudam
pelo mesmo motivo?** Se sim, una. Se não, a semelhança é acidental e uni-los
cria acoplamento entre coisas que o negócio trata como independentes.
