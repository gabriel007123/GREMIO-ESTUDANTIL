import type { Chapa, Voto } from './types';

const CHAPAS_KEY = 'gremio_chapas';
const VOTOS_KEY = 'gremio_votos';
const ELEICAO_KEY = 'gremio_eleicao';

export interface ConfigEleicao {
  nome: string;
  anoLetivo: string;
  escola: string;
  aberta: boolean;
  inicio: string;
  fim: string;
}

const chapasDefault: Chapa[] = [
  {
    id: 'chapa-a', nome: 'Chapa Renovação', numero: 1,
    proposta: 'Mais espaços de convivência, reforço escolar gratuito e biblioteca aberta nos fins de semana.',
    cor: '#3b56e8', membros: ['Ana Lima (Candidata a Presidente)', 'Bruno Costa (Vice)', 'Carla Souza', 'Diego Matos'],
  },
  {
    id: 'chapa-b', nome: 'Chapa União', numero: 2,
    proposta: 'Cantina com preços justos, quadra reformada e mais eventos culturais para todos.',
    cor: '#e53935', membros: ['Fernanda Rocha (Candidata a Presidente)', 'Gabriel Silva (Vice)', 'Helena Nunes', 'Igor Alves'],
  },
  {
    id: 'chapa-c', nome: 'Chapa Futuro', numero: 3,
    proposta: 'Laboratório de informática atualizado, grêmio digital e sustentabilidade na escola.',
    cor: '#16a34a', membros: ['Julia Mendes (Candidata a Presidente)', 'Kaio Ferreira (Vice)', 'Larissa Pinto', 'Marcos Reis'],
  },
];

const eleicaoDefault: ConfigEleicao = {
  nome: 'Eleição do Grêmio Estudantil 2026', anoLetivo: '2026', escola: 'E.E. Prof. João da Silva',
  aberta: true, inicio: '2026-09-15', fim: '2026-09-20',
};

export function getChapas(): Chapa[] {
  try {
    const raw = localStorage.getItem(CHAPAS_KEY);
    return raw ? JSON.parse(raw) : chapasDefault;
  } catch { return chapasDefault; }
}

export function saveChapas(chapas: Chapa[]) { localStorage.setItem(CHAPAS_KEY, JSON.stringify(chapas)); }

export function getVotos(): Voto[] {
  try {
    const raw = localStorage.getItem(VOTOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalVoto(voto: Voto) {
  const votos = getVotos();
  if (!votos.find(v => v.matricula === voto.matricula)) {
    votos.push(voto);
    localStorage.setItem(VOTOS_KEY, JSON.stringify(votos));
  }
}

export async function matriculaJaVotou(matricula: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/votes/check?matricula=${encodeURIComponent(matricula)}`);
    if (response.ok) return Boolean((await response.json()).jaVotou);
  } catch { /* fallback local */ }
  return getVotos().some(v => v.matricula === matricula);
}

export async function addVoto(voto: Voto): Promise<boolean> {
  try {
    const response = await fetch('/api/votes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula: voto.matricula, chapaId: voto.chapaId }),
    });
    if (response.status === 409) return false;
    if (response.ok) { saveLocalVoto(voto); return true; }
  } catch { /* fallback local */ }
  if (getVotos().some(v => v.matricula === voto.matricula)) return false;
  saveLocalVoto(voto);
  return true;
}

export async function getVotosRemotos(adminPassword: string): Promise<Voto[]> {
  try {
    const response = await fetch('/api/votes', { headers: { 'x-admin-password': adminPassword } });
    if (response.ok) return (await response.json()).votos;
  } catch { /* fallback local */ }
  return getVotos();
}

export async function resetVotosRemotos(adminPassword: string): Promise<boolean> {
  try {
    const response = await fetch('/api/votes', {
      method: 'DELETE', headers: { 'x-admin-password': adminPassword },
    });
    if (response.ok) { localStorage.removeItem(VOTOS_KEY); return true; }
  } catch { /* fallback local */ }
  localStorage.removeItem(VOTOS_KEY);
  return true;
}

export function getResultados() {
  const votos = getVotos();
  const chapas = getChapas();
  return chapas.map(c => ({ ...c, votos: votos.filter(v => v.chapaId === c.id).length }));
}

export async function getResultadosRemotos() {
  const chapas = getChapas();
  try {
    const response = await fetch('/api/results');
    if (response.ok) {
      const data = await response.json();
      return chapas.map(chapa => ({ ...chapa, votos: Number(data.porChapa?.[chapa.id] || 0) }));
    }
  } catch { /* fallback local */ }
  return getResultados();
}

export function getEleicao(): ConfigEleicao {
  try {
    const raw = localStorage.getItem(ELEICAO_KEY);
    return raw ? JSON.parse(raw) : eleicaoDefault;
  } catch { return eleicaoDefault; }
}

export function saveEleicao(cfg: ConfigEleicao) { localStorage.setItem(ELEICAO_KEY, JSON.stringify(cfg)); }
