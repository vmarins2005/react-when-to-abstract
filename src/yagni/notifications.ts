/**
 * YAGNI — "You Aren't Gonna Need It".
 *
 * O requisito real, na íntegra: *"mostrar um toast de sucesso quando o usuário
 * salvar o perfil"*.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * ANTI-EXEMPLO — o que o requisito acima virou.
 *
 * Nenhuma linha daqui é ruim isoladamente. O problema é que TODA ela existe para
 * atender requisitos que ninguém pediu: múltiplos canais, prioridade, retry,
 * middlewares, registro dinâmico de provedores.
 *
 * O custo de código especulativo raramente é escrevê-lo. É:
 *   - cada pessoa que entra no time precisa entender esta arquitetura
 *   - ela aparece no autocomplete e as pessoas a usam de formas imprevistas
 *   - ela precisa de teste, e o teste dela também é especulativo
 *   - quando o requisito real de push chegar, ele NÃO vai caber neste desenho —
 *     porque foi imaginado, não observado — e aí você mantém os dois
 *   - remover fica politicamente difícil ("mas alguém pode estar usando")
 *
 * O detalhe cruel: em 90% dos casos os canais extras nunca chegam. Em 100% dos
 * casos a complexidade já chegou.
 * ──────────────────────────────────────────────────────────────────────────── */

type Channel = 'toast' | 'email' | 'push' | 'sms' | 'webhook'
type Priority = 'low' | 'normal' | 'high' | 'critical'

interface NotificationProvider {
  readonly channel: Channel
  send(message: string, priority: Priority): Promise<void>
  supports(priority: Priority): boolean
}

type Middleware = (message: string, next: (m: string) => Promise<void>) => Promise<void>

export class NotificationBusRuim {
  private providers = new Map<Channel, NotificationProvider>()
  private middlewares: Middleware[] = []
  private retries = 3

  register(provider: NotificationProvider): this {
    this.providers.set(provider.channel, provider)
    return this
  }

  use(middleware: Middleware): this {
    this.middlewares.push(middleware)
    return this
  }

  setRetries(n: number): this {
    this.retries = n
    return this
  }

  async dispatch(message: string, channels: Channel[], priority: Priority = 'normal') {
    const run = async (m: string) => {
      for (const channel of channels) {
        const provider = this.providers.get(channel)
        if (!provider?.supports(priority)) continue
        for (let attempt = 0; attempt < this.retries; attempt++) {
          try {
            await provider.send(m, priority)
            break
          } catch {
            if (attempt === this.retries - 1) throw new Error(`Falha em ${channel}`)
          }
        }
      }
    }
    const chain = this.middlewares.reduceRight<(m: string) => Promise<void>>(
      (next, middleware) => (m) => middleware(m, next),
      run,
    )
    await chain(message)
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * VERSÃO BOA — o requisito, e nada além dele.
 * ──────────────────────────────────────────────────────────────────────────── */

export type Toast = { id: string; message: string; kind: 'success' | 'error' }

const listeners = new Set<(toasts: readonly Toast[]) => void>()
let toasts: readonly Toast[] = []

export function showToast(message: string, kind: Toast['kind'] = 'success') {
  const toast: Toast = { id: crypto.randomUUID(), message, kind }
  toasts = [...toasts, toast]
  listeners.forEach((listener) => listener(toasts))
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id)
    listeners.forEach((listener) => listener(toasts))
  }, 4000)
}

export function subscribeToToasts(listener: (toasts: readonly Toast[]) => void): () => void {
  listeners.add(listener)
  // Retorno explícito de `void`. `() => listeners.delete(l)` devolveria boolean,
  // e o cleanup de useEffect exige `void | Destructor` — erro de tipo que só
  // aparece com `strict` ligado, e que em JS puro passaria batido.
  return () => {
    listeners.delete(listener)
  }
}

/**
 * "E se amanhã precisarmos de push?"
 *
 * A resposta de senior não é "então já vou preparar". É:
 *
 *   "Quando precisarmos, teremos o requisito real na mão — quais eventos, qual
 *    permissão, qual fallback, o que acontece com o usuário offline. Aí eu
 *    escrevo a abstração certa em meia hora, sabendo de fato o que ela precisa
 *    fazer. Se eu escrever agora, escrevo a abstração errada e carrego ela até lá."
 *
 * YAGNI não é preguiça nem falta de visão. É reconhecer que **decisão adiada é
 * decisão tomada com mais informação** — e que a informação chega com o requisito,
 * não com a especulação.
 *
 * O contraponto honesto: YAGNI se aplica a *funcionalidade especulativa*, não a
 * fundamento. Testes, tipos, tratamento de erro, acessibilidade e log não são
 * "coisas que talvez precisemos" — são custo de fazer certo desde o começo, e
 * adiar esses sai mais caro, não mais barato.
 */
