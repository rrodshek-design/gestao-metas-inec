import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { 
  User, 
  Phone, 
  IdCard, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function AgentDashboard() {
  const { profile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-br from-sky-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-sky-900/40 border border-sky-400/20 rotate-3">
          {profile?.name[0]}
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">{profile?.name}</h2>
          <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Agente de Unidade | ID: {profile?.enrollment}</p>
        </div>
      </header>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl p-10 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-3 uppercase tracking-tight">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="text-emerald-500" size={20} />
            </div>
            Credenciais do Sistema
          </h3>
          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">Seguro</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#0f172a] rounded-xl border border-slate-800 space-y-3 group hover:border-slate-700 transition-all">
            <div className="flex items-center gap-2 text-slate-500 group-hover:text-sky-500 transition-colors">
              <IdCard size={16} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Matrícula</span>
            </div>
            <p className="text-lg font-bold text-white">{profile?.enrollment}</p>
          </div>

          <div className="p-6 bg-[#0f172a] rounded-xl border border-slate-800 shadow-sm transition-all hover:border-slate-700 group space-y-3">
            <div className="flex items-center gap-2 text-slate-500 group-hover:text-sky-500 transition-colors">
              <Phone size={16} />
              <span className="text-[9px] font-bold uppercase tracking-widest">WhatsApp</span>
            </div>
            <p className="text-lg font-bold text-white">{profile?.whatsapp || 'Não informado'}</p>
          </div>

          <div className="p-6 bg-[#0f172a] rounded-xl border border-slate-800 shadow-sm transition-all hover:border-slate-700 group space-y-3">
            <div className="flex items-center gap-2 text-slate-500 group-hover:text-sky-500 transition-colors">
              <User size={16} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Identificação</span>
            </div>
            <p className="text-lg font-bold text-white">{profile?.name}</p>
          </div>

          <div className="p-6 bg-[#0f172a] rounded-xl border border-slate-800 shadow-sm transition-all hover:border-slate-700 group space-y-3">
            <div className="flex items-center gap-2 text-slate-500 group-hover:text-emerald-500 transition-colors">
              <Smartphone size={16} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Status de Conta</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              Verificado & Ativo
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Mudanças de dados devem ser solicitadas ao Coordenador Regional.
          </p>
        </div>
      </div>
    </div>
  );
}
