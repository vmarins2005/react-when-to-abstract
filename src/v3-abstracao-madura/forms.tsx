import { useState, type FormEvent } from 'react'
import { authApi } from '@/api/auth'
import { Field } from './Field'
import { useFormSubmit } from './useFormSubmit'

/**
 * VERSÃO 3 — os três formulários depois da extração madura.
 *
 * O que foi extraído: a mecânica de submit e a estrutura acessível de um campo.
 * O que **permaneceu duplicado, de propósito**: o JSX de cada formulário.
 *
 * Essa segunda parte é a decisão difícil, e é o que separa senior de pleno.
 * O JSX se parece entre os três, mas cada um muda por um motivo próprio — o de
 * login vai ganhar 2FA, o de cadastro vai ganhar cupom, o de reset vai ganhar
 * uma tela de sucesso. Deixá-los separados significa que cada mudança dessas é
 * local, revisável e reversível, sem colocar os outros dois em risco.
 *
 * Compare o custo de "adicionar um campo de cupom só no cadastro":
 *   v1 -> edita um arquivo simples
 *   v2 -> edita a config E provavelmente o SuperForm (showIf nasceu assim)
 *   v3 -> edita um arquivo simples
 *
 * A v3 não é "v1 com menos duplicação". É v1 com a duplicação CERTA removida —
 * e a duplicação certa é a que representa o mesmo conhecimento, não a que
 * representa a mesma aparência.
 */

export function LoginFormV3() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { submit, submitting, error } = useFormSubmit(authApi.login)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void submit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="panel">
      <h3>Entrar</h3>
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Field
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        hint={<a href="#reset">Esqueci minha senha</a>}
      />
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar'}</button>
    </form>
  )
}

export function SignupFormV3() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { submit, submitting, error } = useFormSubmit(authApi.signup)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void submit(name, email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="panel">
      <h3>Criar conta</h3>
      <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Field
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        hint="Mínimo de 8 caracteres"
      />
      {/* O checkbox de termos vive aqui, como JSX normal. Não precisou de
          `labelNode`, nem de um tipo novo na configuração de ninguém. */}
      <label className="row" style={{ marginBottom: '0.75rem' }}>
        <input type="checkbox" required />
        <span>
          Aceito os <a href="#termos">termos de uso</a>
        </span>
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={submitting}>{submitting ? 'Criando...' : 'Criar conta'}</button>
    </form>
  )
}

export function ResetFormV3() {
  const [email, setEmail] = useState('')
  const { submit, submitting, error, succeeded } = useFormSubmit(authApi.resetPassword)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void submit(email)
  }

  // A tela de sucesso é um `if` neste arquivo. Na v2 precisou virar a prop
  // `successView` do componente compartilhado — ou seja, uma necessidade de UM
  // formulário virou complexidade permanente dos TRÊS.
  if (succeeded) return <p className="panel">Enviamos um link para {email}.</p>

  return (
    <form onSubmit={handleSubmit} className="panel">
      <h3>Recuperar senha</h3>
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar link'}</button>
    </form>
  )
}
