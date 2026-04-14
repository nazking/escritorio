'use client'

import { useRouter } from 'next/navigation'
import { Cliente } from '@/types'
import { formatarData, formatarMoeda } from '@/lib/utils'

type Props = {
  clientes: Cliente[]
  onFinalizarDeadline: (clienteId: string) => void
  onReabrirDeadline: (clienteId: string) => void
}

export default function ClientesList({
  clientes,
  onFinalizarDeadline,
  onReabrirDeadline,
}: Props) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Clientes cadastrados</h2>
        <span className="text-sm text-gray-500">
          Total: {clientes.length}
        </span>
      </div>

      <div className="space-y-4 max-h-[900px] overflow-auto pr-1">
        {clientes.length === 0 && (
          <p className="text-gray-500">Nenhum cliente encontrado.</p>
        )}

        {clientes.map((cliente) => (
          <div key={cliente.id} className="border rounded-xl p-4">
            <h3 className="font-bold text-lg">{cliente.nome_completo}</h3>
            <p className="text-sm text-gray-600">CPF: {cliente.cpf || 'Não informado'}</p>
            <p className="text-sm text-gray-600">
              Deadline: {formatarData(cliente.deadline)}
            </p>
            <p className="text-sm text-gray-600">
              Status da deadline: {cliente.deadline_finalizada ? 'Finalizada' : 'Pendente'}
            </p>
            <p className="text-sm text-gray-600">
              Valor da causa: {formatarMoeda(cliente.valor_causa)}
            </p>
            <p className="text-sm text-gray-600">
              Honorários: {cliente.tem_honorarios ? 'Sim' : 'Não'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push(`/clientes/${cliente.id}`)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                Ver
              </button>

              {cliente.deadline && (
                <>
                  {cliente.deadline_finalizada ? (
                    <button
                      type="button"
                      onClick={() => onReabrirDeadline(cliente.id)}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Reabrir deadline
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onFinalizarDeadline(cliente.id)}
                      className="bg-black text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Finalizar deadline
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}