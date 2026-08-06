'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { createCustomField, deleteCustomField, updateCustomFieldsOrder } from '@/src/app/actions/kanban'

type CustomField = { id: string; field_key: string; field_label: string; field_type: string; position: number }

export default function FormBuilderClient({ initialFields }: { initialFields: CustomField[] }) {
  const [fields, setFields] = useState<CustomField[]>(initialFields)
  const [loading, setLoading] = useState(false)

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFields(items)

    const orderedIds = items.map(item => item.id)
    await updateCustomFieldsOrder(orderedIds)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Adicionar Novo Campo</h3>
          <p className="text-sm text-gray-500 mb-4">Crie campos personalizados para o seu nicho.</p>
          
          <form action={async (formData) => {
            setLoading(true)
            await createCustomField(formData)
            window.location.reload()
          }} className="flex flex-col sm:flex-row gap-3">
            <input 
              name="fieldLabel" 
              type="text" 
              required
              placeholder="Ex: Limite de Gasto"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
            <select 
              name="fieldType"
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Texto Curto</option>
              <option value="number">Número (Simples)</option>
              <option value="money">Dinheiro (R$)</option>
              <option value="date">Data</option>
            </select>
            <button 
              type="submit" disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Adicionar
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Campos do Modal</h3>
          <p className="text-sm text-gray-500 mb-4">Arraste para reordenar. Estes campos aparecem abaixo de E-mail.</p>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="custom-fields-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 min-h-[200px]">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3 opacity-60 cursor-not-allowed">
                    <span className="text-gray-400">🔒</span>
                    <span className="text-sm font-medium text-gray-700 flex-1">Nome do Cliente *</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3 opacity-60 cursor-not-allowed">
                    <span className="text-gray-400">🔒</span>
                    <span className="text-sm font-medium text-gray-700 flex-1">Telefone / WhatsApp *</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3 opacity-60 cursor-not-allowed">
                    <span className="text-gray-400">🔒</span>
                    <span className="text-sm font-medium text-gray-700 flex-1">E-mail (Opcional)</span>
                  </div>

                  {fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 bg-white border rounded-xl flex items-center gap-3 shadow-sm transition-all ${
                            snapshot.isDragging ? 'shadow-lg border-blue-400 scale-105' : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <span className="text-gray-400 cursor-grab active:cursor-grabbing">↕️</span>
                          <div className="flex-1">
                            <span className="text-sm font-bold text-gray-800">{field.field_label}</span>
                            <span className="ml-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                              {field.field_type === 'money' ? 'dinheiro' : field.field_type}
                            </span>
                          </div>
                          <form action={async () => {
                            await deleteCustomField(field.id)
                            setFields(fields.filter(f => f.id !== field.id))
                          }}>
                            <button type="submit" className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Excluir Campo">
                              🗑️
                            </button>
                          </form>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      <div className="bg-gray-100 rounded-3xl p-6 md:p-10 flex items-start justify-center overflow-y-auto border-4 border-dashed border-gray-200">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-100 pointer-events-none">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Prévia do Modal</h3>
            <p className="text-xs text-gray-500 mt-0.5">Assim ficará o modal para a sua equipe.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Cliente *</label>
              <div className="w-full h-10 border border-gray-200 rounded-xl bg-gray-50"></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone / WhatsApp *</label>
              <div className="w-full h-10 border border-gray-200 rounded-xl bg-gray-50"></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail (Opcional)</label>
              <div className="w-full h-10 border border-gray-200 rounded-xl bg-gray-50"></div>
            </div>

            {fields.map((field) => (
              <div key={field.id} className="animate-fade-in">
                <label className="block text-sm font-semibold text-blue-700 mb-1.5">{field.field_label}</label>
                <div className="w-full h-10 border-2 border-blue-100 border-dashed rounded-xl bg-blue-50/30 flex items-center px-3">
                  <span className="text-xs text-blue-300 italic font-medium">
                    {field.field_type === 'money' ? 'Campo formatado: Dinheiro (R$)' : `Campo tipo: ${field.field_type}`}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <div className="w-24 h-10 rounded-xl bg-gray-100"></div>
              <div className="w-28 h-10 rounded-xl bg-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}