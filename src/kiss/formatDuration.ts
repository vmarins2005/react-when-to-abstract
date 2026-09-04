/**
 * KISS — "keep it simple", que **não** significa "escreva pouco".
 * Significa: escolha a solução que a próxima pessoa entende sem esforço.
 *
 * O engano comum é confundir *conciso* com *simples*. As duas funções abaixo
 * fazem a mesma coisa. A primeira tem menos linhas e é muito mais complexa.
 */

/**
 * ANTI-EXEMPLO — inteligente, curto, e ilegível.
 *
 * Quantos segundos você levou para responder "isso trata 0 corretamente?".
 * Se levou mais de dois, o código já custou mais do que economizou. E ele vai
 * ser lido dezenas de vezes ao longo da vida do projeto, contra a única vez
 * que foi escrito.
 *
 * Custos concretos, não estéticos:
 *   - impossível colocar um breakpoint no meio
 *   - o stack trace de um erro aponta para uma linha só
 *   - mudar a regra exige reconstruir o raciocínio inteiro do zero
 *   - o code review vira "acho que está certo", que é o pior tipo de aprovação
 */
export const formatDurationRuim = (s: number): string =>
  [3600, 60, 1]
    .map((d, i, a) => Math.floor((s % (a[i - 1] ?? Infinity)) / d))
    .reduce<string[]>((acc, v, i) => (v || acc.length || i === 2 ? [...acc, String(v)] : acc), [])
    .map((v, i) => (i ? v.padStart(2, '0') : v))
    .join(':')

/**
 * VERSÃO BOA — mais linhas, complexidade ciclomática menor, intenção explícita.
 *
 * Cada passo tem nome. Dá para depurar, dá para testar por partes, e dá para
 * ler a regra de negócio ("some a hora só se houver hora") direto no código.
 *
 * O argumento de code review que você deve saber dar: "a versão curta economiza
 * 6 linhas uma vez e custa 30 segundos de leitura para cada pessoa, em cada
 * leitura, para sempre. A conta não fecha."
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) throw new RangeError('Duração não pode ser negativa')

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const pad = (value: number) => String(value).padStart(2, '0')

  // Horas só aparecem quando existem — é a regra de produto, e ela está visível.
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

/**
 * A ressalva honesta: KISS não é desculpa para ignorar a ferramenta certa.
 * Se o requisito fosse formatar duração com localização e plural
 * ("2 horas e 5 minutos", em 12 idiomas), a resposta simples seria usar
 * `Intl.DurationFormat` / `Intl.RelativeTimeFormat` — e não escrever a sua.
 * Simples é sobre adequação, não sobre evitar dependências.
 */
