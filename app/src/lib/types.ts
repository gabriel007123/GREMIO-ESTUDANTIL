export interface Chapa {
  id: string;
  nome: string;
  numero: number;
  proposta: string;
  cor: string;
  membros: string[];
}

export interface Voto {
  matricula: string;
  chapaId: string;
  timestamp: number;
}

export type Pagina = 'home' | 'votar' | 'resultados' | 'admin';
