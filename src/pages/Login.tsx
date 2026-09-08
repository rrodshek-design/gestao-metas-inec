import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';
import { Lock, User, AlertCircle, Info } from 'lucide-react';

export default function Login() {
  const [enrollment, setEnrollment] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('O sistema não está configurado. Use o modo demonstração abaixo.');
      return;
    }
    setLoading(true);
    setError(null);

    // Transform enrollment to dummy email for Supabase Auth
    const email = `${enrollment}@metas.com`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Matrícula ou senha inválida.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl p-10 border border-slate-800"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">META<span className="text-sky-500">FLOW</span></h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Acesse sua conta corporativa</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="mb-8 p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sky-400">
              <Info size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Modo de Demonstração</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              As chaves do Supabase não foram detectadas. Você pode explorar as interfaces usando os perfis abaixo:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => loginAsDemo('BOARD')}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[9px] font-bold text-white uppercase hover:border-sky-500 transition-all"
              >
                Diretoria
              </button>
              <button 
                onClick={() => loginAsDemo('CR')}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[9px] font-bold text-white uppercase hover:border-sky-500 transition-all"
              >
                Regional
              </button>
              <button 
                onClick={() => loginAsDemo('GN')}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[9px] font-bold text-white uppercase hover:border-sky-500 transition-all"
              >
                Gerência
              </button>
              <button 
                onClick={() => loginAsDemo('COORDINATOR')}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[9px] font-bold text-white uppercase hover:border-sky-500 transition-all"
              >
                Coordenador
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Matrícula ou login</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="text"
                required
                disabled={!isSupabaseConfigured}
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl focus:border-sky-500 outline-none text-white transition-all placeholder:text-slate-700 text-sm disabled:opacity-50"
                placeholder="Ex: 12345 ou digoslab"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Senha de Acesso</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="password"
                required
                disabled={!isSupabaseConfigured}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl focus:border-sky-500 outline-none text-white transition-all placeholder:text-slate-700 text-sm disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-900/30 transition-all disabled:opacity-50 uppercase tracking-widest text-xs mt-4"
          >
            {loading ? 'Validando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-tight">
            Novo por aqui? {' '}
            <button 
              onClick={() => navigate('/register')}
              disabled={!isSupabaseConfigured}
              className="text-sky-500 hover:text-sky-400 transition-colors disabled:opacity-50"
            >
              CRIE SEU ACESSO AGORA
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
