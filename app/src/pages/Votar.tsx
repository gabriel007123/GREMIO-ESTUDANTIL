import { useState } from 'react';
import { getChapas, matriculaJaVotou, addVoto, getEleicao } from '../lib/store';
import type { Chapa } from '../lib/types';

type Etapa = 'matricula' | 'escolha' | 'confirmacao' | 'sucesso' | 'jaVotou' | 'fechada';

export default function Votar() {
  const eleicao = getEleicao();
  const chapas = getChapas();

  const [etapa, setEtapa] = useState<Etapa>(eleicao.aberta ? 'matricula' : 'fechada');
  const [matricula, setMatricula] = useState('');
  const [errMatricula, setErrMatricula] = useState('');
  const [chapaEscolhida, setChapaEscolhida] = useState<Chapa | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function validarMatricula() {
    const m = matricula.trim();
    if (m.length < 4) {
      setErrMatricula('Informe uma matrícula válida (mínimo 4 caracteres).');
      return;
    }
    setCarregando(true);
    try {
      if (await matriculaJaVotou(m)) {
        setEtapa('jaVotou');
        return;
      }
      setErrMatricula('');
      setEtapa('escolha');
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarVoto() {
    if (!chapaEscolhida) return;
    setCarregando(true);
    try {
      const registrado = await addVoto({ matricula: matricula.trim(), chapaId: chapaEscolhida.id, timestamp: Date.now() });
      setEtapa(registrado ? 'sucesso' : 'jaVotou');
    } finally {
      setCarregando(false);
    }
  }

  function reiniciar() {
    setEtapa('matricula');
    setMatricula('');
    setChapaEscolhida(null);
    setErrMatricula('');
  }

  if (etapa === 'fechada') {
    return (
      <Moldura>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-display font-800 text-2xl text-[#1a1a6e] mb-2">Votação encerrada</h2>
          <p className="text-gray-500">O período de votação foi encerrado. Confira os resultados na aba Resultados.</p>
        </div>
      </Moldura>
    );
  }

  if (etapa === 'jaVotou') {
    return (
      <Moldura>
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="font-display font-800 text-2xl text-amber-700 mb-2">Matrícula já votou</h2>
          <p className="text-gray-500 mb-6">
            A matrícula <strong>{matricula}</strong> já registrou um voto nesta eleição.
            Cada estudante pode votar apenas uma vez.
          </p>
          <button onClick={reiniciar} className="btn-primary">Tentar outra matrícula</button>
        </div>
      </Moldura>
    );
  }

  if (etapa === 'sucesso') {
    return (
      <Moldura>
        <div className="text-center py-12 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-4xl animate-pulse-ring">
            ✅
          </div>
          <h2 className="font-display font-900 text-3xl text-[#16a34a] mb-2">Voto registrado!</h2>
          <p className="text-gray-500 mb-1">
            Obrigado por participar da eleição do Grêmio Estudantil.
          </p>
          {chapaEscolhida && (
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-white font-700 text-sm"
              style={{ backgroundColor: chapaEscolhida.cor }}
            >
              <span>Chapa {chapaEscolhida.numero} — {chapaEscolhida.nome}</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">Seu voto é secreto e foi computado com segurança.</p>
          <button onClick={reiniciar} className="mt-6 text-sm text-[#3b56e8] underline underline-offset-2">
            Votar com outra matrícula
          </button>
        </div>
      </Moldura>
    );
  }

  if (etapa === 'matricula') {
    return (
      <Moldura>
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🗳️</div>
            <h2 className="font-display font-800 text-2xl text-[#1a1a6e] mb-1">Identificação do eleitor</h2>
            <p className="text-gray-500 text-sm">Informe sua matrícula escolar para continuar</p>
          </div>

          <div className="max-w-sm mx-auto space-y-4">
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">
                Matrícula escolar
              </label>
              <input
                type="text"
                value={matricula}
                onChange={e => { setMatricula(e.target.value); setErrMatricula(''); }}
                onKeyDown={e => e.key === 'Enter' && validarMatricula()}
                placeholder="Ex: 20261234"
                className={`w-full border-2 rounded-xl px-4 py-3 text-lg font-700 tracking-widest text-center focus:outline-none transition-colors ${
                  errMatricula ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#3b56e8]'
                }`}
                maxLength={20}
                autoFocus
              />
              {errMatricula && (
                <p className="text-red-500 text-xs mt-1.5 text-center">{errMatricula}</p>
              )}
            </div>

            <button onClick={validarMatricula} className="btn-primary w-full">
              {carregando ? 'Verificando…' : 'Continuar →'}
            </button>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Sua matrícula é usada apenas para garantir que cada estudante vote uma única vez.
              O voto é secreto.
            </p>
          </div>
        </div>
      </Moldura>
    );
  }

  if (etapa === 'escolha') {
    return (
      <Moldura>
        <div className="animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="font-display font-800 text-2xl text-[#1a1a6e] mb-1">Escolha sua chapa</h2>
            <p className="text-gray-500 text-sm">Matrícula: <strong>{matricula}</strong></p>
          </div>

          <div className="space-y-3 mb-6">
            {chapas.map(chapa => (
              <button
                key={chapa.id}
                onClick={() => setChapaEscolhida(chapa)}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                  chapaEscolhida?.id === chapa.id
                    ? 'border-current shadow-lg scale-[1.01]'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                style={chapaEscolhida?.id === chapa.id ? { borderColor: chapa.cor } : {}}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-900 text-xl flex-shrink-0"
                    style={{ backgroundColor: chapa.cor }}
                  >
                    {chapa.numero}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-800 text-base text-gray-900">{chapa.nome}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{chapa.proposta}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      chapaEscolhida?.id === chapa.id ? 'border-current' : 'border-gray-300'
                    }`}
                    style={chapaEscolhida?.id === chapa.id ? { borderColor: chapa.cor, backgroundColor: chapa.cor } : {}}
                  >
                    {chapaEscolhida?.id === chapa.id && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => chapaEscolhida && setEtapa('confirmacao')}
            disabled={!chapaEscolhida}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar escolha →
          </button>
        </div>
      </Moldura>
    );
  }

  if (etapa === 'confirmacao') {
    return (
      <Moldura>
        <div className="animate-fade-in text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-display font-800 text-2xl text-[#1a1a6e] mb-2">Confirmar voto</h2>
          <p className="text-gray-500 text-sm mb-6">
            Este voto <strong>não poderá ser alterado</strong>. Confirme sua escolha:
          </p>

          {chapaEscolhida && (
            <div
              className="rounded-2xl p-5 text-white mb-6 mx-auto max-w-xs"
              style={{ backgroundColor: chapaEscolhida.cor }}
            >
              <div className="font-display font-900 text-4xl mb-1">
                Chapa {chapaEscolhida.numero}
              </div>
              <div className="font-700 text-lg">{chapaEscolhida.nome}</div>
            </div>
          )}

          <div className="flex gap-3 max-w-xs mx-auto">
            <button
              onClick={() => setEtapa('escolha')}
              className="flex-1 border-2 border-gray-200 text-gray-600 font-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={confirmarVoto}
              className="flex-1 bg-[#16a34a] text-white font-700 px-4 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              {carregando ? 'Registrando…' : 'Confirmar ✓'}
            </button>
          </div>
        </div>
      </Moldura>
    );
  }

  return null;
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
