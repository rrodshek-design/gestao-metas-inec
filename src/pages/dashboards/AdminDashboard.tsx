import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { 
  Plus, 
  MessageSquare, 
  Users, 
  Settings
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Administração</h1>
        <p className="text-slate-500">Configuração de diretrizes e suporte regional</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button className="p-6 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 hover:scale-[1.02] transition-all text-left">
          <Plus className="mb-4" />
          <p className="font-bold text-lg">Novas Perguntas</p>
          <p className="text-blue-100 text-sm">Criar diretrizes para CRs</p>
        </button>
        <button className="p-6 bg-white border border-slate-100 text-slate-900 rounded-2xl shadow-sm hover:scale-[1.02] transition-all text-left">
          <MessageSquare className="mb-4 text-blue-600" />
          <p className="font-bold text-lg">Comunicados</p>
          <p className="text-slate-500 text-sm">Enviar avisos para o polo</p>
        </button>
        <button className="p-6 bg-white border border-slate-100 text-slate-900 rounded-2xl shadow-sm hover:scale-[1.02] transition-all text-left">
          <Users className="mb-4 text-blue-600" />
          <p className="font-bold text-lg">Gestão de CRs</p>
          <p className="text-slate-500 text-sm">3 acessos configurados</p>
        </button>
        <button className="p-6 bg-white border border-slate-100 text-slate-900 rounded-2xl shadow-sm hover:scale-[1.02] transition-all text-left">
          <Settings className="mb-4 text-blue-600" />
          <p className="font-bold text-lg">Configurações</p>
          <p className="text-slate-500 text-sm">Ajustes de sistema</p>
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Últimas Perguntas Criadas</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Meta de Qualidade Q{i}</p>
                <p className="text-xs text-slate-500">Criado em: 05/09/2026</p>
              </div>
              <span className="text-xs font-bold text-blue-600">ATIVO</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
