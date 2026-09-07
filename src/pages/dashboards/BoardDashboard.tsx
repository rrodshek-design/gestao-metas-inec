import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Settings2, 
  Users, 
  CalendarOff, 
  MapPin,
  Save,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';

const data = [
  { name: 'Polo A', atingimento: 85, entregas: 120 },
  { name: 'Polo B', atingimento: 92, entregas: 150 },
  { name: 'Polo C', atingimento: 78, entregas: 90 },
  { name: 'Polo D', atingimento: 95, entregas: 200 },
  { name: 'Polo E', atingimento: 88, entregas: 110 },
];

export default function BoardDashboard() {
  const [activeTab, setActiveTab] = useState<'vision' | 'adjust'>('vision');
  const [units, setUnits] = useState(
    Array.from({ length: 20 }, (_, i) => ({ id: `${i+1}`, name: `Unidade ${i+1}`, coordinator: `Coord ${i+1}`, status: 'active' }))
  );

  const updateUnitName = (id: string, name: string) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, name } : u));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Diretoria Executiva</h2>
          <p className="text-sm text-slate-400">Visão estratégica e ajustes globais do sistema</p>
        </div>
        <div className="flex bg-[#1e293b] p-1 rounded-xl border border-slate-800 shadow-xl">
          <button 
            onClick={() => setActiveTab('vision')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-xs uppercase tracking-widest",
              activeTab === 'vision' ? "bg-sky-600 text-white shadow-lg shadow-sky-900/20" : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <TrendingUp size={16} />
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('adjust')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-xs uppercase tracking-widest",
              activeTab === 'adjust' ? "bg-sky-600 text-white shadow-lg shadow-sky-900/20" : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <Settings2 size={16} />
            Unidades
          </button>
        </div>
      </header>

      {activeTab === 'vision' ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Main Chart */}
          <div className="col-span-12 lg:col-span-8 bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-sm transition-all hover:border-slate-700">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Atingimento de Metas por Polo (%)</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">ATUALIZADO</span>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="atingimento" radius={[6, 6, 0, 0]} barSize={32}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.atingimento > 90 ? '#10b981' : '#0ea5e9'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Bento Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-6">Evolução Semanal</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155'}} />
                    <Line type="monotone" dataKey="entregas" stroke="#6366f1" strokeWidth={3} dot={{fill: '#6366f1', r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-violet-700/20 border border-indigo-500/30 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-4">Consolidado Regional</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="text-indigo-400" size={18} />
                    <span className="text-xs font-medium text-slate-300">Colaboradores</span>
                  </div>
                  <span className="text-lg font-bold text-white">147</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarOff className="text-orange-400" size={18} />
                    <span className="text-xs font-medium text-slate-300">Em Férias</span>
                  </div>
                  <span className="text-lg font-bold text-white">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-emerald-400" size={18} />
                    <span className="text-xs font-medium text-slate-300">Unidades Ativas</span>
                  </div>
                  <span className="text-lg font-bold text-white">20/20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Unit List & Renaming */}
          <div className="col-span-12 lg:col-span-8 bg-[#1e293b] rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/20 sticky top-0 z-10">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Gerenciar Unidades</h3>
              <button className="bg-sky-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-sky-900/20 hover:bg-sky-500 transition-all flex items-center gap-2">
                <Save size={14} /> Salvar Alterações
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-4 overflow-y-auto custom-scrollbar">
              {units.map((unit) => (
                <div key={unit.id} className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/50 space-y-3 group hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ID: #{unit.id}</span>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase px-1.5 py-0.5 bg-emerald-500/10 rounded">Online</span>
                  </div>
                  <input 
                    type="text" 
                    value={unit.name}
                    onChange={(e) => updateUnitName(unit.id, e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-700 px-3 py-2 rounded-lg text-xs font-bold text-white focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  />
                  <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase">
                    <Users size={12} className="text-slate-600" />
                    Responsável: {unit.coordinator}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vacation & Redistribution */}
          <div className="col-span-12 lg:col-span-4 bg-[#1e293b] p-8 rounded-xl border border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <ArrowRightLeft size={20} className="text-orange-500" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Redistribuição</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">Maneje unidades de coordenadores em férias ou bloqueados temporariamente.</p>
            
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">De (Ausente)</label>
                <select className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-sky-500 transition-all">
                  <option>João Silva (Unidade 05)</option>
                  <option>Maria Oliveira (Unidade 12)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Para (Responsável)</label>
                <select className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-sky-500 transition-all">
                  <option>Carlos Santos (Unidade 04)</option>
                  <option>Ana Costa (Unidade 06)</option>
                </select>
              </div>

              <button className="w-full py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-white transition-all shadow-xl shadow-white/5 text-sm uppercase tracking-tighter">
                Efetivar Mudança
              </button>
            </div>

            <div className="mt-8 p-4 bg-sky-950/30 rounded-xl border border-sky-800/30">
              <p className="text-[10px] text-sky-400 font-bold leading-relaxed uppercase tracking-tight">
                * Os ajustes de redistribuição refletem instantaneamente no dashboard dos coordenadores envolvidos via Supabase.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
