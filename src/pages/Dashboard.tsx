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

  const renderDashboard = () => {
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
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                "text-slate-400 font-medium hover:bg-slate-800 hover:text-sky-400"
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
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{profile.role}</p>
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
          {renderDashboard()}
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
