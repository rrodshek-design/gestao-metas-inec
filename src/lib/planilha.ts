import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type PlanilhaLinha = {
  semana: string;
  unidade: string;
  coordenador: string;
  responsavel: string;
  meta: string;
  prazo: string;
  status: string;
  observacoes: string;
  data_resposta: string;
  [key: string]: string | undefined;
};

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const pickValue = (row: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const normalizeRows = (rows: Record<string, unknown>[]): PlanilhaLinha[] => {
  return rows
    .map((row) => {
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        normalized[normalizeKey(key)] = String(value ?? '').trim();
      }

      return {
        semana: pickValue(normalized, ['semana', 'week', 'periodo', 'semanaatual']),
        unidade: pickValue(normalized, ['unidade', 'unit', 'nomeunidade', 'regional']),
        coordenador: pickValue(normalized, ['coordenador', 'coordenadorunidade', 'coordinador']),
        responsavel: pickValue(normalized, ['responsavel', 'responsavelunidade', 'coordenador']),
        meta: pickValue(normalized, ['meta', 'metadasemana', 'metaaentregar', 'resultado']),
        prazo: pickValue(normalized, ['prazo', 'deadline', 'dataentrega']),
        status: pickValue(normalized, ['status', 'situacao']) || 'pendente',
        observacoes: pickValue(normalized, ['observacoes', 'observacao', 'comentario']),
        data_resposta: pickValue(normalized, ['dataresposta', 'data_resposta', 'respostaem'])
      };
    })
    .filter((row) => row.unidade || row.coordenador || row.meta || row.semana);
};

export const planilhaMetaUrl = import.meta.env.VITE_METAS_SHEET_URL || '';

function getRowsIniciais(): PlanilhaLinha[] {
  return [
    {
      semana: 'Semana 1',
      unidade: 'Unidade 01',
      coordenador: 'Coordenador 01',
      responsavel: 'Responsável 01',
      meta: 'Meta inicial a definir',
      prazo: 'A definir',
      status: 'pendente',
      observacoes: 'Planilha vazia. Ajuste os dados da semana quando quiser começar a registrar entregas.',
      data_resposta: new Date().toISOString()
    },
    {
      semana: 'Semana 1',
      unidade: 'Unidade 02',
      coordenador: 'Coordenador 02',
      responsavel: 'Responsável 02',
      meta: 'Meta inicial a definir',
      prazo: 'A definir',
      status: 'pendente',
      observacoes: 'Planilha vazia. Ajuste os dados da semana quando quiser começar a registrar entregas.',
      data_resposta: new Date().toISOString()
    },
    {
      semana: 'Semana 1',
      unidade: 'Unidade 03',
      coordenador: 'Coordenador 03',
      responsavel: 'Responsável 03',
      meta: 'Meta inicial a definir',
      prazo: 'A definir',
      status: 'pendente',
      observacoes: 'Planilha vazia. Ajuste os dados da semana quando quiser começar a registrar entregas.',
      data_resposta: new Date().toISOString()
    }
  ];
}

export async function carregarPlanilha(url = planilhaMetaUrl): Promise<PlanilhaLinha[]> {
  if (!url) {
    return getRowsIniciais();
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Não foi possível carregar a planilha (${response.status}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  const isCsv = /\.csv($|\?|#)/i.test(url) || contentType.includes('text/csv') || contentType.includes('application/csv');

  if (isCsv) {
    const text = await response.text();
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    if (parsed.errors.length) {
      console.warn('Aviso ao ler CSV:', parsed.errors);
    }

    const rows = normalizeRows(parsed.data);
    return rows.length ? rows : getRowsIniciais();
  }

  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const normalized = normalizeRows(rows);

  return normalized.length ? normalized : getRowsIniciais();
}
