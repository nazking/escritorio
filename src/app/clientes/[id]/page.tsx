'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  formatarCpf,
  formatarData,
  formatarMoeda,
  formatarMoedaInput,
  diferencaDias,
  moedaInputParaNumero,
} from '@/lib/utils'
import { Cliente } from '@/types'

type ParcelaCliente = {
  id: string
  numero_parcela: number
  valor_parcela: number
  data_vencimento: string
  status: string
  data_pagamento: string | null
  observacoes: string | null
}

type ArquivoCliente = {
  id: string
  nome_arquivo: string
  caminho_arquivo: string
  tipo_arquivo: string | null
  tamanho_bytes: number | null
  created_at?: string
}

type NotaCliente = {
  id: string
  conteudo: string
  created_at: string
  tipo: string
}

type AbaCliente = 'dados' | 'processo' | 'honorarios' | 'arquivos'

function limparNomeArquivo(nome: string) {
  const partes = nome.split('.')
  const extensao = partes.length > 1 ? partes.pop() : ''
  const base = partes.join('.')

  const baseLimpa = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return extensao ? `${baseLimpa}.${extensao.toLowerCase()}` : baseLimpa
}

function formatarDataHora(dataIso: string | null | undefined) {
  if (!dataIso) return 'Não informado'

  return new Date(dataIso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function ClienteDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.id as string

  const [abaAtiva, setAbaAtiva] = useState<AbaCliente>('dados')

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [parcelas, setParcelas] = useState<ParcelaCliente[]>([])
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [notas, setNotas] = useState<NotaCliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')
  const [salvandoParcelaId, setSalvandoParcelaId] = useState<string | null>(null)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [salvandoProcesso, setSalvandoProcesso] = useState(false)
  const [enviandoArquivo, setEnviandoArquivo] = useState(false)
  const [excluindoArquivoId, setExcluindoArquivoId] = useState<string | null>(null)
  const [excluindoCliente, setExcluindoCliente] = useState(false)
  const [novaNota, setNovaNota] = useState('')
  const [novaAtualizacaoProcesso, setNovaAtualizacaoProcesso] = useState('')
  const [salvandoNota, setSalvandoNota] = useState(false)
  const [salvandoAtualizacaoProcesso, setSalvandoAtualizacaoProcesso] = useState(false)
  const [excluindoNotaId, setExcluindoNotaId] = useState<string | null>(null)

  const [parcelaEditandoId, setParcelaEditandoId] = useState<string | null>(null)
  const [novaDataVencimento, setNovaDataVencimento] = useState('')
  const [comentarioParcelaId, setComentarioParcelaId] = useState<string | null>(null)
  const [comentarioParcela, setComentarioParcela] = useState('')

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [numeroCasa, setNumeroCasa] = useState('')
  const [complemento, setComplemento] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [descricaoCaso, setDescricaoCaso] = useState('')
  const [dataAcao, setDataAcao] = useState('')
  const [prazoAcao, setPrazoAcao] = useState('')
  const [valorCausa, setValorCausa] = useState('')
  const [temHonorarios, setTemHonorarios] = useState(false)
  const [prazoAcaoFinalizado, setPrazoAcaoFinalizado] = useState(false)

  const [numeroProcesso, setNumeroProcesso] = useState('')
  const [comarcaProcesso, setComarcaProcesso] = useState('')
  const [dataDistribuicao, setDataDistribuicao] = useState('')

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    setCarregando(true)
    setMensagem('')

    const [
      { data: clienteData, error: clienteError },
      { data: parcelasData, error: parcelasError },
      { data: arquivosData, error: arquivosError },
      { data: notasData, error: notasError },
    ] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', clienteId).single(),
      supabase
        .from('parcelas_honorarios')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('numero_parcela', { ascending: true }),
      supabase
        .from('arquivos_cliente')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false }),
      supabase
        .from('notas_cliente')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false }),
    ])

    if (clienteError) {
      setMensagem('Erro ao carregar cliente: ' + clienteError.message)
      setCarregando(false)
      return
    }

    if (parcelasError) {
      setMensagem('Erro ao carregar parcelas: ' + parcelasError.message)
      setCarregando(false)
      return
    }

    if (arquivosError) {
      setMensagem('Erro ao carregar arquivos: ' + arquivosError.message)
      setCarregando(false)
      return
    }

    if (notasError) {
      setMensagem('Erro ao carregar notas: ' + notasError.message)
      setCarregando(false)
      return
    }

    setCliente(clienteData)
    setParcelas((parcelasData as ParcelaCliente[]) || [])
    setArquivos((arquivosData as ArquivoCliente[]) || [])
    setNotas((notasData as NotaCliente[]) || [])

    setNomeCompleto(clienteData.nome_completo || '')
    setEndereco(clienteData.endereco || '')
    setBairro(clienteData.bairro || '')
    setCidade(clienteData.cidade || '')
    setNumeroCasa(clienteData.numero_casa || '')
    setComplemento(clienteData.complemento || '')
    setCpf(clienteData.cpf || '')
    setDataNascimento(clienteData.data_nascimento || '')
    setDescricaoCaso(clienteData.descricao_caso || '')
    setDataAcao(clienteData.data_acao || '')
    setPrazoAcao(clienteData.deadline || '')
    setValorCausa(
      clienteData.valor_causa != null
        ? formatarMoedaInput(String(clienteData.valor_causa).replace('.', ','))
        : ''
    )
    setTemHonorarios(clienteData.tem_honorarios || false)
    setPrazoAcaoFinalizado(clienteData.deadline_finalizada || false)

    setNumeroProcesso(clienteData.numero_processo || '')
    setComarcaProcesso(clienteData.comarca_processo || '')
    setDataDistribuicao(clienteData.data_distribuicao || '')

    setCarregando(false)
  }

  async function marcarComoPaga(parcelaId: string) {
    setSalvandoParcelaId(parcelaId)
    setMensagem('')

    const hoje = new Date().toISOString().slice(0, 10)

    const { error } = await supabase
      .from('parcelas_honorarios')
      .update({
        status: 'pago',
        data_pagamento: hoje,
      })
      .eq('id', parcelaId)

    if (error) {
      setMensagem('Erro ao marcar parcela como paga: ' + error.message)
      setSalvandoParcelaId(null)
      return
    }

    setMensagem('Parcela marcada como paga.')
    await carregarTudo()
    setSalvandoParcelaId(null)
  }

  async function desfazerPagamento(parcelaId: string) {
    setSalvandoParcelaId(parcelaId)
    setMensagem('')

    const { error } = await supabase
      .from('parcelas_honorarios')
      .update({
        status: 'pendente',
        data_pagamento: null,
      })
      .eq('id', parcelaId)

    if (error) {
      setMensagem('Erro ao desfazer pagamento: ' + error.message)
      setSalvandoParcelaId(null)
      return
    }

    setMensagem('Pagamento desfeito com sucesso.')
    await carregarTudo()
    setSalvandoParcelaId(null)
  }

  function iniciarEdicaoVencimento(parcela: ParcelaCliente) {
    setParcelaEditandoId(parcela.id)
    setNovaDataVencimento(parcela.data_vencimento)
  }

  function cancelarEdicaoVencimento() {
    setParcelaEditandoId(null)
    setNovaDataVencimento('')
  }

  async function salvarNovoVencimento(parcelaId: string) {
    if (!novaDataVencimento) {
      setMensagem('Escolha uma nova data de vencimento.')
      return
    }

    setSalvandoParcelaId(parcelaId)
    setMensagem('')

    const { error } = await supabase
      .from('parcelas_honorarios')
      .update({
        data_vencimento: novaDataVencimento,
      })
      .eq('id', parcelaId)

    if (error) {
      setMensagem('Erro ao alterar vencimento: ' + error.message)
      setSalvandoParcelaId(null)
      return
    }

    setMensagem('Vencimento da parcela alterado com sucesso.')
    setParcelaEditandoId(null)
    setNovaDataVencimento('')
    await carregarTudo()
    setSalvandoParcelaId(null)
  }

  function iniciarComentarioParcela(parcela: ParcelaCliente) {
    setComentarioParcelaId(parcela.id)
    setComentarioParcela(parcela.observacoes || '')
  }

  function cancelarComentarioParcela() {
    setComentarioParcelaId(null)
    setComentarioParcela('')
  }

  async function salvarComentarioParcela(parcelaId: string) {
    setSalvandoParcelaId(parcelaId)
    setMensagem('')

    const { error } = await supabase
      .from('parcelas_honorarios')
      .update({
        observacoes: comentarioParcela || null,
      })
      .eq('id', parcelaId)

    if (error) {
      setMensagem('Erro ao salvar comentário da parcela: ' + error.message)
      setSalvandoParcelaId(null)
      return
    }

    setMensagem('Comentário da parcela salvo com sucesso.')
    setComentarioParcelaId(null)
    setComentarioParcela('')
    await carregarTudo()
    setSalvandoParcelaId(null)
  }

  async function salvarEdicao(e: FormEvent) {
    e.preventDefault()

    setSalvandoEdicao(true)
    setMensagem('')

    const { data, error } = await supabase
      .from('clientes')
      .update({
        nome_completo: nomeCompleto,
        endereco: endereco || null,
        bairro: bairro || null,
        cidade: cidade || null,
        numero_casa: numeroCasa || null,
        complemento: complemento || null,
        cpf: cpf || null,
        data_nascimento: dataNascimento || null,
        descricao_caso: descricaoCaso || null,
        data_acao: dataAcao || null,
        deadline: prazoAcao || null,
        valor_causa: valorCausa ? moedaInputParaNumero(valorCausa) : 0,
        tem_honorarios: temHonorarios,
        deadline_finalizada: prazoAcaoFinalizado,
      })
      .eq('id', clienteId)
      .select()
      .single()

    if (error) {
      setMensagem('Erro ao salvar alterações: ' + error.message)
      setSalvandoEdicao(false)
      return
    }

    setCliente(data)
    setMensagem('Dados do cliente atualizados com sucesso.')
    setSalvandoEdicao(false)
    await carregarTudo()
  }

  async function salvarProcesso(e: FormEvent) {
    e.preventDefault()

    setSalvandoProcesso(true)
    setMensagem('')

    const { error } = await supabase
      .from('clientes')
      .update({
        numero_processo: numeroProcesso || null,
        comarca_processo: comarcaProcesso || null,
        data_distribuicao: dataDistribuicao || null,
      })
      .eq('id', clienteId)

    if (error) {
      setMensagem('Erro ao salvar dados do processo: ' + error.message)
      setSalvandoProcesso(false)
      return
    }

    setMensagem('Dados do processo atualizados com sucesso.')
    setSalvandoProcesso(false)
    await carregarTudo()
  }

  async function adicionarNota(tipo: 'geral' | 'processo') {
    const conteudo = tipo === 'geral' ? novaNota.trim() : novaAtualizacaoProcesso.trim()

    if (!conteudo) {
      setMensagem('Digite uma atualização antes de salvar.')
      return
    }

    if (tipo === 'geral') {
      setSalvandoNota(true)
    } else {
      setSalvandoAtualizacaoProcesso(true)
    }

    setMensagem('')

    const { data: authData } = await supabase.auth.getUser()

    const { error } = await supabase.from('notas_cliente').insert({
      cliente_id: clienteId,
      user_id: authData.user?.id || null,
      conteudo,
      tipo,
    })

    if (error) {
      setMensagem('Erro ao adicionar atualização: ' + error.message)
      setSalvandoNota(false)
      setSalvandoAtualizacaoProcesso(false)
      return
    }

    if (tipo === 'geral') {
      setNovaNota('')
    } else {
      setNovaAtualizacaoProcesso('')
    }

    setMensagem('Atualização adicionada com sucesso.')
    setSalvandoNota(false)
    setSalvandoAtualizacaoProcesso(false)
    await carregarTudo()
  }

  async function excluirNota(notaId: string) {
    const confirmar = window.confirm('Deseja excluir esta atualização?')
    if (!confirmar) return

    setExcluindoNotaId(notaId)
    setMensagem('')

    const { error } = await supabase.from('notas_cliente').delete().eq('id', notaId)

    if (error) {
      setMensagem('Erro ao excluir atualização: ' + error.message)
      setExcluindoNotaId(null)
      return
    }

    setMensagem('Atualização excluída com sucesso.')
    setExcluindoNotaId(null)
    await carregarTudo()
  }

  async function enviarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      setMensagem('Usuário não autenticado.')
      return
    }

    setEnviandoArquivo(true)
    setMensagem('')

    const userId = authData.user.id
    const nomeSeguro = `${Date.now()}-${limparNomeArquivo(arquivo.name)}`
    const caminhoArquivo = `${userId}/${clienteId}/${nomeSeguro}`

    const { error: uploadError } = await supabase.storage
      .from('arquivos-clientes')
      .upload(caminhoArquivo, arquivo, {
        upsert: false,
        contentType: arquivo.type || undefined,
      })

    if (uploadError) {
      setMensagem('Erro ao enviar arquivo: ' + uploadError.message)
      setEnviandoArquivo(false)
      e.target.value = ''
      return
    }

    const { error: bancoError } = await supabase.from('arquivos_cliente').insert({
      user_id: userId,
      cliente_id: clienteId,
      nome_arquivo: arquivo.name,
      caminho_arquivo: caminhoArquivo,
      tipo_arquivo: arquivo.type || null,
      tamanho_bytes: arquivo.size,
    })

    if (bancoError) {
      setMensagem('Arquivo enviado, mas houve erro ao registrar no banco: ' + bancoError.message)
      setEnviandoArquivo(false)
      e.target.value = ''
      await carregarTudo()
      return
    }

    setMensagem('Arquivo enviado com sucesso.')
    setEnviandoArquivo(false)
    e.target.value = ''
    await carregarTudo()
  }

  async function baixarArquivo(caminhoArquivo: string, nomeArquivo: string) {
    setMensagem('')

    const { data, error } = await supabase.storage
      .from('arquivos-clientes')
      .download(caminhoArquivo)

    if (error || !data) {
      setMensagem('Erro ao baixar arquivo: ' + (error?.message || 'Erro desconhecido'))
      return
    }

    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  async function excluirArquivo(arquivo: ArquivoCliente) {
    const confirmar = window.confirm(`Deseja excluir o arquivo "${arquivo.nome_arquivo}"?`)
    if (!confirmar) return

    setExcluindoArquivoId(arquivo.id)
    setMensagem('')

    const { error: storageError } = await supabase.storage
      .from('arquivos-clientes')
      .remove([arquivo.caminho_arquivo])

    if (storageError) {
      setMensagem('Erro ao excluir arquivo do storage: ' + storageError.message)
      setExcluindoArquivoId(null)
      return
    }

    const { error: bancoError } = await supabase
      .from('arquivos_cliente')
      .delete()
      .eq('id', arquivo.id)

    if (bancoError) {
      setMensagem('Arquivo removido do storage, mas houve erro ao apagar registro: ' + bancoError.message)
      setExcluindoArquivoId(null)
      await carregarTudo()
      return
    }

    setMensagem('Arquivo excluído com sucesso.')
    setExcluindoArquivoId(null)
    await carregarTudo()
  }

  async function excluirCliente() {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este cliente? Essa ação vai apagar também honorários, parcelas, notas e registros de arquivos.'
    )
    if (!confirmar) return

    setExcluindoCliente(true)
    setMensagem('')

    try {
      if (arquivos.length > 0) {
        const caminhos = arquivos.map((arquivo) => arquivo.caminho_arquivo)

        const { error: storageError } = await supabase.storage
          .from('arquivos-clientes')
          .remove(caminhos)

        if (storageError) {
          setMensagem('Erro ao excluir arquivos do storage: ' + storageError.message)
          return
        }
      }

      const { error: clienteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId)

      if (clienteError) {
        setMensagem('Erro ao excluir cliente: ' + clienteError.message)
        return
      }

      router.push('/')
    } finally {
      setExcluindoCliente(false)
    }
  }

  const notasGerais = useMemo(() => notas.filter((n) => n.tipo === 'geral'), [notas])
  const notasProcesso = useMemo(() => notas.filter((n) => n.tipo === 'processo'), [notas])

  const parcelasPagas = useMemo(() => {
    return parcelas.filter((parcela) => parcela.status === 'pago')
  }, [parcelas])

  const parcelasPendentes = useMemo(() => {
    return parcelas.filter((parcela) => {
      return parcela.status !== 'pago' && diferencaDias(parcela.data_vencimento) >= 0
    })
  }, [parcelas])

  const parcelasVencidas = useMemo(() => {
    return parcelas.filter((parcela) => {
      return parcela.status !== 'pago' && diferencaDias(parcela.data_vencimento) < 0
    })
  }, [parcelas])

  function renderAtualizacoes(lista: NotaCliente[]) {
    return (
      <div className="pt-2 space-y-3">
        {lista.length === 0 && <p className="text-gray-500">Nenhuma atualização cadastrada ainda.</p>}

        {lista.map((nota) => (
          <div key={nota.id} className="border rounded-xl p-4 bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">{formatarDataHora(nota.created_at)}</p>
                <p className="whitespace-pre-wrap text-gray-800">{nota.conteudo}</p>
              </div>

              <button
                type="button"
                onClick={() => excluirNota(nota.id)}
                disabled={excluindoNotaId === nota.id}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                {excluindoNotaId === nota.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  function renderCardParcela(parcela: ParcelaCliente, variante: 'paga' | 'a_vencer' | 'vencida') {
    const estilos =
      variante === 'paga'
        ? {
            box: 'border-green-300 bg-green-50',
            title: 'text-green-900',
            text: 'text-green-800',
            button: 'bg-green-900',
          }
        : variante === 'a_vencer'
        ? {
            box: 'border-yellow-300 bg-yellow-50',
            title: 'text-yellow-900',
            text: 'text-yellow-800',
            button: 'bg-yellow-700',
          }
        : {
            box: 'border-red-300 bg-red-50',
            title: 'text-red-900',
            text: 'text-red-800',
            button: 'bg-red-900',
          }

    return (
      <div key={parcela.id} className={`border rounded-xl p-4 ${estilos.box}`}>
        <p className={`font-semibold ${estilos.title}`}>Parcela {parcela.numero_parcela}</p>

        <p className={`text-sm ${estilos.text}`}>Vencimento: {formatarData(parcela.data_vencimento)}</p>

        {parcela.data_pagamento && (
          <p className={`text-sm ${estilos.text}`}>Pagamento: {formatarData(parcela.data_pagamento)}</p>
        )}

        <p className={`text-sm ${estilos.text}`}>Valor: {formatarMoeda(parcela.valor_parcela)}</p>

        {parcela.observacoes && (
          <p className={`text-sm ${estilos.text} mt-2`}>
            <span className="font-semibold">Comentário:</span> {parcela.observacoes}
          </p>
        )}

        {parcelaEditandoId === parcela.id ? (
          <div className="mt-3 space-y-2">
            <input
              type="date"
              value={novaDataVencimento}
              onChange={(e) => setNovaDataVencimento(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-black"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => salvarNovoVencimento(parcela.id)}
                disabled={salvandoParcelaId === parcela.id}
                className="bg-black text-white px-3 py-2 rounded-lg text-sm"
              >
                {salvandoParcelaId === parcela.id ? 'Salvando...' : 'Salvar nova data'}
              </button>

              <button
                type="button"
                onClick={cancelarEdicaoVencimento}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : comentarioParcelaId === parcela.id ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={comentarioParcela}
              onChange={(e) => setComentarioParcela(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-black min-h-[90px]"
              placeholder="Digite aqui a negociação ou observação desta parcela..."
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => salvarComentarioParcela(parcela.id)}
                disabled={salvandoParcelaId === parcela.id}
                className="bg-black text-white px-3 py-2 rounded-lg text-sm"
              >
                {salvandoParcelaId === parcela.id ? 'Salvando...' : 'Salvar comentário'}
              </button>

              <button
                type="button"
                onClick={cancelarComentarioParcela}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {variante === 'paga' ? (
              <button
                type="button"
                onClick={() => desfazerPagamento(parcela.id)}
                disabled={salvandoParcelaId === parcela.id}
                className={`${estilos.button} text-white px-3 py-2 rounded-lg text-sm`}
              >
                {salvandoParcelaId === parcela.id ? 'Salvando...' : 'Desfazer pagamento'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => marcarComoPaga(parcela.id)}
                disabled={salvandoParcelaId === parcela.id}
                className={`${estilos.button} text-white px-3 py-2 rounded-lg text-sm`}
              >
                {salvandoParcelaId === parcela.id ? 'Salvando...' : 'Marcar como paga'}
              </button>
            )}

            <button
              type="button"
              onClick={() => iniciarEdicaoVencimento(parcela)}
              className="bg-black text-white px-3 py-2 rounded-lg text-sm"
            >
              Alterar vencimento
            </button>

            <button
              type="button"
              onClick={() => iniciarComentarioParcela(parcela)}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Comentário
            </button>
          </div>
        )}
      </div>
    )
  }

  function renderAbaConteudo() {
    if (abaAtiva === 'dados') {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Editar cliente</h2>

            <form onSubmit={salvarEdicao} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-1">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatarCpf(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2"
                    maxLength={14}
                    placeholder="000.000.000-00"
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
                  <label className="block text-sm font-medium mb-1">Bairro</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Número da casa</label>
                  <input
                    type="text"
                    value={numeroCasa}
                    onChange={(e) => setNumeroCasa(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Complemento</label>
                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Opcional"
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
                  <label className="block text-sm font-medium mb-1">Data da ação</label>
                  <input
                    type="date"
                    value={dataAcao}
                    onChange={(e) => setDataAcao(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prazo da ação</label>
                  <input
                    type="date"
                    value={prazoAcao}
                    onChange={(e) => setPrazoAcao(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Valor da causa</label>
                  <input
                    type="text"
                    value={valorCausa}
                    onChange={(e) => setValorCausa(formatarMoedaInput(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={temHonorarios}
                      onChange={(e) => setTemHonorarios(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Tem honorários?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prazoAcaoFinalizado}
                      onChange={(e) => setPrazoAcaoFinalizado(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Prazo da ação finalizado?</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição do caso</label>
                <textarea
                  value={descricaoCaso}
                  onChange={(e) => setDescricaoCaso(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={salvandoEdicao}
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Atualizações gerais</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nova atualização</label>
                <textarea
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 min-h-[110px]"
                  placeholder="Escreva aqui uma atualização geral do cliente..."
                />
              </div>

              <button
                type="button"
                onClick={() => adicionarNota('geral')}
                disabled={salvandoNota}
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                {salvandoNota ? 'Salvando...' : 'Adicionar atualização'}
              </button>

              {renderAtualizacoes(notasGerais)}
            </div>
          </div>
        </div>
      )
    }

    if (abaAtiva === 'processo') {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Dados do processo</h2>

            <form onSubmit={salvarProcesso} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número do processo</label>
                  <input
                    type="text"
                    value={numeroProcesso}
                    onChange={(e) => setNumeroProcesso(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Comarca do processo</label>
                  <input
                    type="text"
                    value={comarcaProcesso}
                    onChange={(e) => setComarcaProcesso(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data de distribuição</label>
                  <input
                    type="date"
                    value={dataDistribuicao}
                    onChange={(e) => setDataDistribuicao(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={salvandoProcesso}
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                {salvandoProcesso ? 'Salvando...' : 'Salvar dados do processo'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Atualizações do processo</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nova atualização do processo</label>
                <textarea
                  value={novaAtualizacaoProcesso}
                  onChange={(e) => setNovaAtualizacaoProcesso(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 min-h-[110px]"
                  placeholder="Ex.: distribuído, audiência marcada, juntada realizada, decisão publicada..."
                />
              </div>

              <button
                type="button"
                onClick={() => adicionarNota('processo')}
                disabled={salvandoAtualizacaoProcesso}
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                {salvandoAtualizacaoProcesso ? 'Salvando...' : 'Adicionar atualização do processo'}
              </button>

              {renderAtualizacoes(notasProcesso)}
            </div>
          </div>
        </div>
      )
    }

    if (abaAtiva === 'honorarios') {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-100 border border-green-300 rounded-2xl p-4">
              <p className="text-sm text-green-800">Parcelas pagas</p>
              <h2 className="text-3xl font-bold text-green-900">{parcelasPagas.length}</h2>
            </div>

            <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4">
              <p className="text-sm text-yellow-800">Parcelas a vencer</p>
              <h2 className="text-3xl font-bold text-yellow-900">{parcelasPendentes.length}</h2>
            </div>

            <div className="bg-red-100 border border-red-300 rounded-2xl p-4">
              <p className="text-sm text-red-800">Parcelas vencidas</p>
              <h2 className="text-3xl font-bold text-red-900">{parcelasVencidas.length}</h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Pagas</h2>
              <div className="space-y-3 max-h-[420px] overflow-auto">
                {parcelasPagas.length === 0 && <p className="text-gray-500">Nenhuma parcela paga.</p>}
                {parcelasPagas.map((parcela) => renderCardParcela(parcela, 'paga'))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">A vencer</h2>
              <div className="space-y-3 max-h-[420px] overflow-auto">
                {parcelasPendentes.length === 0 && <p className="text-gray-500">Nenhuma parcela a vencer.</p>}
                {parcelasPendentes.map((parcela) => renderCardParcela(parcela, 'a_vencer'))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Vencidas</h2>
              <div className="space-y-3 max-h-[420px] overflow-auto">
                {parcelasVencidas.length === 0 && <p className="text-gray-500">Nenhuma parcela vencida.</p>}
                {parcelasVencidas.map((parcela) => renderCardParcela(parcela, 'vencida'))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold">Arquivos do cliente</h2>

          <label className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer">
            {enviandoArquivo ? 'Enviando...' : 'Anexar arquivo'}
            <input
              type="file"
              className="hidden"
              onChange={enviarArquivo}
              disabled={enviandoArquivo}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            />
          </label>
        </div>

        <div className="space-y-3">
          {arquivos.length === 0 && <p className="text-gray-500">Nenhum arquivo anexado ainda.</p>}

          {arquivos.map((arquivo) => (
            <div
              key={arquivo.id}
              className="border rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium">{arquivo.nome_arquivo}</p>
                <p className="text-sm text-gray-600">
                  Enviado em: {formatarData(arquivo.created_at?.slice(0, 10) || null)}
                </p>
                <p className="text-sm text-gray-600">
                  Tamanho:{' '}
                  {arquivo.tamanho_bytes != null
                    ? `${(arquivo.tamanho_bytes / 1024).toFixed(1)} KB`
                    : 'Não informado'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => baixarArquivo(arquivo.caminho_arquivo, arquivo.nome_arquivo)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Baixar
                </button>

                <button
                  type="button"
                  onClick={() => excluirArquivo(arquivo)}
                  disabled={excluindoArquivoId === arquivo.id}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  {excluindoArquivoId === arquivo.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <p>Carregando cliente...</p>
        </div>
      </main>
    )
  }

  if (!cliente) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <p className="text-red-600">{mensagem || 'Cliente não encontrado.'}</p>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Voltar para o painel
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Detalhes do Cliente</h1>
            <p className="text-gray-600 mt-1">
              ID do cliente: <span className="font-semibold">{(cliente as any).public_id}</span>
            </p>
            <p className="text-gray-600">{cliente.nome_completo}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={excluirCliente}
              disabled={excluindoCliente}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              {excluindoCliente ? 'Excluindo...' : 'Excluir cliente'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Voltar
            </button>
          </div>
        </div>

        {mensagem && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-700">{mensagem}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAbaAtiva('dados')}
              className={`px-4 py-2 rounded-xl font-medium ${
                abaAtiva === 'dados' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Dados
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('processo')}
              className={`px-4 py-2 rounded-xl font-medium ${
                abaAtiva === 'processo' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Processo
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('honorarios')}
              className={`px-4 py-2 rounded-xl font-medium ${
                abaAtiva === 'honorarios' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Honorários
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('arquivos')}
              className={`px-4 py-2 rounded-xl font-medium ${
                abaAtiva === 'arquivos' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Arquivos
            </button>
          </div>
        </div>

        {renderAbaConteudo()}
      </div>
    </main>
  )
}