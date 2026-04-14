type Props = {
  carregando: boolean
  mensagem: string

  nomeCompleto: string
  setNomeCompleto: (valor: string) => void

  endereco: string
  setEndereco: (valor: string) => void

  cpf: string
  setCpf: (valor: string) => void

  dataNascimento: string
  setDataNascimento: (valor: string) => void

  descricaoCaso: string
  setDescricaoCaso: (valor: string) => void

  dataAcao: string
  setDataAcao: (valor: string) => void

  deadline: string
  setDeadline: (valor: string) => void

  valorCausa: string
  setValorCausa: (valor: string) => void

  temHonorarios: boolean
  setTemHonorarios: (valor: boolean) => void

  valorHonorarios: string
  setValorHonorarios: (valor: string) => void

  honorariosParcelados: boolean
  setHonorariosParcelados: (valor: boolean) => void

  quantidadeParcelas: string
  setQuantidadeParcelas: (valor: string) => void

  onSubmit: (e: React.FormEvent) => void
}

export default function ClienteForm({
  carregando,
  mensagem,
  nomeCompleto,
  setNomeCompleto,
  endereco,
  setEndereco,
  cpf,
  setCpf,
  dataNascimento,
  setDataNascimento,
  descricaoCaso,
  setDescricaoCaso,
  dataAcao,
  setDataAcao,
  deadline,
  setDeadline,
  valorCausa,
  setValorCausa,
  temHonorarios,
  setTemHonorarios,
  valorHonorarios,
  setValorHonorarios,
  honorariosParcelados,
  setHonorariosParcelados,
  quantidadeParcelas,
  setQuantidadeParcelas,
  onSubmit,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Cadastrar Cliente</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input
            type="text"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CPF</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data de nascimento</label>
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição do caso</label>
          <textarea
            value={descricaoCaso}
            onChange={(e) => setDescricaoCaso(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data da ação</label>
          <input
            type="date"
            value={dataAcao}
            onChange={(e) => setDataAcao(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Valor da causa</label>
          <input
            type="number"
            step="0.01"
            value={valorCausa}
            onChange={(e) => setValorCausa(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="temHonorarios"
            type="checkbox"
            checked={temHonorarios}
            onChange={(e) => {
              setTemHonorarios(e.target.checked)
              if (!e.target.checked) {
                setValorHonorarios('')
                setHonorariosParcelados(false)
                setQuantidadeParcelas('')
              }
            }}
          />
          <label htmlFor="temHonorarios" className="text-sm font-medium">
            Tem honorários?
          </label>
        </div>

        {temHonorarios && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Valor dos honorários</label>
              <input
                type="number"
                step="0.01"
                value={valorHonorarios}
                onChange={(e) => setValorHonorarios(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required={temHonorarios}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="honorariosParcelados"
                type="checkbox"
                checked={honorariosParcelados}
                onChange={(e) => {
                  setHonorariosParcelados(e.target.checked)
                  if (!e.target.checked) {
                    setQuantidadeParcelas('')
                  }
                }}
              />
              <label htmlFor="honorariosParcelados" className="text-sm font-medium">
                Honorários parcelados?
              </label>
            </div>

            {honorariosParcelados && (
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade de parcelas</label>
                <input
                  type="number"
                  min="1"
                  value={quantidadeParcelas}
                  onChange={(e) => setQuantidadeParcelas(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required={honorariosParcelados}
                />
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-black text-white rounded-lg py-2 font-medium hover:opacity-90"
        >
          {carregando ? 'Salvando...' : 'Salvar cliente'}
        </button>
      </form>

      {mensagem && (
        <p className="mt-4 text-sm text-gray-700">{mensagem}</p>
      )}
    </div>
  )
}