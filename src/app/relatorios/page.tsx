'use client'

import Link from 'next/link'
import ExcelJS from 'exceljs'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatarMoeda } from '@/lib/utils'

function baixarArquivo(blob: Blob, nomeArquivo: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function formatarDataHoraLocal(dataIso: string | null | undefined) {
  if (!dataIso) return ''
  return new Date(dataIso).toLocaleString('pt-BR')
}

function formatarDataLocal(dataIso: string | null | undefined) {
  if (!dataIso) return ''
  return new Date(dataIso + 'T12:00:00').toLocaleDateString('pt-BR')
}

function extrairNomeCliente(cliente: any) {
  if (!cliente) return 'Cliente'

  if (Array.isArray(cliente)) {
    return cliente[0]?.nome_completo || 'Cliente'
  }

  return cliente.nome_completo || 'Cliente'
}

export default function RelatoriosPage() {
  const [dataInicialClientes, setDataInicialClientes] = useState('')
  const [dataFinalClientes, setDataFinalClientes] = useState('')

  const [dataInicialFinanceiro, setDataInicialFinanceiro] = useState('')
  const [dataFinalFinanceiro, setDataFinalFinanceiro] = useState('')

  const [gerandoClientes, setGerandoClientes] = useState(false)
  const [gerandoFinanceiro, setGerandoFinanceiro] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function gerarRelatorioNovosClientes() {
    if (!dataInicialClientes || !dataFinalClientes) {
      setMensagem('Informe a data inicial e final do relatório de novos clientes.')
      return
    }

    setGerandoClientes(true)
    setMensagem('')

    try {
      const inicio = `${dataInicialClientes}T00:00:00`
      const fim = `${dataFinalClientes}T23:59:59`

      const { data, error } = await supabase
        .from('clientes')
        .select('nome_completo, created_at, valor_causa')
        .gte('created_at', inicio)
        .lte('created_at', fim)
        .order('created_at', { ascending: false })

      if (error) {
        setMensagem('Erro ao gerar relatório de novos clientes: ' + error.message)
        return
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Novos Clientes')

      worksheet.columns = [
        { header: 'Nome completo', key: 'nome', width: 40 },
        { header: 'Data de cadastramento', key: 'data_cadastro', width: 24 },
        { header: 'Valor da ação', key: 'valor_acao', width: 20 },
      ]

      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      }

      ;(data || []).forEach((cliente) => {
        worksheet.addRow({
          nome: cliente.nome_completo || '',
          data_cadastro: formatarDataHoraLocal(cliente.created_at),
          valor_acao: formatarMoeda(cliente.valor_causa ?? 0),
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      baixarArquivo(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `relatorio-novos-clientes-${dataInicialClientes}-a-${dataFinalClientes}.xlsx`
      )

      setMensagem('Relatório de novos clientes gerado com sucesso.')
    } catch (error) {
      console.error(error)
      setMensagem('Erro inesperado ao gerar relatório de novos clientes.')
    } finally {
      setGerandoClientes(false)
    }
  }

  async function gerarRelatorioFinanceiro() {
    if (!dataInicialFinanceiro || !dataFinalFinanceiro) {
      setMensagem('Informe a data inicial e final do relatório financeiro.')
      return
    }

    setGerandoFinanceiro(true)
    setMensagem('')

    try {
      const { data, error } = await supabase
        .from('parcelas_honorarios')
        .select(`
          id,
          cliente_id,
          data_vencimento,
          data_pagamento,
          status,
          clientes!inner(nome_completo)
        `)
        .gte('data_vencimento', dataInicialFinanceiro)
        .lte('data_vencimento', dataFinalFinanceiro)
        .order('data_vencimento', { ascending: true })

      if (error) {
        setMensagem('Erro ao gerar relatório financeiro: ' + error.message)
        return
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Relatório Financeiro')

      worksheet.columns = [
        { header: 'Nome completo', key: 'nome', width: 40 },
        { header: 'Data de vencimento da parcela', key: 'vencimento', width: 26 },
        { header: 'Data de pagamento', key: 'pagamento', width: 22 },
      ]

      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      }

      ;(data || []).forEach((parcela: any) => {
        const pago = parcela.status === 'pago'
        const nomeCliente = extrairNomeCliente(parcela.clientes)

        const row = worksheet.addRow({
          nome: nomeCliente,
          vencimento: formatarDataLocal(parcela.data_vencimento),
          pagamento: pago
            ? formatarDataLocal(parcela.data_pagamento)
            : 'NÃO PAGO',
        })

        const corLinha = pago ? 'FFC6EFCE' : 'FFFFC7CE'
        const corFonte = pago ? 'FF006100' : 'FF9C0006'

        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: corLinha },
          }
          cell.font = {
            color: { argb: corFonte },
          }
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      baixarArquivo(
        new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `relatorio-financeiro-${dataInicialFinanceiro}-a-${dataFinalFinanceiro}.xlsx`
      )

      setMensagem('Relatório financeiro gerado com sucesso.')
    } catch (error) {
      console.error(error)
      setMensagem('Erro inesperado ao gerar relatório financeiro.')
    } finally {
      setGerandoFinanceiro(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-gray-600 mt-1">
              Gere relatórios de clientes e financeiro em Excel
            </p>
          </div>

          <Link
            href="/"
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Voltar
          </Link>
        </div>

        {mensagem && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-700">{mensagem}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold">Relatório de novos clientes</h2>
            <p className="text-sm text-gray-600">
              Filtra por data de cadastramento dos clientes.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data inicial</label>
                <input
                  type="date"
                  value={dataInicialClientes}
                  onChange={(e) => setDataInicialClientes(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data final</label>
                <input
                  type="date"
                  value={dataFinalClientes}
                  onChange={(e) => setDataFinalClientes(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={gerarRelatorioNovosClientes}
              disabled={gerandoClientes}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              {gerandoClientes ? 'Gerando...' : 'Gerar relatório de novos clientes'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold">Relatório financeiro</h2>
            <p className="text-sm text-gray-600">
              Filtra por data de vencimento das parcelas.
              Pagos ficam em verde e não pagos em vermelho.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data inicial</label>
                <input
                  type="date"
                  value={dataInicialFinanceiro}
                  onChange={(e) => setDataInicialFinanceiro(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data final</label>
                <input
                  type="date"
                  value={dataFinalFinanceiro}
                  onChange={(e) => setDataFinalFinanceiro(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={gerarRelatorioFinanceiro}
              disabled={gerandoFinanceiro}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              {gerandoFinanceiro ? 'Gerando...' : 'Gerar relatório financeiro'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}