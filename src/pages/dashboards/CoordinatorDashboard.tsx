import React, { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function CoordinatorDashboard() {
  const { profile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const questions = [
    { id: '1', text: 'Qual a meta de vendas para esta semana?', type: 'number', min: 10 },
    { id: '2', text: 'Quantas visitas técnicas estão programadas?', type: 'number', min: 5 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In real app, save to Supabase
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Metas Enviadas!</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Suas respostas foram registradas com sucesso e já estão disponíveis para análise da coordenação regional.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-all"
        >
          Editar Respostas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Preenchimento de Metas</h2>
        <p className="text-sm text-slate-400">Unidade: <span className="text-sky-400 font-bold">{profile?.unit_id || 'Unidade 01'}</span> | Semana 36</p>
      </header>

      <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl flex gap-4 text-sky-400 items-center">
        <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse shrink-0"></div>
        <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
          Atenção: Atingir o mínimo de entregas é obrigatório para validação.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-xl space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-[#0f172a] text-sky-500 border border-slate-700 rounded-lg flex items-center justify-center font-bold text-xs">
                {idx + 1}
              </span>
              <label className="text-sm font-bold text-white uppercase tracking-tight">{q.text}</label>
            </div>
            
            <div className="relative group">
              <input 
                type={q.type}
                required
                min={q.min}
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder={`Ex: Mínimo esperado ${q.min}`}
                className="w-full px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-xl focus:border-sky-500 outline-none text-xl font-bold text-white transition-all placeholder:text-slate-700 group-hover:border-slate-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-sky-500/50 transition-colors">
                <HelpCircle size={20} />
              </div>
            </div>
            {Number(answers[q.id]) < (q.min || 0) && answers[q.id] !== '' && (
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest pl-11 flex items-center gap-2">
                <AlertCircle size={12} /> Abaixo do mínimo ({q.min})
              </p>
            )}
          </div>
        ))}

        <button 
          type="submit"
          className="w-full py-4 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-900/30 hover:bg-sky-500 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter text-sm"
        >
          <ClipboardCheck size={20} />
          Efetivar Entrega de Metas
        </button>
      </form>
    </div>
  );
}
