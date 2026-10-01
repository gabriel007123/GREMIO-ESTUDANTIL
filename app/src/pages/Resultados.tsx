import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, PieChart, Pie, Legend } from 'recharts';
import { getResultados, getVotos, getResultadosRemotos } from '../lib/store';

export default function Resultados() {
  const [dados, setDados] = useState(getResultados());
  const [totalVotos, setTotalVotos] = useState(getVotos().length);

  useEffect(() => {
    async function atualizar() {
      const resultados = await getResultadosRemotos();
      setDados(resultados);
      setTotalVotos(resultados.reduce((total, chapa) => total + chapa.votos, 0));
    }
    atualizar();
    const interval = setInterval(atualizar, 3000);
    return () => clearInterval(interval);
  }, []);

  const vencedora = dados.reduce((a, b) => (a.votos > b.votos ? a : b), dados[0]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display font-900 text-3xl text-[#1a1a6e]">Resultados parciais</h2>
          <p className="text-gray-500 text-sm mt-1">
            {totalVotos} voto{totalVotos !== 1 ? 's' : ''} computado{totalVotos !== 1 ? 's' : ''} · Atualiza automaticamente
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-700 bg-green-50 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Ao vivo
        </div>
      </div>

      {totalVotos === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-3">🗳️</div>
          <h3 className="font-display font-700 text-xl text-gray-400">Nenhum voto registrado ainda</h3>
          <p className="text-gray-400 text-sm mt-1">Os resultados aparecerão aqui assim que os votos forem computados.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Liderança */}
          {totalVotos > 0 && vencedora.votos > 0 && (
            <div
              className="rounded-2xl p-5 text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${vencedora.cor}dd, ${vencedora.cor})` }}
            >
              <div className="text-sm font-700 opacity-80 mb-1">🏆 Liderando</div>
              <div className="font-display font-900 text-2xl">
                Chapa {vencedora.numero} — {vencedora.nome}
              </div>
              <div className="text-white/80 text-sm mt-1">
                {vencedora.votos} voto{vencedora.votos !== 1 ? 's' : ''} ({totalVotos > 0 ? Math.round(vencedora.votos / totalVotos * 100) : 0}%)
              </div>
            </div>
          )}

          {/* Tabela de resultados */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-display font-800 text-base text-gray-800">Contagem de votos</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {[...dados].sort((a, b) => b.votos - a.votos).map((c, i) => {
                const pct = totalVotos > 0 ? (c.votos / totalVotos) * 100 : 0;
                return (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-700 text-gray-400 w-4">{i + 1}º</span>
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.cor }}
                        />
                        <span className="font-700 text-sm text-gray-800">
                          Chapa {c.numero} — {c.nome}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-900 text-lg" style={{ color: c.cor }}>
                          {c.votos}
                        </span>
                        <span className="text-gray-400 text-xs ml-1">
                          ({pct.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: c.cor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico de barras */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-display font-800 text-base text-gray-800 mb-4">Gráfico de votos</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dados} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="nome"
                  tick={{ fontSize: 11, fontFamily: 'Nunito Sans', fontWeight: 600 }}
                  tickFormatter={n => n.replace('Chapa ', '')}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: number) => [`${val} voto${val !== 1 ? 's' : ''}`, 'Votos']}
                  labelFormatter={l => `${l}`}
                  contentStyle={{ fontFamily: 'Nunito Sans', fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="votos" radius={[6, 6, 0, 0]}>
                  {dados.map(entry => (
                    <Cell key={entry.id} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pizza */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-display font-800 text-base text-gray-800 mb-4">Distribuição percentual</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dados}
                  dataKey="votos"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ nome, percent }) =>
                    percent > 0 ? `${nome.replace('Chapa ', 'Ch.')} ${(percent * 100).toFixed(1)}%` : ''
                  }
                  labelLine={false}
                >
                  {dados.map(entry => (
                    <Cell key={entry.id} fill={entry.cor} />
                  ))}
                </Pie>
                <Legend
                  formatter={v => <span style={{ fontSize: 12, fontFamily: 'Nunito Sans', fontWeight: 600 }}>{v}</span>}
                />
                <Tooltip
                  formatter={(val: number) => [`${val} voto${val !== 1 ? 's' : ''}`, 'Votos']}
                  contentStyle={{ fontFamily: 'Nunito Sans', fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
