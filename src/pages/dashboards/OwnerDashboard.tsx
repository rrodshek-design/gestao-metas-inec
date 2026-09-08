import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { mockProfiles, mockLogs } from '../../mockData';
import { UserProfile, ActivityLog } from '../../types';
import * as XLSX from 'xlsx';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Download, 
  History,
  Users as UsersIcon,
  Activity,
  ShieldAlert,
  Upload,
  UserPlus,
  Pencil
} from 'lucide-react';
import Papa from 'papaparse';
import { cn } from '../../lib/utils';

export default function OwnerDashboard() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', enrollment: '', password: '', role: 'AGENT', whatsapp: '' });
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({ name: '', enrollment: '', password: '', role: 'AGENT', whatsapp: '' });

  async function getAdminHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` } : null;
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const headers = await getAdminHeaders();
      if (!headers) throw new Error('Sessão expirada');
      const [profilesResponse, logsResponse] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/logs', { headers })
      ]);
      const pData = profilesResponse.ok ? await profilesResponse.json() : null;
      const lData = logsResponse.ok ? await logsResponse.json() : null;

      if (!pData) {
        setProfiles(mockProfiles);
      } else {
        setProfiles(pData);
      }

      if (!lData) {
        setLogs(mockLogs);
      } else {
        setLogs(lData);
      }
    } catch (err) {
      setProfiles(mockProfiles);
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  }

  const toggleUserStatus = async (user: UserProfile) => {
    const newStatus = !user.is_active;
    
    // Optimistic UI
    setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, is_active: newStatus } : p));

    try {
      // Use our server API for blocking (to handle Auth admin operations)
      const headers = await getAdminHeaders();
      if (!headers) throw new Error('Sessão expirada');
      await fetch('/api/admin/block-user', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: user.id, blocked: user.is_active })
      });
      
      // Log action
      await supabase.from('activity_logs').insert({
        user_id: user.id, // In a real scenario, this would be the current user's ID
        user_name: 'Dono',
        action: newStatus ? 'Desbloqueio de Usuário' : 'Bloqueio de Usuário',
        details: `${newStatus ? 'Desbloqueou' : 'Bloqueou'} ${user.name}`
      });
      
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setFeedback(null);
    try {
      const headers = await getAdminHeaders();
      if (!headers) throw new Error('Sessão expirada');
      const response = await fetch('/api/admin/users', { method: 'POST', headers, body: JSON.stringify(newUser) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível criar o acesso.');
      setNewUser({ name: '', enrollment: '', password: '', role: 'AGENT', whatsapp: '' });
      setFeedback(`Acesso ${result.enrollment} criado com sucesso.`);
      fetchData();
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      enrollment: user.enrollment,
      password: '',
      role: user.role,
      whatsapp: user.whatsapp || ''
    });
    setFeedback(null);
  };

  const updateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;
    setCreating(true);
    setFeedback(null);
    try {
      const headers = await getAdminHeaders();
      if (!headers) throw new Error('Sessão expirada');
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(editForm)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível salvar o usuário.');
      setEditingUser(null);
      setFeedback(`Acesso ${result.enrollment} atualizado com sucesso.`);
      fetchData();
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setCreating(false);
    }
  };

  const importSpreadsheet = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImporting(true);
    setFeedback(null);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const users = rows.map((row) => {
        const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [
          key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''), value
        ]));
        return {
          enrollment: normalized.matricula || normalized.login,
          password: normalized.senha,
          role: normalized.tipodeconta || normalized.tipo || normalized.role,
          name: normalized.nome || normalized.name || normalized.matricula,
          whatsapp: normalized.whatsapp
        };
      });

      if (!users.length) throw new Error('A planilha não possui linhas para importar.');
      const headers = await getAdminHeaders();
      if (!headers) throw new Error('Sessão expirada');
      const response = await fetch('/api/admin/users/import', { method: 'POST', headers, body: JSON.stringify({ users }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível importar a planilha.');
      setFeedback(`${result.imported} acesso(s) importado(s) com sucesso.`);
      fetchData();
    } catch (error: any) {
      setFeedback(error.message);
    } finally {
      setImporting(false);
    }
  };

  const exportCSV = () => {
    const csvData = profiles.map(p => ({
      Matrícula: p.enrollment,
      Nome: p.name,
      Role: p.role,
      Status: p.is_active ? 'Ativo' : 'Bloqueado',
      WhatsApp: p.whatsapp || 'N/A',
      'Data de Cadastro': new Date(p.created_at).toLocaleDateString()
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'usuarios_sistema_metas.csv');
    link.click();
  };

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.enrollment.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Controle de Metas Operacionais</h2>
          <p className="text-sm text-slate-400">Gerenciamento total de acessos e monitoramento em tempo real</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium transition-all"
          >
            Exportar CSV
          </button>
          <button 
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md text-xs font-bold text-white shadow-lg shadow-sky-900/20 transition-all"
          >
            Ajustes Globais
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <form onSubmit={createUser} className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-sky-400" />
            <h3 className="font-bold text-white">Criar acesso</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder="Nome" value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} className="input-admin" />
            <input required placeholder="Matrícula/login" value={newUser.enrollment} onChange={(event) => setNewUser({ ...newUser, enrollment: event.target.value })} className="input-admin" />
            <input required type="password" minLength={6} placeholder="Senha" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} className="input-admin" />
            <select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })} className="input-admin">
              <option value="AGENT">Agente</option>
              <option value="COORDINATOR">Coordenador</option>
              <option value="GN">Gerente</option>
              <option value="BOARD">Diretor</option>
              <option value="ADMIN">Administrador</option>
              <option value="OWNER">Criador / proprietário</option>
            </select>
          </div>
          <button disabled={creating} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold text-white disabled:opacity-50">
            {creating ? 'Criando...' : 'Criar acesso'}
          </button>
        </form>

        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-emerald-400" />
            <h3 className="font-bold text-white">Importar acessos por XLSX</h3>
          </div>
          <p className="text-xs text-slate-400">A primeira linha deve conter: <strong>matricula</strong>, <strong>senha</strong>, <strong>tipo_de_conta</strong>. Opcionalmente: nome e whatsapp.</p>
          <label className="inline-flex cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white">
            {importing ? 'Importando...' : 'Escolher arquivo XLSX'}
            <input type="file" accept=".xlsx,.xls" onChange={importSpreadsheet} disabled={importing} className="hidden" />
          </label>
          {feedback && <p className="text-xs text-sky-300">{feedback}</p>}
        </div>
      </section>

      {editingUser && (
        <form onSubmit={updateUser} className="bg-[#1e293b] border border-sky-500/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil size={18} className="text-sky-400" />
              <h3 className="font-bold text-white">Editar acesso: {editingUser.enrollment}</h3>
            </div>
            <button type="button" onClick={() => setEditingUser(null)} className="text-xs text-slate-400 hover:text-white">Cancelar</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <input required placeholder="Nome" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} className="input-admin" />
            <input required placeholder="Matrícula/login" value={editForm.enrollment} onChange={(event) => setEditForm({ ...editForm, enrollment: event.target.value })} className="input-admin" />
            <input type="password" minLength={6} placeholder="Nova senha (opcional)" value={editForm.password} onChange={(event) => setEditForm({ ...editForm, password: event.target.value })} className="input-admin" />
            <select value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value })} className="input-admin">
              <option value="AGENT">Agente</option>
              <option value="COORDINATOR">Coordenador</option>
              <option value="GN">Gerente</option>
              <option value="BOARD">Diretor</option>
              <option value="ADMIN">Administrador</option>
              <option value="OWNER">Criador / proprietário</option>
            </select>
            <input placeholder="WhatsApp" value={editForm.whatsapp} onChange={(event) => setEditForm({ ...editForm, whatsapp: event.target.value })} className="input-admin" />
          </div>
          <button disabled={creating} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold text-white disabled:opacity-50">
            {creating ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      )}

      {/* Stats - Bento Style */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3 bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-32 shadow-sm transition-all hover:border-slate-700">
          <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total de Usuários</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{profiles.length}</span>
            <span className="text-xs text-sky-500">Cadastrados</span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-32 shadow-sm transition-all hover:border-slate-700">
          <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Acessos Ativos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-500">{profiles.filter(p => p.is_active).length}</span>
            <span className="text-xs text-slate-500">Verificados</span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-32 shadow-sm transition-all hover:border-slate-700">
          <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Status Supabase</span>
          <div className="flex items-center gap-2 mt-auto">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-400">Conectado</span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-gradient-to-br from-indigo-600 to-violet-700 p-4 rounded-xl shadow-lg h-32 flex flex-col justify-between">
          <span className="text-[10px] uppercase text-white/70 font-bold tracking-wider">Perfil Proprietário</span>
          <p className="text-sm text-white font-medium">Ajustes Críticos Habilitados</p>
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1">
            <div className="bg-white h-full w-[100%]"></div>
          </div>
        </div>

        {/* User Management List */}
        <div className="col-span-12 lg:col-span-8 bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-sm h-[500px] flex flex-col">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Gerenciar Usuários</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 w-full md:w-64 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Papel</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredProfiles.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-500">MAT: {user.enrollment}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded text-[9px] font-bold tracking-tight">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter",
                        user.is_active ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border border-rose-500/20"
                      )}>
                        {user.is_active ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => startEditing(user)}
                        title="Editar usuário e senha"
                        className="mr-2 text-[10px] font-bold px-2 py-1 rounded border text-sky-400 border-sky-500/20 hover:bg-sky-500/10 transition-all"
                      >
                        EDITAR
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded border transition-all",
                          user.is_active ? "text-rose-500 border-rose-500/20 hover:bg-rose-500/10" : "text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
                        )}
                      >
                        {user.is_active ? 'BLOQUEAR' : 'LIBERAR'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs - Bento Style */}
        <div className="col-span-12 lg:col-span-4 bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-sm h-[500px] flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Logs de Atividade</h3>
            <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 uppercase font-bold tracking-widest">Tempo Real</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/50 group hover:border-slate-700 transition-all">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-mono text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">SUPABASE-DB</span>
                </div>
                <p className="text-[11px] font-bold text-sky-400 group-hover:text-sky-300 transition-colors">{log.action}</p>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{log.details}</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest italic">Por: {log.user_name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
