import { Hono } from 'hono'
import { generateChineseId } from './id/mainland-china-id-card'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/id/mainland-china-id-card/generate', (c) => {
  const gender = c.req.query('gender') as 'male' | 'female' | undefined
  const birthDateQuery = c.req.query('birthDate')
  const birthDate = birthDateQuery ? new Date(birthDateQuery) : undefined
  const areaCode = c.req.query('areaCode')
  const useOldFormat = c.req.query('useOldFormat') === 'true'
  const count = Number.parseInt(c.req.query('count') || '1', 10)

  const idNumbers = []
  for (let i = 0; i < count; i++) {
    const idNumber = generateChineseId({
      gender,
      birthDate,
      areaCode,
      useOldFormat,
    })
    idNumbers.push(idNumber)
  }
  return c.json({
    status: 200,
    message: 'success',
    data: idNumbers,
  })
})

export default app
