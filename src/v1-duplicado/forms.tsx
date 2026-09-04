import { useState, type FormEvent } from 'react'
import { authApi } from '@/api/auth'

/**
 * VERSÃO 1 — três formulários duplicados.
 *
 * Em projeto real estes seriam três arquivos; aqui estão juntos para que a
 * duplicação fique visível de uma olhada só.
 *
 * A pergunta que este arquivo faz: **isto está errado?**
 *
 * A resposta honesta é "ainda não". Se o produto tem três formulários de auth e
 * eles não mudam há meses, esta versão é a mais barata de todas: qualquer pessoa
 * do time entende um arquivo destes em 30 segundos, muda um sem risco nenhum de
 * quebrar os outros, e o teste de cada um é trivial.
 *
 * O erro que a maioria comete aqui é achar que "código parecido" é o mesmo que
 * "conhecimento duplicado". DRY fala do segundo. Estes três formulários se
 * PARECEM, mas mudam por razões diferentes: o de login muda quando o time de
 * segurança pedir 2FA, o de cadastro quando o marketing pedir campo de cupom, o
 * de recuperação quando trocarmos o provedor de email. Razões diferentes de
 * mudança = conhecimentos diferentes = não é violação de DRY.
 *
 * O que É duplicação de conhecimento aqui, e vale extrair: a mecânica de submit
 * assíncrono (evitar duplo envio, capturar erro, exibir estado) e a estrutura
 * label + input + mensagem de erro. Isso é o que a v3 extrai — e só isso.
 */

export function LoginFormV1() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await authApi.login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel">
      <h3>Entrar</h3>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      <label>
        Senha
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar'}</button>
    </form>
  )
}

export function SignupFormV1() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await authApi.signup(name, email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel">
      <h3>Criar conta</h3>
      <label>
        Nome
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      <label>
        Senha
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          minLength={8}
        />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={submitting}>{submitting ? 'Criando...' : 'Criar conta'}</button>
    </form>
  )
}

export function ResetFormV1() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await authApi.resetPassword(email)
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) return <p className="panel">Enviamos um link para {email}.</p>

  return (
    <form onSubmit={handleSubmit} className="panel">
      <h3>Recuperar senha</h3>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar link'}</button>
    </form>
  )
}
