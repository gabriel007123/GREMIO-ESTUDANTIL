import type { Pagina } from '../lib/types';

interface Props {
  pagina: Pagina;
  setPagina: (p: Pagina) => void;
  escola: string;
}

export default function Header({ pagina, setPagina, escola }: Props) {
  const nav: { label: string; key: Pagina }[] = [
    { label: 'Início', key: 'home' },
    { label: 'Votar', key: 'votar' },
    { label: 'Resultados', key: 'resultados' },
    { label: 'Administração', key: 'admin' },
  ];

  return (
    <header className="bg-[#1a1a6e] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => setPagina('home')}
            className="flex items-center gap-2 font-display font-800 text-lg leading-tight"
          >
            <span className="text-2xl">🗳️</span>
            <span className="hidden sm:block text-sm font-600 opacity-80">{escola}</span>
          </button>

          <nav className="flex items-center gap-1">
            {nav.map(({ label, key }) => (
              <button
                key={key}
                onClick={() => setPagina(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-700 transition-all ${
                  pagina === key
                    ? 'bg-white text-[#1a1a6e]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
