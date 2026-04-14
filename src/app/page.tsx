'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { adicionarMeses, diferencaDias } from '@/lib/utils'
import { Cliente, Parcela, Usuario } from '@/types'
import DashboardCards from '@/components/DashboardCards'
import ClientesList from '@/components/ClientesList'
import DeadlinesAlert from '@/components/DeadlinesAlert'
import HonorariosAlert from '@/components/HonorariosAlert'
import ClienteForm from '@/components/ClienteForm'
import FiltrosBusca from '@/components/FiltrosBusca'

type AbaAtiva = 'dashboard' | 'cadastro' | 'consulta'

export default function HomePage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('dashboard')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [parcelas, setParcelas] = useState<Parcela[]>([])

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [descricaoCaso, setDescricaoCaso] = useState('')
  const [dataAcao, setDataAcao] = useState('')
  const [deadline, setDeadline] = useState('')
  const [valorCausa, setValorCausa] = useState('')
  const [temHonorarios, setTemHonorarios] = useState(false)

  const [valorHonorarios, setValorHonorarios] = useState('')
  const [honorariosParcelados, setHonorariosParcelados] = useState(false)
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('')

  const [buscaNome, setBuscaNome] = useState('')
  const [filtroDeadline, setFiltroDeadline] = useState('')
  const [filtroHonorarios, setFiltroHonorarios] = useState('')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')

  useEffect(() => {
    verificarUsuario()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const novoUsuario = {
          id: session.user.id,
          email: session.user.email,
        }
        setUsuario(novoUsuario)
        await carregarDados(session.user.id)
      } else {
        setUsuario(null)
        setClientes([])
        setParcelas([])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function verificarUsuario() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      setMensagem('Erro ao verificar login: ' + error.message)
      return
    }

    if (data.session?.user) {
      const novoUsuario = {
        id: data.session.user.id,
        email: data.session.user.email,
      }
      setUsuario(novoUsuario)
      await carregarDados(data.session.user.id)
    }
  }

  async function carregarDados(userId: string) {
    await Promise.all([carregarClientes(userId), carregarParcelas(userId)])
  }

 async function carregarClientes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      setMensagem('Erro ao carregar clientes: ' + error.message)
      return
    }

    setClientes(data || [])
  } catch (error) {
    console.error(error)
    setMensagem('Erro inesperado ao carregar clientes.')
  }
}
    setClientes(data || [])
  }

 async function carregarParcelas(userId: string) {
  try {
    const { data, error } = await supabase
      .from('parcelas_honorarios')
      .select(`
        id,
        cliente_id,
        numero_parcela,
        valor_parcela,
        data_vencimento,
        status,
        cliente:clientes(nome_completo)
      `)
      .eq('user_id', userId)
      .order('data_vencimento', { ascending: true })

    if (error) {
      setMensagem('Erro ao carregar parcelas: ' + error.message)
      return
    }

    setParcelas((data ?? []) as Parcela[])
  } catch (error) {
    console.error(error)
    setMensagem('Erro inesperado ao carregar parcelas.')
  }
}
    setParcelas((data ?? []) as Parcela[])
  }

  async function fazerLogin(e: FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setMensagem('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (error) {
        setMensagem('Erro ao entrar: ' + error.message)
        return
      }

      setMensagem('Login realizado com sucesso.')
    } finally {
      setCarregando(false)
    }
  }

  async function criarContaTeste() {
    setCarregando(true)
    setMensagem('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
      })

      if (error) {
        setMensagem('Erro ao criar conta: ' + error.message)
        return
      }

      setMensagem('Conta criada com sucesso.')
    } finally {
      setCarregando(false)
    }
  }

  async function sair() {
    await supabase.auth.signOut()
    setMensagem('Você saiu da conta.')
  }

  async function marcarParcelaComoPaga(parcelaId: string) {
    if (!usuario) return

    const hoje = new Date().toISOString().slice(0, 10)

    const { error } = await supabase
      .from('parcelas_honorarios')
      .update({
        status: 'pago',
        data_pagamento: hoje,
      })
      .eq('id', parcelaId)
      .eq('user_id', usuario.id)

    if (error) {
      setMensagem('Erro ao marcar parcela como paga: ' + error.message)
      return
    }

    setMensagem('Parcela marcada como paga.')
    await carregarParcelas(usuario.id)
  }

  async function finalizarDeadline(clienteId: string) {
    if (!usuario) return

    const { error } = await supabase
      .from('clientes')
      .update({
        deadline_finalizada: true,
      })
      .eq('id', clienteId)
      .eq('user_id', usuario.id)

    if (error) {
      setMensagem('Erro ao finalizar deadline: ' + error.message)
      return
    }

    setMensagem('Deadline marcada como finalizada.')
    await carregarClientes(usuario.id)
  }

  async function reabrirDeadline(clienteId: string) {
    if (!usuario) return

    const { error } = await supabase
      .from('clientes')
      .update({
        deadline_finalizada: false,
      })
      .eq('id', clienteId)
      .eq('user_id', usuario.id)

    if (error) {
      setMensagem('Erro ao reabrir deadline: ' + error.message)
      return
    }

    setMensagem('Deadline reaberta com sucesso.')
    await carregarClientes(usuario.id)
  }

  async function salvarCliente(e: FormEvent) {
  e.preventDefault()

  if (!usuario) {
    setMensagem('Usuário não identificado.')
    return
  }

  setCarregando(true)
  setMensagem('')

  try {
    const { data: clienteInserido, error: erroCliente } = await supabase
      .from('clientes')
      .insert({
        user_id: usuario.id,
        nome_completo: nomeCompleto,
        endereco: endereco || null,
        cpf: cpf || null,
        data_nascimento: dataNascimento || null,
        descricao_caso: descricaoCaso || null,
        data_acao: dataAcao || null,
        deadline: deadline || null,
        deadline_finalizada: false,
        valor_causa: valorCausa ? Number(valorCausa) : 0,
        tem_honorarios: temHonorarios,
      })
      .select()
      .single()

    if (erroCliente || !clienteInserido) {
      setMensagem('Erro ao salvar cliente: ' + (erroCliente?.message || 'Erro desconhecido'))
      return
    }

    if (temHonorarios) {
      const totalHonorarios = Number(valorHonorarios || 0)
      const ehParcelado = honorariosParcelados
      const qtdParcelas = ehParcelado ? Number(quantidadeParcelas || 0) : 1

      if (!totalHonorarios || totalHonorarios <= 0) {
        setMensagem('Informe um valor válido para os honorários.')
        return
      }

      if (!qtdParcelas || qtdParcelas <= 0) {
        setMensagem('Informe uma quantidade válida de parcelas.')
        return
      }

      const { data: honorarioInserido, error: erroHonorario } = await supabase
        .from('honorarios')
        .insert({
          user_id: usuario.id,
          cliente_id: clienteInserido.id,
          tem_honorarios: true,
          valor_honorarios: totalHonorarios,
          parcelado: ehParcelado,
          quantidade_parcelas: qtdParcelas,
        })
        .select()
        .single()

      if (erroHonorario || !honorarioInserido) {
        setMensagem(
          'Cliente salvo, mas houve erro ao salvar honorários: ' +
            (erroHonorario?.message || 'Erro desconhecido')
        )
        await carregarClientes(usuario.id)
        await carregarParcelas(usuario.id)
        return
      }

      const baseVencimento = dataAcao || new Date().toISOString().slice(0, 10)
      const valorParcela = totalHonorarios / qtdParcelas

      const parcelasGeradas = Array.from({ length: qtdParcelas }).map((_, index) => ({
        user_id: usuario.id,
        cliente_id: clienteInserido.id,
        honorario_id: honorarioInserido.id,
        numero_parcela: index + 1,
        valor_parcela: Number(valorParcela.toFixed(2)),
        data_vencimento: adicionarMeses(baseVencimento, index),
        status: 'pendente',
      }))

      const { error: erroParcelas } = await supabase
        .from('parcelas_honorarios')
        .insert(parcelasGeradas)

      if (erroParcelas) {
        setMensagem(
          'Cliente e honorários salvos, mas houve erro ao gerar parcelas: ' +
            erroParcelas.message
        )
        await carregarClientes(usuario.id)
        await carregarParcelas(usuario.id)
        return
      }
    }

    setMensagem('Cliente cadastrado com sucesso.')

    setNomeCompleto('')
    setEndereco('')
    setCpf('')
    setDataNascimento('')
    setDescricaoCaso('')
    setDataAcao('')
    setDeadline('')
    setValorCausa('')
    setTemHonorarios(false)
    setValorHonorarios('')
    setHonorariosParcelados(false)
    setQuantidadeParcelas('')

    await carregarClientes(usuario.id)
    await carregarParcelas(usuario.id)

    setAbaAtiva('consulta')
  } catch (error) {
    console.error(error)
    setMensagem('Ocorreu um erro inesperado ao salvar o cliente.')
  } finally {
    setCarregando(false)
  }
}

  function limparFiltros() {
    setBuscaNome('')
    setFiltroDeadline('')
    setFiltroHonorarios('')
    setDataInicial('')
    setDataFinal('')
  }

  const deadlinesVencidas = useMemo(() => {
    return clientes
      .filter(
        (cliente) =>
          cliente.deadline &&
          !cliente.deadline_finalizada &&
          diferencaDias(cliente.deadline) < 0
      )
      .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
  }, [clientes])

  const deadlinesProximas = useMemo(() => {
    return clientes
      .filter((cliente) => {
        if (!cliente.deadline || cliente.deadline_finalizada) return false
        const dias = diferencaDias(cliente.deadline)
        return dias >= 0 && dias <= 7
      })
      .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
  }, [clientes])

  const parcelasVencidas = useMemo(() => {
    return parcelas.filter((parcela) => {
      const dias = diferencaDias(parcela.data_vencimento)
      return parcela.status !== 'pago' && dias < 0
    })
  }, [parcelas])

  const parcelasProximas = useMemo(() => {
    return parcelas.filter((parcela) => {
      const dias = diferencaDias(parcela.data_vencimento)
      return parcela.status !== 'pago' && dias >= 0 && dias <= 7
    })
  }, [parcelas])

