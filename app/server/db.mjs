import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localFile = path.join(__dirname, 'local-votes.json')
const databaseUrl = process.env.DATABASE_URL
let pool

function hashMatricula(matricula) {
  return crypto.createHash('sha256').update(matricula.trim()).digest('hex')
}

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(localFile, 'utf8'))
  } catch {
    return []
  }
}

async function writeLocal(votos) {
  await fs.writeFile(localFile, JSON.stringify(votos, null, 2) + '\n')
}

export async function initializeDatabase() {
  if (!databaseUrl) return
  pool = mysql.createPool({
    uri: databaseUrl,
    connectionLimit: 5,
    timezone: 'Z',
  })
  await pool.query(`
    CREATE TABLE IF NOT EXISTS votos (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      eleicao_key VARCHAR(80) NOT NULL DEFAULT 'principal',
      matricula_hash CHAR(64) NOT NULL,
      matricula_final CHAR(3) NOT NULL,
      chapa_id VARCHAR(100) NOT NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY voto_unico (eleicao_key, matricula_hash),
      INDEX votos_chapa (eleicao_key, chapa_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
}

export async function matriculaJaVotou(matricula) {
  const hash = hashMatricula(matricula)
  if (!pool) {
    const votos = await readLocal()
    return votos.some(voto => voto.matriculaHash === hash)
  }
  const [rows] = await pool.query(
    'SELECT id FROM votos WHERE eleicao_key = ? AND matricula_hash = ? LIMIT 1',
    ['principal', hash],
  )
  return rows.length > 0
}

export async function registrarVoto({ matricula, chapaId }) {
  const limpa = matricula.trim()
  const hash = hashMatricula(limpa)
  const final = limpa.slice(-3)
  if (!pool) {
    const votos = await readLocal()
    if (votos.some(voto => voto.matriculaHash === hash)) return false
    votos.push({ matriculaHash: hash, matriculaFinal: final, chapaId, criadoEm: Date.now() })
    await writeLocal(votos)
    return true
  }
  try {
    await pool.query(
      'INSERT INTO votos (eleicao_key, matricula_hash, matricula_final, chapa_id) VALUES (?, ?, ?, ?)',
      ['principal', hash, final, chapaId],
    )
    return true
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') return false
    throw error
  }
}

export async function listarVotos() {
  if (!pool) {
    const votos = await readLocal()
    return votos.map(voto => ({ matricula: voto.matriculaFinal, chapaId: voto.chapaId, timestamp: voto.criadoEm }))
  }
  const [rows] = await pool.query(
    'SELECT matricula_final AS matricula, chapa_id AS chapaId, UNIX_TIMESTAMP(criado_em) * 1000 AS timestamp FROM votos WHERE eleicao_key = ? ORDER BY criado_em DESC',
    ['principal'],
  )
  return rows
}

export async function contarVotos() {
  if (!pool) {
    const votos = await readLocal()
    return votos.reduce((resultado, voto) => {
      resultado[voto.chapaId] = (resultado[voto.chapaId] || 0) + 1
      return resultado
    }, {})
  }
  const [rows] = await pool.query(
    'SELECT chapa_id AS chapaId, COUNT(*) AS votos FROM votos WHERE eleicao_key = ? GROUP BY chapa_id',
    ['principal'],
  )
  return Object.fromEntries(rows.map(row => [row.chapaId, Number(row.votos)]))
}

export async function apagarVotos() {
  if (!pool) {
    await writeLocal([])
    return
  }
  await pool.query('DELETE FROM votos WHERE eleicao_key = ?', ['principal'])
}
