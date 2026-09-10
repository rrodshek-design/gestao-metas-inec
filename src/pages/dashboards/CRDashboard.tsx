import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { 
  Plus, 
  FileDown, 
  Send, 
  ClipboardCheck, 
  ChevronRight,
  Building2,
  Trash2,
  DatabaseZap
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { carregarPlanilha, PlanilhaLinha } from '../../lib/planilha';

export default function CRDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'reports'>('create');
  const [questions, setQuestions] = useState([
    { id: '1', text: 'Qual a meta de vendas para esta semana?', type: 'number', min: 10 },
    { id: '2', text: 'Quantas visitas técnicas estão programadas?', type: 'number', min: 5 }
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [minDelivery, setMinDelivery] = useState(0);
  const [sheetRows, setSheetRows] = useState<PlanilhaLinha[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  useEffect(() => {
    const loadSheet = async () => {
      setSheetLoading(true);
      setSheetError(null);
      try {
        const data = await carregarPlanilha();
        setSheetRows(data);
      } catch (error: any) {
        setSheetError(error.message || 'Não foi possível carregar a planilha.');
      } finally {
        setSheetLoading(false);
      }
    };

    loadSheet();
  }, []);

  const totalUnidades = new Set(sheetRows.map((row) => row.unidade).filter(Boolean)).size;
  const respondidas = sheetRows.filter((row) => row.meta && row.status && row.status.toLowerCase() !== 'pendente').length;
  const pendentes = sheetRows.filter((row) => !row.meta || row.status?.toLowerCase() === 'pendente').length;
  const entregues = sheetRows.filter((row) => row.status?.toLowerCase() === 'entregue').length;
  const taxaResposta = totalUnidades > 0 ? Math.round((respondidas / Math.max(totalUnidades, 1)) * 100) : 0;

  const addQuestion = () => {
    if (!newQuestion) return;
    setQuestions([...questions, { 
      id: Math.random().toString(), 
      text: newQuestion, 
      type: 'number', 
      min: minDelivery 
    }]);
    setNewQuestion('');
    setMinDelivery(0);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatório Consolidado de Metas', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Polo: ${profile?.polo_id || 'Polo A'}`, 14, 30);
    doc.text(`Emitido em: ${new Date().toLocaleDateString()}`, 14, 35);

    const tableData = [
      ['Unidade', 'Meta Vendas', 'Visitas', 'Status'],
      ['Unidade 01', '12', '8', 'Entregue'],
      ['Unidade 02', '10', '4', 'Pendente'],
      ['Unidade 03', '15', '10', 'Entregue'],
    ];

    (doc as any).autoTable({
      startY: 45,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillStyle: [37, 99, 235] }
    });

    doc.save('relatorio-metas-regional.pdf');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Coordenação Regional</h2>
          <p className="text-sm text-slate-400">Gestão de metas e acompanhamento de polos</p>
        </div>
        <div className="flex bg-[#1e293b] p-1 rounded-xl border border-slate-800 shadow-xl">
          <button 
            onClick={() => setActiveTab('create')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold transition-all text-xs uppercase tracking-widest flex items-center gap-2",
              activeTab === 'create' ? "bg-sky-600 text-white shadow-lg shadow-sky-900/20" : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <Plus size={16} />
            Criar Metas
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold transition-all text-xs uppercase tracking-widest flex items-center gap-2",
              activeTab === 'reports' ? "bg-sky-600 text-white shadow-lg shadow-sky-900/20" : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <FileDown size={16} />
            Relatórios
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'create' ? (
          <motion.div 
            key="create"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-12 gap-6"
          >
            {/* Question Builder */}
            <div className="col-span-12 lg:col-span-7 bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-sm space-y-8 flex flex-col h-[650px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 rounded-lg">
                    <Plus size={20} className="text-sky-500" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Novo Formulário Dinâmico</h3>
                </div>
                <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500 uppercase font-bold tracking-widest">Builder v1.0</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-6 rounded-xl border border-slate-800/50">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Título da Pergunta</label>
                  <input 
                    type="text" 
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ex: Qual a meta de atendimentos?"
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-sky-500 outline-none text-xs text-white transition-all font-bold"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mínimo de Entrega</label>
                  <input 
                    type="number" 
                    value={minDelivery}
                    onChange={(e) => setMinDelivery(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-sky-500 outline-none text-xs text-white transition-all font-bold"
                  />
                </div>
                <button 
                  onClick={addQuestion}
                  className="col-span-2 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-500 transition-all shadow-lg shadow-sky-900/20 uppercase tracking-tighter text-xs"
                >
                  Adicionar ao Painel de Criação
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
                  Perguntas Ativas ({questions.length})
                </h4>
                <div className="space-y-3 pr-2">
                  {questions.map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-800/50 group hover:border-slate-700 transition-all">
                      <div>
                        <p className="text-xs font-bold text-white mb-1">{q.text}</p>
                        <div className="flex gap-4">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Tipo: Numérico</span>
                          <span className="text-[9px] text-sky-500 uppercase font-bold tracking-widest">Mínimo: {q.min}</span>
                        </div>
                      </div>
                      <button onClick={() => removeQuestion(q.id)} className="text-slate-600 hover:text-rose-500 p-2 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Units */}
            <div className="col-span-12 lg:col-span-5 bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-col h-[650px]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Building2 size={20} className="text-indigo-500" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Unidades do Polo</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-900/30 hover:bg-slate-800/50 rounded-xl transition-all border border-slate-800/50 hover:border-slate-700 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs">
                        U{i < 10 ? `0${i}` : i}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">Unidade Regional {i}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Coord: João Silva</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-700 group-hover:text-sky-500 transition-colors" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all uppercase tracking-tighter text-sm">
                <Send size={18} />
                Disparar Metas p/ Polo
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-[#1e293b] p-8 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 rounded-lg">
                    <ClipboardCheck size={20} className="text-sky-500" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Consolidado Regional de Entregas</h3>
                </div>
                <button 
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold hover:bg-white transition-all shadow-xl shadow-white/5 uppercase tracking-tighter"
                >
                  <FileDown size={16} />
                  Baixar PDF
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Respondidos</p>
                  <p className="text-2xl font-bold text-white">{respondidas}/{Math.max(totalUnidades, 1)}</p>
                </div>
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Taxa de Resposta</p>
                  <p className="text-2xl font-bold text-emerald-500">{taxaResposta}%</p>
                </div>
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pendentes</p>
                  <p className="text-2xl font-bold text-rose-500">{pendentes}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-sky-600/20 to-indigo-600/20 rounded-xl border border-sky-500/20 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Entregues</p>
                  <p className="text-2xl font-bold text-white">{entregues}</p>
                </div>
              </div>

              {sheetError && (
                <div className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300">
                  {sheetError}
                </div>
              )}

              {sheetLoading ? (
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <DatabaseZap size={16} className="animate-pulse text-sky-400" />
                  Carregando planilha de metas...
                </div>
              ) : (
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Unidade</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-center">Semana</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-center">Meta</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-center">Prazo</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {sheetRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                            Nenhuma linha foi carregada. Cole a URL da planilha em VITE_METAS_SHEET_URL no .env.
                          </td>
                        </tr>
                      ) : (
                        sheetRows.map((row, idx) => (
                          <tr key={`${row.unidade}-${row.semana}-${idx}`} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-white">{row.unidade || 'Sem unidade'}</td>
                            <td className="px-6 py-4 text-slate-400 text-center font-mono">{row.semana || '--'}</td>
                            <td className="px-6 py-4 text-slate-400 text-center font-mono">{row.meta || 'Sem resposta'}</td>
                            <td className="px-6 py-4 text-slate-400 text-center font-mono">{row.prazo || '--'}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-bold tracking-tighter uppercase",
                                (row.status || '').toLowerCase() === 'entregue'
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                              )}>
                                {(row.status || 'PENDENTE').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
