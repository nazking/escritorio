import { Cliente } from '@/types'
import { formatarData } from '@/lib/utils'

type Props = {
  deadlinesVencidas: Cliente[]
  deadlinesProximas: Cliente[]
  onFinalizarDeadline: (clienteId: string) => void | Promise<void>
}

export default function DeadlinesAlert({
  deadlinesVencidas,
  deadlinesProximas,
  onFinalizarDeadline,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Prazos da ação em alerta</h2>

      <div className="space-y-3 max-h-[250px] overflow-auto">
        {deadlinesVencidas.length === 0 && deadlinesProximas.length === 0 && (
          <p className="text-gray-500">Nenhum prazo da ação em alerta.</p>
        )}

        {deadlinesVencidas.map((cliente) => (
          <div key={cliente.id} className="border border-red-300 bg-red-50 rounded-xl p-4">
            <p className="font-semibold text-red-900">{cliente.nome_completo}</p>
            <p className="text-sm text-red-800">
              Prazo da ação vencido em {formatarData(cliente.deadline)}
            </p>
            <button
              type="button"
              onClick={() => onFinalizarDeadline(cliente.id)}
              className="mt-3 bg-red-900 text-white px-3 py-2 rounded-lg text-sm"
            >
              Finalizar prazo
            </button>
          </div>
        ))}

        {deadlinesProximas.map((cliente) => (
          <div key={cliente.id} className="border border-yellow-300 bg-yellow-50 rounded-xl p-4">
            <p className="font-semibold text-yellow-900">{cliente.nome_completo}</p>
            <p className="text-sm text-yellow-800">
              Prazo da ação próximo em {formatarData(cliente.deadline)}
            </p>
            <button
              type="button"
              onClick={() => onFinalizarDeadline(cliente.id)}
              className="mt-3 bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Finalizar prazo
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}