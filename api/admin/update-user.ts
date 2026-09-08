import { createClient } from '@supabase/supabase-js';

const roles: Record<string, string> = {
  owner: 'OWNER', criador: 'OWNER', administrador: 'ADMIN', admin: 'ADMIN',
  diretor: 'BOARD', diretoria: 'BOARD', board: 'BOARD', gerente: 'GN', gerencia: 'GN',
  gn: 'GN', cr: 'CR', coordenador: 'COORDINATOR', coordinator: 'COORDINATOR',
  agente: 'AGENT', agent: 'AGENT'
};

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurada na Vercel.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function normalizeRole(value: unknown) {
  const input = String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const role = roles[input] || String(value ?? '').trim().toUpperCase();
  if (!['OWNER', 'ADMIN', 'BOARD', 'GN', 'CR', 'COORDINATOR', 'AGENT'].includes(role)) {
    throw new Error(`Tipo de conta inválido: ${value}`);
  }
  return role;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Método não permitido.' });

  try {
    const authorization = req.headers?.authorization;
    if (!authorization?.startsWith('Bearer ')) throw new Error('Sessão não informada.');

    const body = req.body || {};
    const userId = String(body.userId || '').trim();
    const enrollment = String(body.enrollment || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const role = normalizeRole(body.role);
    const password = String(body.password || '');
    if (!userId || !enrollment || !name) throw new Error('Usuário, nome e matrícula são obrigatórios.');
    if (password && password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');

    const admin = getAdminClient();
    const { data: { user }, error: authError } = await admin.auth.getUser(authorization.slice(7));
    if (authError || !user) throw new Error('Sessão inválida.');

    const { data: owner, error: ownerError } = await admin.from('profiles')
      .select('role, is_active').eq('id', user.id).single();
    if (ownerError || owner?.role !== 'OWNER' || !owner.is_active) {
      throw new Error('Apenas o proprietário pode editar acessos.');
    }

    const authUpdate: Record<string, unknown> = {
      email: `${enrollment}@metas.com`,
      email_confirm: true,
      user_metadata: { name, enrollment, role }
    };
    if (password) authUpdate.password = password;

    const { error: authUpdateError } = await admin.auth.admin.updateUserById(userId, authUpdate);
    if (authUpdateError) throw new Error(authUpdateError.message);

    const { data, error: profileError } = await admin.from('profiles').update({
      name,
      enrollment,
      role,
      whatsapp: body.whatsapp ? String(body.whatsapp) : null,
      unit_id: body.unit_id ? String(body.unit_id) : null,
      polo_id: body.polo_id ? String(body.polo_id) : null
    }).eq('id', userId).select().single();
    if (profileError) throw new Error(profileError.message);

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.message || 'Não foi possível atualizar o usuário.' });
  }
}