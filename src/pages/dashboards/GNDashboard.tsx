import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { 
  Building, 
  MapPin, 
  Users, 
  TrendingUp,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function GNDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Gerência de Negócios</h2>
          <p className="text-sm text-slate-400">Polo: <span className="text-sky-400 font-bold tracking-widest">{profile?.polo_id || 'Alfa'}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">Performance: Alta</span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4 bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between h-[160px] group hover:border-sky-500/50 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unidades no Polo</p>
            <div className="p-2 bg-sky-500/10 rounded-lg group-hover:bg-sky-500/20 transition-colors">
              <Building size={18} className="text-sky-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white tracking-tighter">8</p>
        </div>

        <div className="col-span-12 md:col-span-4 bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between h-[160px] group hover:border-indigo-500/50 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coordenadores</p>
            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
              <Users size={18} className="text-indigo-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white tracking-tighter">8</p>
        </div>

        <div className="col-span-12 md:col-span-4 bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between h-[160px] group hover:border-emerald-500/50 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Taxa de Resposta</p>
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <ShieldCheck size={18} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-emerald-500 tracking-tighter">100%</p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">Monitoramento das Unidades</h3>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          </div>
        </div>
        <div className="divide-y divide-slate-800/50">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center justify-between p-8 hover:bg-slate-800/30 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-[#0f172a] text-sky-500 rounded-2xl border border-slate-700 flex items-center justify-center shadow-lg group-hover:border-sky-500/30 transition-all">
                  <Building size={24} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">Unidade Polo {i < 10 ? `0${i}` : i}</p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                    <span className="flex items-center gap-2"><MapPin size={12} className="text-slate-600" /> Setor {i}</span>
                    <span className="flex items-center gap-2"><Users size={12} className="text-slate-600" /> 12 Agentes Ativos</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-right hidden md:block">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm justify-end mb-1">
                    <TrendingUp size={16} />
                    +12%
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Performance Semanal</p>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg text-slate-600 group-hover:text-sky-500 group-hover:bg-sky-500/10 transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
