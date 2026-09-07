import { UserProfile, ActivityLog } from './types';

export const mockProfiles: UserProfile[] = [
  { id: '1', enrollment: '001', name: 'Rodrigo (Dono)', role: 'OWNER', is_active: true, created_at: new Date().toISOString() },
  { id: '2', enrollment: '002', name: 'Admin 1', role: 'ADMIN', is_active: true, created_at: new Date().toISOString() },
  { id: '3', enrollment: '003', name: 'Diretoria', role: 'BOARD', is_active: true, created_at: new Date().toISOString() },
  { id: '4', enrollment: '004', name: 'CR Polo A', role: 'CR', is_active: true, created_at: new Date().toISOString() },
  { id: '5', enrollment: '005', name: 'Coordenador Unidade 1', role: 'COORDINATOR', is_active: true, created_at: new Date().toISOString() },
  { id: '6', enrollment: '006', name: 'Agente Silva', role: 'AGENT', whatsapp: '11999999999', is_active: true, created_at: new Date().toISOString() },
  { id: '7', enrollment: '007', name: 'Agente Oliveira', role: 'AGENT', whatsapp: '11888888888', is_active: false, created_at: new Date().toISOString() },
];

export const mockLogs: ActivityLog[] = [
  { id: '1', user_id: '1', user_name: 'Rodrigo', action: 'Bloqueio de Usuário', details: 'Bloqueou Agente Oliveira', created_at: new Date().toISOString() },
  { id: '2', user_id: '2', user_name: 'Admin 1', action: 'Criação de Pergunta', details: 'Criou pergunta para metas semanais', created_at: new Date().toISOString() },
  { id: '3', user_id: '4', user_name: 'CR Polo A', action: 'Exportação de PDF', details: 'Exportou relatório consolidado', created_at: new Date().toISOString() },
];
