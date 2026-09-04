import { authApi } from '@/api/auth'
import { SuperForm } from './SuperForm'

/**
 * Os três formulários da v2, expressos como configuração.
 *
 * Leia o `LoginFormV2` e depois releia o `LoginFormV1`. Pergunte-se, honestamente:
 * qual dos dois você entende mais rápido? Qual dos dois um dev que entrou ontem
 * consegue modificar com segurança?
 *
 * A v2 tem menos linhas por formulário — e é essa métrica enganosa que vende a
 * abstração precoce. O que ela esconde é que agora existe um SEGUNDO arquivo,
 * mais complexo, que você precisa ler para entender qualquer um dos três. O total
 * de complexidade subiu; ela só mudou de lugar.
 */

export function LoginFormV2() {
  return (
    <SuperForm
      title="Entrar"
      submitLabel="Entrar"
      submittingLabel="Entrando..."
      fields={[
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Senha', type: 'password', required: true },
      ]}
      renderAfter={{
        // Só existe porque o design pediu um link no meio do formulário e a
        // abstração não previa posição arbitrária.
        password: (
          <a href="#reset" className="muted">
            Esqueci minha senha
          </a>
        ),
      }}
      onSubmit={(v) => authApi.login(v['email'] ?? '', v['password'] ?? '')}
    />
  )
}

export function SignupFormV2() {
  return (
    <SuperForm
      title="Criar conta"
      submitLabel="Criar conta"
      submittingLabel="Criando..."
      fields={[
        { name: 'name', label: 'Nome', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Senha', type: 'password', required: true, minLength: 8 },
        {
          name: 'terms',
          label: 'Aceito os termos',
          type: 'checkbox',
          // labelNode existe porque texto puro não comportava um link.
          labelNode: (
            <span>
              Aceito os <a href="#termos">termos de uso</a>
            </span>
          ),
        },
        {
          name: 'coupon',
          label: 'Cupom',
          type: 'text',
          // Lógica de negócio dentro de um objeto de configuração: o ponto exato
          // em que a abstração deixou de ser declarativa e virou uma linguagem.
          showIf: (values) => values['terms'] === 'on',
        },
      ]}
      onSubmit={(v) => authApi.signup(v['name'] ?? '', v['email'] ?? '', v['password'] ?? '')}
    />
  )
}

export function ResetFormV2() {
  return (
    <SuperForm
      title="Recuperar senha"
      submitLabel="Enviar link"
      submittingLabel="Enviando..."
      fields={[{ name: 'email', label: 'Email', type: 'email', required: true }]}
      successView={<p className="panel">Enviamos um link para o seu email.</p>}
      onSubmit={(v) => authApi.resetPassword(v['email'] ?? '')}
    />
  )
}
