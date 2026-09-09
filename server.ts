import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase Admin Client (Service Role) - Lazy initialization
let supabaseAdminInstance: any = null;

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for this action. Please set them in the environment.');
    }
    
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminInstance;
}

const roleAliases: Record<string, 'OWNER' | 'ADMIN' | 'BOARD' | 'GN' | 'CR' | 'COORDINATOR' | 'AGENT'> = {
  owner: 'OWNER',
  criador: 'OWNER',
  administrador: 'ADMIN',
  admin: 'ADMIN',
  diretor: 'BOARD',
  diretoria: 'BOARD',
  board: 'BOARD',
  gerente: 'GN',
  gerencia: 'GN',
  gn: 'GN',
  cr: 'CR',
  coordenador: 'COORDINATOR',
  coordinator: 'COORDINATOR',
  agente: 'AGENT',
  agent: 'AGENT'
};

function normalizeRole(value: unknown) {
  const role = String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalized = roleAliases[role];
  if (!normalized) throw new Error(`Tipo de conta inválido: ${value}`);
  return normalized;
}

function normalizeEnrollment(value: unknown) {
  const enrollment = String(value ?? '').trim().toLowerCase();
  if (!enrollment) throw new Error('A matrícula é obrigatória.');
  return enrollment;
}

async function requireOwner(req: express.Request) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw new Error('Sessão não informada.');

  const token = authorization.slice('Bearer '.length);
  const admin = getSupabaseAdmin();
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) throw new Error('Sessão inválida.');

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'OWNER' || !profile.is_active) {
    throw new Error('Apenas o proprietário pode gerenciar acessos.');
  }

  return user;
}

async function createManagedUser(input: { enrollment: unknown; password: unknown; name?: unknown; role: unknown; whatsapp?: unknown; unit_id?: unknown; polo_id?: unknown }) {
  const admin = getSupabaseAdmin();
  const enrollment = normalizeEnrollment(input.enrollment);
  const password = String(input.password ?? '');
  if (password.length < 6) throw new Error(`A senha da matrícula ${enrollment} deve ter pelo menos 6 caracteres.`);

  const role = normalizeRole(input.role);
  const email = `${enrollment}@metas.com`;
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: input.name || enrollment, enrollment, role }
  });

  if (authError) throw new Error(`${enrollment}: ${authError.message}`);

  const { data: profile, error: profileError } = await admin.from('profiles').insert({
    id: authData.user.id,
    name: String(input.name || enrollment),
    enrollment,
    whatsapp: input.whatsapp ? String(input.whatsapp) : null,
    role,
    unit_id: input.unit_id ? String(input.unit_id) : null,
    polo_id: input.polo_id ? String(input.polo_id) : null,
    is_active: true
  }).select().single();

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    throw new Error(`${enrollment}: ${profileError.message}`);
  }

  return profile;
}

async function updateManagedUser(userId: string, input: { enrollment: unknown; password?: unknown; name?: unknown; role: unknown; whatsapp?: unknown; unit_id?: unknown; polo_id?: unknown }) {
  const admin = getSupabaseAdmin();
  const enrollment = normalizeEnrollment(input.enrollment);
  const role = normalizeRole(input.role);
  const password = String(input.password ?? '');
  const authUpdate: Record<string, unknown> = {
    email: `${enrollment}@metas.com`,
    email_confirm: true,
    user_metadata: { name: input.name || enrollment, enrollment, role }
  };

  if (password) {
    if (password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
    authUpdate.password = password;
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, authUpdate);
  if (authError) throw new Error(authError.message);

  const { data, error } = await admin.from('profiles').update({
    name: String(input.name || enrollment),
    enrollment,
    whatsapp: input.whatsapp ? String(input.whatsapp) : null,
    role,
    unit_id: input.unit_id ? String(input.unit_id) : null,
    polo_id: input.polo_id ? String(input.polo_id) : null
  }).eq('id', userId).select().single();

  if (error) throw new Error(error.message);
  return data;
}

async function ensureConfiguredOwner() {
  const login = process.env.OWNER_LOGIN;
  const password = process.env.OWNER_PASSWORD;
  if (!login || !password) return;

  const admin = getSupabaseAdmin();
  const email = `${login}@metas.com`;
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const currentUser = existing.users.find((user: any) => user.email === email);

  if (!currentUser) {
    await createManagedUser({ enrollment: login, password, name: 'DigosLab', role: 'OWNER' });
  } else {
    await admin.auth.admin.updateUserById(currentUser.id, { password, user_metadata: { role: 'OWNER', enrollment: login } });
    await admin.from('profiles').upsert({ id: currentUser.id, enrollment: login, name: 'DigosLab', role: 'OWNER', is_active: true });
  }
}

app.post('/api/admin/users', async (req, res) => {
  try {
    await requireOwner(req);
    const profile = await createManagedUser(req.body);
    res.status(201).json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:userId', async (req, res) => {
  try {
    await requireOwner(req);
    const profile = await updateManagedUser(req.params.userId, req.body);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/users/import', async (req, res) => {
  try {
    await requireOwner(req);
    if (!Array.isArray(req.body?.users)) throw new Error('Envie uma lista de usuários.');

    const imported = [];
    for (const row of req.body.users) imported.push(await createManagedUser(row));
    res.status(201).json({ imported: imported.length, users: imported });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    await requireOwner(req);
    const { data, error } = await getSupabaseAdmin().from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
});

// Admin API Routes
app.post('/api/admin/block-user', async (req, res) => {
  const { userId, blocked } = req.body;
  try {
    await requireOwner(req);
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { is_active: !blocked }
    });
    
    // Also update profiles table
    await admin.from('profiles').update({ is_active: !blocked }).eq('id', userId);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/logs', async (req, res) => {
  try {
    await requireOwner(req);
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Keep API failures as JSON instead of returning the SPA HTML fallback.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint da API não encontrado. Reinicie o servidor atualizado.' });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production' || process.env.OWNER_LOGIN) {
    await ensureConfiguredOwner();
  }
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('server.ts') ||
  process.argv[1].endsWith('dist/server.cjs')
);

if (isDirectExecution) {
  startServer();
}
