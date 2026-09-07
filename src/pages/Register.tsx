import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { User, Phone, IdCard, Lock, AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    enrollment: '',
    whatsapp: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError(null);

    const email = `${formData.enrollment}@metas.com`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            enrollment: formData.enrollment,
            whatsapp: formData.whatsapp,
            role: 'AGENT', // Default for public registration
            is_active: true
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          name: formData.name,
          enrollment: formData.enrollment,
          whatsapp: formData.whatsapp,
          role: 'AGENT',
          is_active: true
        });

        if (profileError) throw profileError;
      }

      navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Faça login.' } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#1e293b] rounded-2xl shadow-2xl p-10 border border-slate-800"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">CRIAR <span className="text-sky-500">CONTA</span></h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Cadastre seu perfil de agente operacional</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nome Completo</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl focus:border-sky-500 outline-none text-white transition-all text-sm"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Matrícula</label>
            <div className="relative group">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="text"
                required
                value={formData.enrollment}
                onChange={(e) => setFormData({ ...formData, enrollment: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl focus:border-sky-500 outline-none text-white transition-all text-sm"
                placeholder="Ex: 12345"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">WhatsApp</label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="tel"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl focus:border-sky-500 outline-none text-white transition-all text-sm"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl focus:border-sky-500 outline-none text-white transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirmar Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl focus:border-sky-500 outline-none text-white transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-900/30 transition-all disabled:opacity-50 uppercase tracking-widest text-xs mt-4"
          >
            {loading ? 'Processando Cadastro...' : 'Finalizar Registro'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-tight">
            Já possui um perfil? {' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-sky-500 hover:text-sky-400 transition-colors"
            >
              FAÇA SEU LOGIN AQUI
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
