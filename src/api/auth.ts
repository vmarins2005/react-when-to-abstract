/** API falsa. Resolve em ~500ms e falha se o email contiver "erro". */
async function call(payload: Record<string, unknown>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const email = String(payload['email'] ?? '')
  if (email.includes('erro')) throw new Error('Credenciais inválidas')
}

export const authApi = {
  login: (email: string, password: string) => call({ email, password }),
  signup: (name: string, email: string, password: string) => call({ name, email, password }),
  resetPassword: (email: string) => call({ email }),
}
