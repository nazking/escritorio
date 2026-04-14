import { Cliente } from '@/types'
import { formatarData } from '@/lib/utils'

type Props = {
  deadlinesVencidas: Cliente[]
  deadlinesProximas: Cliente[]
  onFinalizarDeadline: (clienteId: string) => void
}

export default function DeadlinesAlert({
  deadlinesVencidas,
  deadlinesProximas,
  onFinalizarDeadline,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Deadlines em alerta</h2>

      <div className="space-y-3 max-h-[250px] overflow-auto">
        {deadlinesVencidas.length === 0 && deadlinesProximas.length === 0 && (
          <p className="text-gray-500">Nenhuma deadline em alerta.</p>
        )}

        {deadlinesVencidas.map((cliente) => (
          <div key={cliente.id} className="border border-red-300 bg-red-50 rounded-xl p-4">
            <p className="font-semibold text-red-900">{cliente.nome_completo}</p>
            <p className="text-sm text-red-800">
              Deadline vencida em {formatarData(cliente.deadline)}
            </p>
            <button
              onClick={() => onFinalizarDeadline(cliente.id)}
              className="mt-3 bg-red-900 text-white px-3 py-2 rounded-lg text-sm"
            >
              Marcar como finalizada
            </button>
          </div>
        ))}

        {deadlinesProximas.map((cliente) => (
          <div key={cliente.id} className="border border-yellow-300 bg-yellow-50 rounded-xl p-4">
            <p className="font-semibold text-yellow-900">{cliente.nome_completo}</p>
            <p className="text-sm text-yellow-800">
              Deadline próxima em {formatarData(cliente.deadline)}
            </p>
            <button
              onClick={() => onFinalizarDeadline(cliente.id)}
              className="mt-3 bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Marcar como finalizada
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}