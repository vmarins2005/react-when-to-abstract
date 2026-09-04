import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'

/**
 * VERSÃO 3 — extração nº 2: a ESTRUTURA de um campo.
 *
 * O que é compartilhado de verdade aqui não é a aparência: é a **regra de
 * acessibilidade**. Todo campo precisa de um `id` único, de um `<label>`
 * associado a ele, e de uma mensagem de erro ligada por `aria-describedby` com
 * `aria-invalid`. Se essa regra estiver errada, está errada nos três — logo, é
 * conhecimento único e merece um lugar único.
 *
 * Repare na diferença fundamental para o `SuperForm` da v2:
 *
 *   SuperForm  -> recebe uma DESCRIÇÃO dos campos e decide o que renderizar.
 *                 Quem manda é a configuração; extensão exige nova prop.
 *   Field      -> recebe as props nativas de um input e as repassa.
 *                 Quem manda é quem chama; extensão não exige nada.
 *
 * A segunda é aberta para extensão sem modificação (OCP) porque `...rest`
 * repassa qualquer atributo válido de input — inclusive os que ainda não
 * existiam quando escrevemos isto.
 */
export function Field({
  label,
  error,
  hint,
  ...rest
}: {
  label: string
  error?: string | undefined
  hint?: ReactNode
} & ComponentPropsWithoutRef<'input'>) {
  // useId gera um id estável e único por instância, e é seguro em SSR
  // (sem colisão de hidratação, ao contrário de Math.random ou de um contador).
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div style={{ display: 'grid', gap: '0.2rem', marginBottom: '0.75rem' }}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {hint ? (
        <small id={hintId} className="muted">
          {hint}
        </small>
      ) : null}
      {error ? (
        <small id={errorId} style={{ color: 'var(--bad)' }}>
          {error}
        </small>
      ) : null}
    </div>
  )
}
