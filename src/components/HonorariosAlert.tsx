import { Parcela } from '@/types'
import { formatarData, formatarMoeda } from '@/lib/utils'

type Props = {
  parcelasVencidas: Parcela[]
  parcelasProximas: Parcela[]
  onMarcarComoPaga: (parcelaId: string) => void
}

function obterNomeCliente(parcela: Parcela) {
  const cliente = parcela.cliente as unknown

  if (!cliente) return 'Cliente'

  if (Array.isArray(cliente)) {
    const primeiro = cliente[0] as { nome_completo?: string } | undefined
    return primeiro?.nome_completo || 'Cliente'
  }

  const clienteObjeto = cliente as { nome_completo?: string }
  return clienteObjeto.nome_completo || 'Cliente'
}

export default function HonorariosAlert({
  parcelasVencidas,
  parcelasProximas,
  onMarcarComoPaga,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Honorários em alerta</h2>

      <div className="space-y-3 max-h-[250px] overflow-auto">
        {parcelasVencidas.length === 0 && parcelasProximas.length === 0 && (
          <p className="text-gray-500">Nenhuma parcela em alerta.</p>
        )}

        {parcelasVencidas.map((parcela) => (
          <div key={parcela.id} className="border border-red-300 bg-red-50 rounded-xl p-4">
            <p className="font-semibold text-red-900">{obterNomeCliente(parcela)}</p>
            <p className="text-sm text-red-800">
              Parcela {parcela.numero_parcela} vencida em {formatarData(parcela.data_vencimento)}
            </p>
            <p className="text-sm text-red-800">
              Valor: {formatarMoeda(parcela.valor_parcela)}
            </p>
            <button
              onClick={() => onMarcarComoPaga(parcela.id)}
              className="mt-3 bg-red-900 text-white px-3 py-2 rounded-lg text-sm"
            >
              Marcar como paga
            </button>
          </div>
        ))}

        {parcelasProximas.map((parcela) => (
          <div key={parcela.id} className="border border-yellow-300 bg-yellow-50 rounded-xl p-4">
            <p className="font-semibold text-yellow-900">{obterNomeCliente(parcela)}</p>
            <p className="text-sm text-yellow-800">
              Parcela {parcela.numero_parcela} vence em {formatarData(parcela.data_vencimento)}
            </p>
            <p className="text-sm text-yellow-800">
              Valor: {formatarMoeda(parcela.valor_parcela)}
            </p>
            <button
              onClick={() => onMarcarComoPaga(parcela.id)}
              className="mt-3 bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Marcar como paga
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}