import { useEffect, useState } from 'react';
import {
  getChapas, saveChapas, getVotos, getVotosRemotos, resetVotosRemotos,
  getEleicao, saveEleicao,
} from '../lib/store';
import type { Chapa, Voto } from '../lib/types';
import type { ConfigEleicao } from '../lib/store';

export default function Admin() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState('');
  const [errSenha, setErrSenha] = useState('');
  const [chapas, setChapas] = useState<Chapa[]>(getChapas());
  const [eleicao, setEleicao] = useState<ConfigEleicao>(getEleicao());
  const [aba, setAba] = useState<'eleicao' | 'chapas' | 'votos'>('eleicao');
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState('');
  const [editando, setEditando] = useState<Chapa | null>(null);

  const [votos, setVotos] = useState<Voto[]>(getVotos());
  const cores = ['#3b56e8', '#e53935', '#16a34a', '#f97316', '#8b5cf6', '#0891b2'];

  useEffect(() => {
    if (logado) getVotosRemotos(senha).then(setVotos);
  }, [logado, senha]);

  async function login() {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      });
      if (response.ok) {
      setLogado(true);
      } else setErrSenha('Senha incorreta.');
    } catch {
      setErrSenha('Não foi possível conectar ao servidor.');
    }
  }

  function salvarEleicao() {
    saveEleicao(eleicao);
    flash('Configurações salvas!');
  }

  function salvarChapas() {
    saveChapas(chapas);
    flash('Chapas salvas!');
  }

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(''), 2500);
  }

  function atualizarChapa(id: string, campo: keyof Chapa, valor: unknown) {
    setChapas(prev => prev.map(c => c.id === id ? { ...c, [campo]: valor } : c));
  }

  function adicionarChapa() {
    const novo: Chapa = {
      id: `chapa-${Date.now()}`,
      nome: 'Nova Chapa',
      numero: chapas.length + 1,
      proposta: 'Proposta da chapa.',
      cor: cores[chapas.length % cores.length],
      membros: ['Candidato (Presidente)'],
    };
    setChapas(prev => [...prev, novo]);
  }

  function removerChapa(id: string) {
    setChapas(prev => prev.filter(c => c.id !== id));
  }

  async function executarReset() {
    await resetVotosRemotos(senha);
    setVotos([]);
    setConfirmReset(false);
    flash('Votos resetados com sucesso.');
  }

  if (!logado) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="font-display font-800 text-xl text-[#1a1a6e]">Administração</h2>
            <p className="text-gray-400 text-sm mt-1">Acesso restrito</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => { setSenha(e.target.value); setErrSenha(''); }}
                onKeyDown={e => e.key === 'Enter' && login()}
                className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none transition-colors ${
                  errSenha ? 'border-red-400' : 'border-gray-200 focus:border-[#3b56e8]'
                }`}
                placeholder="••••••••"
                autoFocus
              />
              {errSenha && <p className="text-red-500 text-xs mt-1">{errSenha}</p>}
            </div>
            <button onClick={login} className="btn-primary w-full">Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-900 text-2xl text-[#1a1a6e]">Painel Administrativo</h2>
        <button onClick={() => setLogado(false)} className="text-sm text-gray-400 hover:text-gray-600">
          Sair →
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-700 px-4 py-3 rounded-xl mb-4 animate-fade-in">
          ✅ {msg}
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {([
          { key: 'eleicao', label: '⚙️ Eleição' },
          { key: 'chapas', label: '🏛️ Chapas' },
          { key: 'votos', label: '🗳️ Votos' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`flex-1 py-2 text-sm font-700 rounded-lg transition-all ${
              aba === key ? 'bg-white shadow-sm text-[#1a1a6e]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Aba Eleição */}
      {aba === 'eleicao' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-display font-800 text-lg text-gray-800">Configurações da eleição</h3>
          {[
            { label: 'Nome da eleição', campo: 'nome' as const },
            { label: 'Escola', campo: 'escola' as const },
            { label: 'Ano letivo', campo: 'anoLetivo' as const },
            { label: 'Data de início', campo: 'inicio' as const, type: 'date' },
            { label: 'Data de término', campo: 'fim' as const, type: 'date' },
          ].map(({ label, campo, type }) => (
            <div key={campo}>
              <label className="block text-sm font-700 text-gray-600 mb-1">{label}</label>
              <input
                type={type || 'text'}
                value={eleicao[campo]}
                onChange={e => setEleicao(prev => ({ ...prev, [campo]: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#3b56e8] text-sm transition-colors"
              />
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setEleicao(prev => ({ ...prev, aberta: !prev.aberta }))}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  eleicao.aberta ? 'bg-[#3b56e8]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    eleicao.aberta ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </div>
              <span className="text-sm font-700 text-gray-700">
                {eleicao.aberta ? 'Votação aberta' : 'Votação encerrada'}
              </span>
            </label>
          </div>
          <button onClick={salvarEleicao} className="btn-primary">Salvar configurações</button>
        </div>
      )}

      {/* Aba Chapas */}
      {aba === 'chapas' && (
        <div className="space-y-4">
          {chapas.map(chapa => (
            <div key={chapa.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: chapa.cor }}
                />
                <span className="font-display font-800 text-gray-800">{chapa.nome}</span>
                <button
                  onClick={() => removerChapa(chapa.id)}
                  className="ml-auto text-xs text-red-400 hover:text-red-600 font-700 transition-colors"
                >
                  Remover
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-700 text-gray-500 mb-1">Nome da chapa</label>
                  <input
                    value={chapa.nome}
                    onChange={e => atualizarChapa(chapa.id, 'nome', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b56e8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-700 text-gray-500 mb-1">Número</label>
                  <input
                    type="number"
                    value={chapa.numero}
                    onChange={e => atualizarChapa(chapa.id, 'numero', Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b56e8]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-700 text-gray-500 mb-1">Proposta</label>
                  <textarea
                    value={chapa.proposta}
                    onChange={e => atualizarChapa(chapa.id, 'proposta', e.target.value)}
                    rows={2}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b56e8] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-700 text-gray-500 mb-1">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {cores.map(c => (
                      <button
                        key={c}
                        onClick={() => atualizarChapa(chapa.id, 'cor', c)}
                        className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${chapa.cor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-700 text-gray-500 mb-1">Membros (um por linha)</label>
                  <textarea
                    value={chapa.membros.join('\n')}
                    onChange={e => atualizarChapa(chapa.id, 'membros', e.target.value.split('\n'))}
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b56e8] resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button
              onClick={adicionarChapa}
              className="flex-1 border-2 border-dashed border-gray-300 text-gray-500 font-700 py-3 rounded-xl hover:border-[#3b56e8] hover:text-[#3b56e8] transition-colors"
            >
              + Adicionar chapa
            </button>
            <button onClick={salvarChapas} className="btn-primary">Salvar chapas</button>
          </div>
        </div>
      )}

      {/* Aba Votos */}
      {aba === 'votos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-800 text-base text-gray-800">Total de votos</h3>
                <div className="font-display font-900 text-4xl text-[#1a1a6e]">{votos.length}</div>
              </div>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 font-700 transition-colors"
                >
                  Resetar votos
                </button>
              ) : (
                <div className="text-right space-y-2">
                  <p className="text-xs text-red-500 font-700">Tem certeza? Isso apaga todos os votos!</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={executarReset}
                      className="text-xs text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 font-700"
                    >
                      Confirmar reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 text-sm font-700 text-gray-600">
              Registro de votos (anônimos)
            </div>
            {votos.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Nenhum voto ainda.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {[...votos].reverse().map((v, i) => {
                  const chapa = chapas.find(c => c.id === v.chapaId);
                  return (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: chapa?.cor || '#ccc' }}
                        />
                        <span className="text-sm font-700 text-gray-700">
                          Matrícula {v.matricula.startsWith('****') ? v.matricula : `****${v.matricula.slice(-3)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-700" style={{ color: chapa?.cor }}>
                          {chapa?.nome || v.chapaId}
                        </span>
                        <span className="text-xs text-gray-300">
                          {new Date(v.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
