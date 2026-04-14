type Props = {
  buscaNome: string
  setBuscaNome: (valor: string) => void

  filtroDeadline: string
  setFiltroDeadline: (valor: string) => void

  filtroHonorarios: string
  setFiltroHonorarios: (valor: string) => void

  dataInicial: string
  setDataInicial: (valor: string) => void

  dataFinal: string
  setDataFinal: (valor: string) => void

  onLimparFiltros: () => void
}

export default function FiltrosBusca({
  buscaNome,
  setBuscaNome,
  filtroDeadline,
  setFiltroDeadline,
  filtroHonorarios,
  setFiltroHonorarios,
  dataInicial,
  setDataInicial,
  dataFinal,
  setDataFinal,
  onLimparFiltros,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Busca e filtros</h2>
        <button
          type="button"
          onClick={onLimparFiltros}
          className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          Limpar filtros
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            placeholder="Buscar por nome"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deadline</label>
          <select
            value={filtroDeadline}
            onChange={(e) => setFiltroDeadline(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Todas</option>
            <option value="vencida">Vencida</option>
            <option value="proxima">Próxima</option>
            <option value="finalizada">Finalizada</option>
            <option value="sem_deadline">Sem deadline</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Honorários</label>
          <select
            value={filtroHonorarios}
            onChange={(e) => setFiltroHonorarios(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Todos</option>
            <option value="vencido">Vencido</option>
            <option value="proximo">Próximo</option>
            <option value="pago">Pago</option>
            <option value="sem_honorarios">Sem honorários</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data inicial</label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data final</label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>
    </div>
  )
}