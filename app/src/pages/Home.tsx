import type { Pagina } from '../lib/types';
import type { ConfigEleicao } from '../lib/store';
import { getChapas, getVotos } from '../lib/store';

interface Props {
  eleicao: ConfigEleicao;
  setPagina: (p: Pagina) => void;
}

export default function Home({ eleicao, setPagina }: Props) {
  const chapas = getChapas();
  const totalVotos = getVotos().length;

  const diasRestantes = () => {
    const fim = new Date(eleicao.fim);
    const hoje = new Date();
    const diff = Math.ceil((fim.getTime() - hoje.getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a1a6e] via-[#2535a8] to-[#3b56e8] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-600 mb-5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {eleicao.aberta ? 'Votação Aberta' : 'Votação Encerrada'}
            </div>
            <h1 className="font-display font-900 text-3xl md:text-5xl leading-tight mb-4">
              {eleicao.nome}
            </h1>
            <p className="text-white/80 text-lg mb-6">
              Ano letivo {eleicao.anoLetivo} · {eleicao.escola}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPagina('votar')}
                className="bg-[#f97316] hover:bg-[#fb923c] text-white font-700 px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Votar agora →
              </button>
              <button
                onClick={() => setPagina('resultados')}
                className="bg-white/10 hover:bg-white/20 text-white font-600 px-6 py-3 rounded-xl transition-all border border-white/20"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Chapas', value: chapas.length, icon: '🏛️' },
            { label: 'Votos computados', value: totalVotos, icon: '🗳️' },
            { label: 'Dias restantes', value: diasRestantes(), icon: '📅' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-display font-900 text-2xl md:text-3xl text-[#1a1a6e]">{stat.value}</div>
              <div className="text-xs text-gray-500 font-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapas */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="font-display font-800 text-2xl text-[#1a1a6e] mb-6">Conheça as chapas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {chapas.map(chapa => (
            <div
              key={chapa.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div
                className="h-2"
                style={{ backgroundColor: chapa.cor }}
              />
              <div className="p-5">
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-white font-display font-900 text-lg mb-3"
                  style={{ backgroundColor: chapa.cor }}
                >
                  {chapa.numero}
                </div>
                <h3 className="font-display font-800 text-lg text-gray-900 mb-2">{chapa.nome}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{chapa.proposta}</p>
                <div className="space-y-1">
                  {chapa.membros.map(m => (
                    <div key={m} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: chapa.cor }}
                      />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#e8ebfc] rounded-2xl p-6">
          <h3 className="font-display font-800 text-lg text-[#1a1a6e] mb-2">Como votar?</h3>
          <ol className="space-y-2 text-sm text-[#2535a8]">
            {[
              'Clique em "Votar agora" ou acesse a aba Votar',
              'Informe sua matrícula escolar (cada matrícula vota uma única vez)',
              'Escolha a chapa de sua preferência',
              'Confirme seu voto — ele é secreto e não pode ser alterado',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-900 text-[#3b56e8] flex-shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
