import Link from 'next/link'
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
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Clientes cadastrados</h2>

      <div className="space-y-4">
        {clientes.length === 0 && (
          <p className="text-gray-500">Nenhum cliente encontrado.</p>
        )}

        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="border rounded-xl p-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 w-full"
          >
            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
              <div>
                <p className="text-xs uppercase text-gray-500">ID</p>
                <p className="font-semibold">{cliente.public_id}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Nome</p>
                <p className="font-semibold">{cliente.nome_completo}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Prazo da ação</p>
                <p>{formatarData(cliente.deadline)}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Valor da causa</p>
                <p>{formatarMoeda(cliente.valor_causa)}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Status do prazo</p>
                <p>{cliente.deadline_finalizada ? 'Finalizado' : 'Em aberto'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {cliente.deadline_finalizada ? (
                <button
                  type="button"
                  onClick={() => onReabrirDeadline(cliente.id)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
                >
                  Reabrir prazo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onFinalizarDeadline(cliente.id)}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Finalizar prazo
                </button>
              )}

              <Link
                href={`/clientes/${cliente.id}`}
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                Ver
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}