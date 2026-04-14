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

export function formatarCpf(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)

  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function formatarMoedaInput(valor: string) {
  const numeros = valor.replace(/\D/g, '')

  if (!numeros) return ''

  const numero = Number(numeros) / 100

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function moedaInputParaNumero(valor: string) {
  const limpo = valor.replace(/\s/g, '').replace('R$', '').trim()
  const normalizado = limpo.replace(/\./g, '').replace(',', '.')
  const numero = Number(normalizado)

  return Number.isNaN(numero) ? 0 : numero
}