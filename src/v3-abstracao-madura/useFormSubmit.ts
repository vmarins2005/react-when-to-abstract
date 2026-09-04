import { useState } from 'react'

/**
 * VERSÃO 3 — extração nº 1: a MECÂNICA de submit assíncrono.
 *
 * Isto é conhecimento genuinamente compartilhado. Os três formulários precisam,
 * pelo mesmo motivo e da mesma forma:
 *
 *   - impedir envio duplo enquanto a requisição está em voo
 *   - limpar o erro anterior antes de tentar de novo
 *   - traduzir exceção desconhecida em mensagem exibível
 *   - garantir que o estado de "enviando" volte ao normal mesmo em erro
 *
 * Se a regra de "não deixar enviar duas vezes" mudar, ela muda **para os três ao
 * mesmo tempo** — e é exatamente esse o teste de DRY. Compare com a estrutura do
 * JSX, que muda para um formulário sem mudar para os outros, e por isso NÃO foi
 * extraída.
 *
 * Note também o que este hook não faz: não sabe quais campos existem, não sabe
 * renderizar, não sabe validar. Ele tem uma responsabilidade e cabe na cabeça.
 */
export function useFormSubmit<T extends unknown[]>(action: (...args: T) => Promise<void>) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)

  async function submit(...args: T) {
    if (submitting) return // guarda contra duplo envio
    setSubmitting(true)
    setError(null)
    try {
      await action(...args)
      setSucceeded(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return { submit, submitting, error, succeeded }
}
