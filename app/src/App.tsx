import { useState } from 'react';
import type { Pagina } from './lib/types';
import { getEleicao } from './lib/store';
import Header from './components/Header';
import Home from './pages/Home';
import Votar from './pages/Votar';
import Resultados from './pages/Resultados';
import Admin from './pages/Admin';

export default function App() {
  const [pagina, setPagina] = useState<Pagina>('home');
  const [eleicao] = useState(getEleicao());

  return (
    <div className="min-h-screen bg-[#f2f4fd]">
      <Header pagina={pagina} setPagina={setPagina} escola={eleicao.escola} />

      <main>
        {pagina === 'home' && <Home eleicao={eleicao} setPagina={setPagina} />}
        {pagina === 'votar' && <Votar />}
        {pagina === 'resultados' && <Resultados />}
        {pagina === 'admin' && <Admin />}
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm text-gray-400">
            🗳️ Sistema de Votação do Grêmio Estudantil — {eleicao.anoLetivo}
          </span>
          <span className="text-xs text-gray-300">
            Desenvolvido para {eleicao.escola}
          </span>
        </div>
      </footer>
    </div>
  );
}