const clientesFiltrados = useMemo(() => {
  const filtrados = clientes.filter((cliente) => {
    const nomeOk =
      !buscaNome ||
      cliente.nome_completo.toLowerCase().includes(buscaNome.toLowerCase())

    let deadlineOk = true
    if (filtroDeadline === 'vencida') {
      deadlineOk =
        !!cliente.deadline &&
        !cliente.deadline_finalizada &&
        diferencaDias(cliente.deadline) < 0
    } else if (filtroDeadline === 'proxima') {
      deadlineOk =
        !!cliente.deadline &&
        !cliente.deadline_finalizada &&
        diferencaDias(cliente.deadline) >= 0 &&
        diferencaDias(cliente.deadline) <= 7
    } else if (filtroDeadline === 'finalizada') {
      deadlineOk = cliente.deadline_finalizada
    } else if (filtroDeadline === 'sem_deadline') {
      deadlineOk = !cliente.deadline
    }

    let dataOk = true
    if (dataInicial || dataFinal) {
      const dataBase = cliente.deadline || cliente.data_acao
      if (!dataBase) {
        dataOk = false
      } else {
        if (dataInicial && dataBase < dataInicial) dataOk = false
        if (dataFinal && dataBase > dataFinal) dataOk = false
      }
    }

    let honorariosOk = true
    if (filtroHonorarios === 'sem_honorarios') {
      honorariosOk = !cliente.tem_honorarios
    } else if (filtroHonorarios) {
      const parcelasDoCliente = parcelas.filter((p) => p.cliente_id === cliente.id)

      if (filtroHonorarios === 'vencido') {
        honorariosOk = parcelasDoCliente.some(
          (p) => p.status !== 'pago' && diferencaDias(p.data_vencimento) < 0
        )
      } else if (filtroHonorarios === 'proximo') {
        honorariosOk = parcelasDoCliente.some(
          (p) =>
            p.status !== 'pago' &&
            diferencaDias(p.data_vencimento) >= 0 &&
            diferencaDias(p.data_vencimento) <= 7
        )
      } else if (filtroHonorarios === 'pago') {
        honorariosOk =
          parcelasDoCliente.length > 0 &&
          parcelasDoCliente.every((p) => p.status === 'pago')
      }
    }

    return nomeOk && deadlineOk && dataOk && honorariosOk
  })

  return filtrados.sort((a, b) =>
    a.nome_completo.localeCompare(b.nome_completo, 'pt-BR', {
      sensitivity: 'base',
    })
  )
}, [
  clientes,
  parcelas,
  buscaNome,
  filtroDeadline,
  filtroHonorarios,
  dataInicial,
  dataFinal,
])

  const deadlinesVencidasFiltradas = useMemo(() => {
    const ids = new Set(clientesFiltrados.map((c) => c.id))
    return deadlinesVencidas.filter((cliente) => ids.has(cliente.id))
  }, [clientesFiltrados, deadlinesVencidas])

  const deadlinesProximasFiltradas = useMemo(() => {
    const ids = new Set(clientesFiltrados.map((c) => c.id))
    return deadlinesProximas.filter((cliente) => ids.has(cliente.id))
  }, [clientesFiltrados, deadlinesProximas])

  const parcelasVencidasFiltradas = useMemo(() => {
    const ids = new Set(clientesFiltrados.map((c) => c.id))
    return parcelasVencidas.filter((parcela) => ids.has(parcela.cliente_id))
  }, [clientesFiltrados, parcelasVencidas])

  const parcelasProximasFiltradas = useMemo(() => {
    const ids = new Set(clientesFiltrados.map((c) => c.id))
    return parcelasProximas.filter((parcela) => ids.has(parcela.cliente_id))
  }, [clientesFiltrados, parcelasProximas])

  function renderConteudoAba() {
    if (abaAtiva === 'dashboard') {
  return (
  <div className="space-y-6">
    <FiltrosBusca
      buscaNome={buscaNome}
      setBuscaNome={setBuscaNome}
      filtroDeadline={filtroDeadline}
      setFiltroDeadline={setFiltroDeadline}
      filtroHonorarios={filtroHonorarios}
      setFiltroHonorarios={setFiltroHonorarios}
      dataInicial={dataInicial}
      setDataInicial={setDataInicial}
      dataFinal={dataFinal}
      setDataFinal={setDataFinal}
      onLimparFiltros={limparFiltros}
    />

    <DashboardCards
      deadlinesVencidas={deadlinesVencidasFiltradas.length}
      deadlinesProximas={deadlinesProximasFiltradas.length}
      honorariosVencidos={parcelasVencidasFiltradas.length}
      honorariosProximos={parcelasProximasFiltradas.length}
    />

    <div className="grid lg:grid-cols-2 gap-6">
      <DeadlinesAlert
        deadlinesVencidas={deadlinesVencidasFiltradas}
        deadlinesProximas={deadlinesProximasFiltradas}
        onFinalizarDeadline={finalizarDeadline}
      />

      <HonorariosAlert
        parcelasVencidas={parcelasVencidasFiltradas}
        parcelasProximas={parcelasProximasFiltradas}
        onMarcarComoPaga={marcarParcelaComoPaga}
      />
    </div>

    <ClientesList
      clientes={clientesFiltrados}
      onFinalizarDeadline={finalizarDeadline}
      onReabrirDeadline={reabrirDeadline}
    />
  </div>
)
    }

    if (abaAtiva === 'cadastro') {
      return (
        <ClienteForm
          carregando={carregando}
          mensagem={mensagem}
          nomeCompleto={nomeCompleto}
          setNomeCompleto={setNomeCompleto}
          endereco={endereco}
          setEndereco={setEndereco}
          cpf={cpf}
          setCpf={setCpf}
          dataNascimento={dataNascimento}
          setDataNascimento={setDataNascimento}
          descricaoCaso={descricaoCaso}
          setDescricaoCaso={setDescricaoCaso}
          dataAcao={dataAcao}
          setDataAcao={setDataAcao}
          deadline={deadline}
          setDeadline={setDeadline}
          valorCausa={valorCausa}
          setValorCausa={setValorCausa}
          temHonorarios={temHonorarios}
          setTemHonorarios={setTemHonorarios}
          valorHonorarios={valorHonorarios}
          setValorHonorarios={setValorHonorarios}
          honorariosParcelados={honorariosParcelados}
          setHonorariosParcelados={setHonorariosParcelados}
          quantidadeParcelas={quantidadeParcelas}
          setQuantidadeParcelas={setQuantidadeParcelas}
          onSubmit={salvarCliente}
        />
      )
    }

    return (
      <div className="space-y-6">
        <FiltrosBusca
          buscaNome={buscaNome}
          setBuscaNome={setBuscaNome}
          filtroDeadline={filtroDeadline}
          setFiltroDeadline={setFiltroDeadline}
          filtroHonorarios={filtroHonorarios}
          setFiltroHonorarios={setFiltroHonorarios}
          dataInicial={dataInicial}
          setDataInicial={setDataInicial}
          dataFinal={dataFinal}
          setDataFinal={setDataFinal}
          onLimparFiltros={limparFiltros}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <DashboardCards
              deadlinesVencidas={deadlinesVencidasFiltradas.length}
              deadlinesProximas={deadlinesProximasFiltradas.length}
              honorariosVencidos={parcelasVencidasFiltradas.length}
              honorariosProximos={parcelasProximasFiltradas.length}
            />

            <DeadlinesAlert
              deadlinesVencidas={deadlinesVencidasFiltradas}
              deadlinesProximas={deadlinesProximasFiltradas}
              onFinalizarDeadline={finalizarDeadline}
            />

            <HonorariosAlert
              parcelasVencidas={parcelasVencidasFiltradas}
              parcelasProximas={parcelasProximasFiltradas}
              onMarcarComoPaga={marcarParcelaComoPaga}
            />
          </div>

          <ClientesList
            clientes={clientesFiltrados}
            onFinalizarDeadline={finalizarDeadline}
            onReabrirDeadline={reabrirDeadline}
          />
        </div>
      </div>
    )
  }

  if (usuario) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Sistema do Escritório</h1>
              <p className="text-gray-600 mt-1">Usuário logado: {usuario.email}</p>
            </div>

            <button
              type="button"
              onClick={sair}
              className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
            >
              Sair
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAbaAtiva('dashboard')}
                className={`px-4 py-2 rounded-xl font-medium ${
                  abaAtiva === 'dashboard'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('cadastro')}
                className={`px-4 py-2 rounded-xl font-medium ${
                  abaAtiva === 'cadastro'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Cadastro de clientes
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('consulta')}
                className={`px-4 py-2 rounded-xl font-medium ${
                  abaAtiva === 'consulta'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Consulta de clientes
              </button>
            </div>
          </div>

          {renderConteudoAba()}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Sistema do Escritório
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Faça login para acessar seu painel
        </p>

        <form onSubmit={fazerLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-black text-white rounded-lg py-2 font-medium hover:opacity-90 transition"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button
          type="button"
          onClick={criarContaTeste}
          disabled={carregando}
          className="w-full mt-3 border border-black rounded-lg py-2 font-medium hover:bg-gray-50 transition"
        >
          Criar conta
        </button>

        {mensagem && (
          <p className="mt-4 text-sm text-center text-gray-700">{mensagem}</p>
        )}
      </div>
    </main>
  )
}