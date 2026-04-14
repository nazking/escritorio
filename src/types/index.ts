export type Usuario = {
  id: string
  email?: string
}

export type Cliente = {
  id: string
  public_id: number
  nome_completo: string
  endereco: string | null
  bairro: string | null
  cidade: string | null
  numero_casa: string | null
  complemento: string | null
  cpf: string | null
  data_nascimento: string | null
  descricao_caso: string | null
  data_acao: string | null
  deadline: string | null
  deadline_finalizada: boolean
  valor_causa: number | null
  tem_honorarios: boolean
  numero_processo?: string | null
  comarca_processo?: string | null
  data_distribuicao?: string | null
}

export type Parcela = {
  id: string
  cliente_id: string
  numero_parcela: number
  valor_parcela: number
  data_vencimento: string
  status: string
  cliente?: {
    nome_completo: string
  }[] | null
}