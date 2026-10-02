import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  apagarVotos,
  contarVotos,
  initializeDatabase,
  listarVotos,
  matriculaJaVotou,
  registrarVoto,
} from './db.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT || 3000)
const adminPassword = process.env.ADMIN_PASSWORD || ''

app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: Boolean(process.env.DATABASE_URL) })
})

app.get('/api/votes/check', async (req, res, next) => {
  try {
    const matricula = String(req.query.matricula || '').trim()
    if (matricula.length < 4) return res.status(400).json({ error: 'matricula_invalida' })
    res.json({ jaVotou: await matriculaJaVotou(matricula) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/votes', async (req, res, next) => {
  try {
    const matricula = String(req.body?.matricula || '').trim()
    const chapaId = String(req.body?.chapaId || '').trim()
    if (matricula.length < 4 || matricula.length > 20 || !chapaId) {
      return res.status(400).json({ error: 'dados_invalidos' })
    }
    const registrado = await registrarVoto({ matricula, chapaId })
    if (!registrado) return res.status(409).json({ error: 'matricula_ja_votou' })
    res.status(201).json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.get('/api/results', async (_req, res, next) => {
  try {
    const porChapa = await contarVotos()
    const total = Object.values(porChapa).reduce((soma, valor) => soma + valor, 0)
    res.json({ porChapa, total })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/login', (req, res) => {
  if (!adminPassword || String(req.body?.senha || '') !== adminPassword) {
    return res.status(401).json({ error: 'nao_autorizado' })
  }
  res.json({ ok: true })
})

app.get('/api/votes', async (req, res, next) => {
  try {
    if (req.get('x-admin-password') !== adminPassword) {
      return res.status(401).json({ error: 'nao_autorizado' })
    }
    res.json({ votos: await listarVotos() })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/votes', async (req, res, next) => {
  try {
    if (req.get('x-admin-password') !== adminPassword) {
      return res.status(401).json({ error: 'nao_autorizado' })
    }
    await apagarVotos()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

const distDir = path.resolve(__dirname, '../dist')
app.use(express.static(distDir, { maxAge: '1h' }))
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(distDir, 'index.html'))
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'erro_interno' })
})

initializeDatabase()
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`API pronta na porta ${port}`)))
  .catch(error => {
    console.error('Falha ao preparar banco de dados:', error)
    process.exit(1)
  })
