'use client'

import { useState } from 'react'

interface CurrencyInputProps {
  name: string
  defaultValue?: string | number
  placeholder?: string
  required?: boolean
  className?: string
}

export default function CurrencyInput({ name, defaultValue, placeholder = 'R$ 0,00', required, className }: CurrencyInputProps) {
  // Função para transformar qualquer string/numero no formato visual da Moeda (R$)
  const formatCurrency = (val: string | number) => {
    const numeric = String(val).replace(/\D/g, '')
    if (!numeric) return ''
    return (Number(numeric) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  // Prepara o valor inicial (se vier do banco de dados)
  const getInitialDisplay = () => {
    if (!defaultValue) return ''
    const numeric = Number(defaultValue)
    if (!isNaN(numeric)) {
       return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }
    return formatCurrency(defaultValue)
  }

  const [display, setDisplay] = useState(getInitialDisplay)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDisplay(formatCurrency(val))
  }

  // Extrai o valor real, puro e numérico que será enviado pelo formulário para o banco (ex: "1500.00")
  const rawValue = display ? (Number(display.replace(/\D/g, '')) / 100).toFixed(2) : ''

  return (
    <>
      <input
        type="text"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      {/* Input oculto que envia o valor puro para a Server Action não dar erro de cálculo */}
      <input type="hidden" name={name} value={rawValue} />
    </>
  )
}