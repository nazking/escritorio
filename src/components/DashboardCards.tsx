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
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="bg-red-100 border border-red-300 rounded-2xl p-5">
        <p className="text-sm text-red-800">Prazos da ação vencidos</p>
        <h2 className="text-3xl font-bold text-red-900 mt-1">{deadlinesVencidas}</h2>
      </div>

      <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-5">
        <p className="text-sm text-yellow-800">Prazos da ação próximos</p>
        <h2 className="text-3xl font-bold text-yellow-900 mt-1">{deadlinesProximas}</h2>
      </div>

      <div className="bg-red-100 border border-red-300 rounded-2xl p-5">
        <p className="text-sm text-red-800">Honorários vencidos</p>
        <h2 className="text-3xl font-bold text-red-900 mt-1">{honorariosVencidos}</h2>
      </div>

      <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-5">
        <p className="text-sm text-yellow-800">Honorários próximos</p>
        <h2 className="text-3xl font-bold text-yellow-900 mt-1">{honorariosProximos}</h2>
      </div>
    </div>
  )
}