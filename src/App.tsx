import { useEffect, useState, type ReactNode } from 'react'
import { formatDuration, formatDurationRuim } from './kiss/formatDuration'
import { LoginFormV1, ResetFormV1, SignupFormV1 } from './v1-duplicado/forms'
import { LoginFormV2, ResetFormV2, SignupFormV2 } from './v2-abstracao-precoce/forms'
import { LoginFormV3, ResetFormV3, SignupFormV3 } from './v3-abstracao-madura/forms'
import { showToast, subscribeToToasts, type Toast } from './yagni/notifications'

function Version(props: { tag: string; tone: 'bad' | 'good' | ''; title: string; lead: string; children: ReactNode }) {
  return (
    <section>
      <h2>
        {props.title} <span className={`tag ${props.tone}`}>{props.tag}</span>
      </h2>
      <p>{props.lead}</p>
      <div className="grid cols-2">{props.children}</div>
    </section>
  )
}

function ToastList() {
  const [items, setItems] = useState<readonly Toast[]>([])
  useEffect(() => subscribeToToasts(setItems), [])
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, display: 'grid', gap: 8 }}>
      {items.map((toast) => (
        <div key={toast.id} className="panel" role="status">
          {toast.message}
        </div>
      ))}
    </div>
  )
}

const SAMPLE_SECONDS = [0, 45, 605, 3725]

export function App() {
  return (
    <main>
      <h1>DRY, AHA, KISS, YAGNI</h1>
      <p>
        Os mesmos três formulários de autenticação, escritos de três formas. Eles funcionam
        de maneira idêntica — a diferença está no custo da próxima mudança. Leia os
        comentários de cada arquivo em <code>src/</code> na ordem v1 → v2 → v3.
      </p>

      <Version
        tag="ponto de partida"
        tone=""
        title="v1 — duplicado"
        lead="Três formulários independentes. Nem sempre isto está errado: se eles mudam por razões diferentes, a duplicação é o custo mais barato disponível."
      >
        <LoginFormV1 />
        <SignupFormV1 />
        <ResetFormV1 />
      </Version>

      <Version
        tag="anti-exemplo"
        tone="bad"
        title="v2 — abstração precoce"
        lead="Um SuperForm dirigido por configuração, criado sobre semelhança acidental. Cada requisito novo virou uma prop de escape. Leia o topo de SuperForm.tsx: a cronologia sprint a sprint é o que interessa."
      >
        <LoginFormV2 />
        <SignupFormV2 />
        <ResetFormV2 />
      </Version>

      <Version
        tag="alvo"
        tone="good"
        title="v3 — abstração madura"
        lead="Extraído apenas o conhecimento realmente compartilhado: a mecânica de submit e a estrutura acessível de um campo. O JSX continua duplicado, de propósito."
      >
        <LoginFormV3 />
        <SignupFormV3 />
        <ResetFormV3 />
      </Version>

      <section>
        <h2>KISS — conciso não é simples</h2>
        <p>
          As duas implementações produzem a mesma saída. Abra{' '}
          <code>src/kiss/formatDuration.ts</code> e cronometre quanto tempo você leva para
          confiar em cada uma.
        </p>
        <table className="panel" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">segundos</th>
              <th align="left">versão &quot;esperta&quot;</th>
              <th align="left">versão legível</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_SECONDS.map((seconds) => (
              <tr key={seconds}>
                <td>{seconds}</td>
                <td>
                  <code>{formatDurationRuim(seconds)}</code>
                </td>
                <td>
                  <code>{formatDuration(seconds)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>YAGNI — o requisito era um toast</h2>
        <p>
          Em <code>src/yagni/notifications.ts</code> estão as duas respostas ao mesmo
          pedido: um barramento de notificações com middlewares, retry e cinco canais — e
          a função de 12 linhas que atende o requisito de verdade.
        </p>
        <div className="panel row">
          <button onClick={() => showToast('Perfil salvo com sucesso')}>Salvar perfil</button>
          <span className="muted">é isso que o requisito pedia</span>
        </div>
      </section>

      <ToastList />
    </main>
  )
}
