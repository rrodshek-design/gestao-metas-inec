import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  ClipboardList,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import OwnerDashboard from './dashboards/OwnerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import BoardDashboard from './dashboards/BoardDashboard';
import GNDashboard from './dashboards/GNDashboard';
import CRDashboard from './dashboards/CRDashboard';
import CoordinatorDashboard from './dashboards/CoordinatorDashboard';
import AgentDashboard from './dashboards/AgentDashboard';

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  const formatRole = (role: string) => {
    const labels: Record<string, string> = {
      OWNER: 'Criador',
      GN: 'Gerente',
      COORDINATOR: 'Coordenador',
      AGENT: 'Agente',
      BOARD: 'Diretor',
      ADMIN: 'Administrador',
      CR: 'Regional'
    };

    return labels[role] || role;
  };

  if (!profile) return null;

  const menuItems = [
    { id: 'overview', label: 'Início', icon: LayoutDashboard, roles: ['OWNER', 'ADMIN', 'BOARD', 'GN', 'CR', 'COORDINATOR', 'AGENT'] },
    { id: 'management', label: 'Gestão de Usuários', icon: Users, roles: ['OWNER', 'BOARD'] },
    { id: 'forms', label: 'Formulários', icon: ClipboardList, roles: ['ADMIN', 'CR'] },
    { id: 'units', label: 'Unidades', icon: Building2, roles: ['BOARD', 'GN'] },
    { id: 'reports', label: 'Relatórios', icon: FileText, roles: ['OWNER', 'ADMIN', 'BOARD', 'CR'] },
    { id: 'analytics', label: 'Análise', icon: BarChart3, roles: ['OWNER', 'BOARD'] },
    { id: 'settings', label: 'Configurações', icon: Settings, roles: ['OWNER', 'BOARD'] },
    { id: 'logs', label: 'Logs do Sistema', icon: ShieldCheck, roles: ['OWNER'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(profile.role));

  const renderOverview = () => {
    switch (profile.role) {
      case 'OWNER': return <OwnerDashboard />;
      case 'ADMIN': return <AdminDashboard />;
      case 'BOARD': return <BoardDashboard />;
      case 'GN': return <GNDashboard />;
      case 'CR': return <CRDashboard />;
      case 'COORDINATOR': return <CoordinatorDashboard />;
      case 'AGENT': return <AgentDashboard />;
      default: return <div>Role não identificada</div>;
    }
  };

  const sectionContent: Record<string, { title: string; description: string; items: { label: string; value: string; detail: string }[] }> = {
    management: {
      title: 'Gestão de Usuários',
      description: 'Consulte o panorama dos acessos e das equipes sob sua responsabilidade.',
      items: [
        { label: 'Acessos ativos', value: '0', detail: 'Nenhum dado carregado nesta visão' },
        { label: 'Equipes', value: '0', detail: 'Cadastre equipes para acompanhar' },
        { label: 'Pendências', value: '0', detail: 'Nenhuma pendência registrada' }
      ]
    },
    forms: {
      title: 'Formulários',
      description: 'Crie e acompanhe os formulários de metas disponíveis para as equipes.',
      items: [
        { label: 'Formulários ativos', value: '0', detail: 'Nenhum formulário publicado ainda' },
        { label: 'Respostas recebidas', value: '0', detail: 'As respostas aparecerão aqui' },
        { label: 'Última atualização', value: '--', detail: 'Sem alterações recentes' }
      ]
    },
    units: {
      title: 'Unidades',
      description: 'Organize polos, unidades e responsáveis pelo acompanhamento das metas.',
      items: [
        { label: 'Unidades cadastradas', value: '0', detail: 'Cadastre unidades para começar' },
        { label: 'Polos ativos', value: '0', detail: 'Nenhum polo configurado' },
        { label: 'Coordenadores', value: '0', detail: 'Os responsáveis serão exibidos aqui' }
      ]
    },
    reports: {
      title: 'Relatórios',
      description: 'Consulte os resultados consolidados das metas por período e unidade.',
      items: [
        { label: 'Relatórios disponíveis', value: '0', detail: 'Envie respostas para gerar relatórios' },
        { label: 'Período atual', value: new Date().getFullYear().toString(), detail: 'Ano de referência' },
        { label: 'Status', value: 'Pronto', detail: 'Aguardando dados do sistema' }
      ]
    },
    analytics: {
      title: 'Análise',
      description: 'Acompanhe indicadores de desempenho e evolução das metas.',
      items: [
        { label: 'Atingimento médio', value: '0%', detail: 'Sem respostas calculadas' },
        { label: 'Metas em acompanhamento', value: '0', detail: 'Nenhuma meta ativa' },
        { label: 'Tendência', value: '--', detail: 'Dados insuficientes para análise' }
      ]
    },
    settings: {
      title: 'Configurações',
      description: 'Ajuste as preferências gerais e os parâmetros de funcionamento do sistema.',
      items: [
        { label: 'Banco de dados', value: 'Supabase', detail: 'Conexão configurada' },
        { label: 'Autenticação', value: 'Ativa', detail: 'Login por matrícula ou usuário' },
        { label: 'Perfil atual', value: formatRole(profile.role), detail: 'Permissões definidas pelo seu perfil' }
      ]
    },
    logs: {
      title: 'Logs do Sistema',
      description: 'Acompanhe as atividades registradas no sistema.',
      items: [
        { label: 'Registro de atividades', value: 'Ativo', detail: 'As ações administrativas são registradas' },
        { label: 'Retenção', value: 'Supabase', detail: 'Os registros ficam armazenados no banco' },
        { label: 'Acesso', value: 'OWNER', detail: 'Área restrita ao proprietário' }
      ]
    }
  };

  const renderSection = () => {
    if (activeSection === 'overview') return renderOverview();
    if (activeSection === 'management' && profile.role === 'OWNER') return <OwnerDashboard />;

    const section = sectionContent[activeSection];
    if (!section) return renderOverview();

    return (
      <section className="space-y-8 animate-in fade-in duration-500">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-400 font-bold">MetaFlow</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{section.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{section.description}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {section.items.map((item) => (
            <article key={item.label} className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 min-h-36 flex flex-col justify-between">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{item.label}</p>
              <p className="text-3xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Próximos passos</h3>
          <p className="mt-3 text-sm text-slate-400">Quando os dados forem cadastrados, esta área exibirá informações atualizadas para o perfil {profile.role}.</p>
        </div>
      </section>
    );
  };

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden font-sans text-slate-200">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[#1e293b] border-r border-slate-800 transition-all duration-300 flex flex-col shadow-2xl",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 border-b border-slate-800">
          {isSidebarOpen ? (
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">META<span className="text-sky-500">FLOW</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Plataforma Digital</p>
            </div>
          ) : (
            <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-white text-xs">MF</div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 custom-scrollbar overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              aria-current={activeSection === item.id ? 'page' : undefined}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                activeSection === item.id
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  : "text-slate-400 font-medium hover:bg-slate-800 hover:text-sky-400"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-[#1e293b]">
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl mb-4 border border-slate-800">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-indigo-900/20">
              {profile.name[0]}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{profile.name}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{formatRole(profile.role)}</p>
              </div>
            )}
          </div>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-4 p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="text-sm font-bold">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </main>
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-4 right-4 p-3 bg-sky-600 text-white rounded-full shadow-lg md:hidden"
      >
        <Menu size={24} />
      </button>
    </div>
  );
}
