import { Hono } from 'hono'

const app = new Hono()

const estadosPosibles = ['procesado', 'en revisión', 'rechazado']

function randomDelay(min = 300, max = 1500) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

app.post('/registrar-certificacion', async (c) => {
  const solicitud = await c.req.json()

  console.log('SOAPClientService recibió:', solicitud)

  // Simular delay variable
  await new Promise((resolve) => setTimeout(resolve, randomDelay()))

  // - Si id termina en '0' simula error de conexión (timeout)
  if (solicitud.id?.endsWith('0')) {
    return c.json({ error: 'Timeout en sistema SOAP' }, 504)
  }

  // - Si tipo es "rechazo", simula respuesta con estado rechazado
  if (solicitud.tipo === 'rechazo') {
    return c.json({ estado: 'rechazado' })
  }

  // - Si tipo es "revision", simula respuesta con estado en revisión
  if (solicitud.tipo === 'revision') {
    return c.json({ estado: 'en revisión' })
  }

  // Caso normal: retorna estado procesado
  return c.json({ estado: 'procesado' })
})

// Endpoint para simular estado de solicitud por id
app.get('/estado/:id', (c) => {
  const id = c.req.param('id')

  if (id.endsWith('9')) return c.json({ estado: 'rechazado' })
  if (id.endsWith('8')) return c.json({ estado: 'en revisión' })

  return c.json({ estado: 'procesado' })
})

Bun.serve({
  port: 3000,
  fetch: app.fetch,
})
