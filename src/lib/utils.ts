export function adicionarMeses(dataBase: string, quantidadeMeses: number) {
  const data = new Date(dataBase + 'T12:00:00')
  data.setMonth(data.getMonth() + quantidadeMeses)
  return data.toISOString().slice(0, 10)
}

export function diferencaDias(dataIso: string) {
  const hoje = new Date()
  const alvo = new Date(dataIso + 'T12:00:00')

  hoje.setHours(0, 0, 0, 0)
  alvo.setHours(0, 0, 0, 0)

  const diffMs = alvo.getTime() - hoje.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

export function formatarData(data: string | null) {
  if (!data) return 'Não informado'
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
}

export function formatarMoeda(valor: number | null) {
  if (valor == null) return 'Não informado'
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}