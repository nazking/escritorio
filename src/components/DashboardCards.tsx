type Props = {
  deadlinesVencidas: number
  deadlinesProximas: number
  honorariosVencidos: number
  honorariosProximos: number
}

export default function DashboardCards({
  deadlinesVencidas,
  deadlinesProximas,
  honorariosVencidos,
  honorariosProximos,
}: Props) {
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="bg-red-100 border border-red-300 rounded-2xl p-4">
        <p className="text-sm text-red-800">Deadlines vencidas</p>
        <h2 className="text-3xl font-bold text-red-900">{deadlinesVencidas}</h2>
      </div>

      <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4">
        <p className="text-sm text-yellow-800">Deadlines próximas</p>
        <h2 className="text-3xl font-bold text-yellow-900">{deadlinesProximas}</h2>
      </div>

      <div className="bg-red-100 border border-red-300 rounded-2xl p-4">
        <p className="text-sm text-red-800">Honorários vencidos</p>
        <h2 className="text-3xl font-bold text-red-900">{honorariosVencidos}</h2>
      </div>

      <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4">
        <p className="text-sm text-yellow-800">Honorários a vencer</p>
        <h2 className="text-3xl font-bold text-yellow-900">{honorariosProximos}</h2>
      </div>
    </div>
  )
}