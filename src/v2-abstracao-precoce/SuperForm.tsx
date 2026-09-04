import { useState, type FormEvent, type ReactNode } from 'react'

/**
 * VERSÃO 2 — a abstração precoce. **Este é o anti-exemplo do projeto.**
 *
 * A história é sempre a mesma, e você já viu acontecer:
 *
 *   Sprint 1. "Três formulários quase iguais? Isso é violação de DRY."
 *             Nasce o SuperForm, dirigido por configuração. Fica elegante.
 *   Sprint 3. "O de cadastro precisa de um checkbox com link nos termos."
 *             Não cabia no tipo `field`. Adiciona `type: 'checkbox'` e `labelNode`.
 *   Sprint 5. "O campo de cupom só aparece se o plano for pago."
 *             Adiciona `showIf`, e agora a config tem lógica condicional.
 *   Sprint 6. "No reset, depois do envio, mostrar uma tela de sucesso."
 *             Adiciona `successView`. O componente agora tem dois modos.
 *   Sprint 8. "O de login precisa de 'esqueci minha senha' entre os campos."
 *             Não existe posição para isso. Nasce `renderAfter[fieldName]`.
 *   Sprint 9. Alguém abre um PR mudando o SuperForm e quebra os três formulários
 *             de uma vez, porque agora eles compartilham TODOS os caminhos de código.
 *
 * O que aconteceu: a abstração foi criada sobre uma semelhança **acidental**
 * (os três parecem iguais) em vez de um conhecimento **compartilhado** (os três
 * mudam pelo mesmo motivo). Cada requisito novo empurra a abstração para longe,
 * e o resultado é um mini-framework interno mal documentado que só uma pessoa
 * do time entende.
 *
 * Os sintomas de diagnóstico, para você reconhecer em code review:
 *
 *   - o tipo de configuração tem união de strings que despacha comportamento
 *   - existem props de escape (`renderCustom`, `overrideX`, `extraProps`)
 *   - a config precisa de comentário para ser entendida
 *   - mexer nela exige rodar os testes de TODOS os consumidores
 *   - ninguém consegue mais responder "o que este componente faz?" em uma frase
 *
 * A conta que quase ninguém faz: a duplicação da v1 custava três arquivos
 * simples. Esta abstração custa um arquivo complexo — que é, na prática, mais
 * caro de manter do que os três juntos.
 */

type FieldConfig = {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'checkbox'
  required?: boolean
  minLength?: number
  labelNode?: ReactNode // escape hatch nº 1: o checkbox de termos
  showIf?: (values: Record<string, string>) => boolean // escape hatch nº 2: campo condicional
}

type SuperFormProps = {
  title: string
  fields: readonly FieldConfig[]
  submitLabel: string
  submittingLabel: string
  onSubmit: (values: Record<string, string>) => Promise<void>
  successView?: ReactNode // escape hatch nº 3: o reset precisa de outra tela
  renderAfter?: Record<string, ReactNode> // escape hatch nº 4: link no meio do form
}

export function SuperForm(props: SuperFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await props.onSubmit(values)
      if (props.successView) setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setSubmitting(false)
    }
  }

  if (done && props.successView) return <>{props.successView}</>

  return (
    <form onSubmit={handleSubmit} className="panel">
      <h3>{props.title}</h3>
      {props.fields.map((field) => {
        if (field.showIf && !field.showIf(values)) return null

        // O `if` por tipo é o cheiro central: o componente agora é um
        // interpretador de configuração, não um formulário.
        if (field.type === 'checkbox') {
          return (
            <label key={field.name} className="row">
              <input
                type="checkbox"
                checked={values[field.name] === 'on'}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.name]: e.target.checked ? 'on' : '' }))
                }
              />
              {field.labelNode ?? field.label}
            </label>
          )
        }

        return (
          <div key={field.name}>
            <label>
              {field.label}
              <input
                type={field.type}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                required={field.required ?? false}
                minLength={field.minLength ?? 0}
              />
            </label>
            {props.renderAfter?.[field.name]}
          </div>
        )
      })}
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={submitting}>{submitting ? props.submittingLabel : props.submitLabel}</button>
    </form>
  )
}
