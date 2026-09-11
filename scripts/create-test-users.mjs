// scripts/create-test-users.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const users = [
  {
    email: 'coord-chapada@metas.com',
    password: 'Teste@123',
    enrollment: 'coord-chapada',
    name: 'Coordenador Chapada',
    role: 'COORDINATOR',
    whatsapp: '(11) 99999-0001',
  },
  {
    email: 'coord-caatinga@metas.com',
    password: 'Teste@123',
    enrollment: 'coord-caatinga',
    name: 'Coordenador Caatinga',
    role: 'COORDINATOR',
    whatsapp: '(11) 99999-0002',
  },
  {
    email: 'coord-cerrado@metas.com',
    password: 'Teste@123',
    enrollment: 'coord-cerrado',
    name: 'Coordenador Cerrado',
    role: 'COORDINATOR',
    whatsapp: '(11) 99999-0003',
  },
  {
    email: 'gn-chapada@metas.com',
    password: 'Teste@123',
    enrollment: 'gn-chapada',
    name: 'GN Chapada',
    role: 'GN',
    whatsapp: '(11) 99999-0004',
  },
  {
    email: 'gn-caatinga@metas.com',
    password: 'Teste@123',
    enrollment: 'gn-caatinga',
    name: 'GN Caatinga',
    role: 'GN',
    whatsapp: '(11) 99999-0005',
  },
  {
    email: 'gn-cerrado@metas.com',
    password: 'Teste@123',
    enrollment: 'gn-cerrado',
    name: 'GN Cerrado',
    role: 'GN',
    whatsapp: '(11) 99999-0006',
  },
  {
    email: 'go-operacoes@metas.com',
    password: 'Teste@123',
    enrollment: 'go-operacoes',
    name: 'GO - Gerente de Operações',
    role: 'GN',
    whatsapp: '(11) 99999-0007',
  },
];

for (const user of users) {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      name: user.name,
      enrollment: user.enrollment,
      role: user.role,
    },
  });

  if (authError) {
    console.error(`Erro ao criar ${user.email}:`, authError.message);
    continue;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: authData.user.id,
        enrollment: user.enrollment,
        name: user.name,
        role: user.role,
        whatsapp: user.whatsapp,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.error(`Erro ao salvar perfil de ${user.email}:`, profileError.message);
  } else {
    console.log(`Usuário criado com sucesso: ${user.email}`);
  }
}