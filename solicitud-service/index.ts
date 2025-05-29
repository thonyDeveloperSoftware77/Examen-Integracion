import { Hono } from 'hono'
import { jwtVerify } from 'jose'

const app = new Hono()

const JWT_SECRET = new TextEncoder().encode('mi_secreto_compartido_muy_seguro_1234')

// Middleware para validar JWT en todas las rutas
app.use('*', async (c, next) => {
  /*
  try {
    const authHeader = c.req.header('Authorization')
    console.log('Authorization header:', authHeader)
    if (!authHeader) {
      console.log('No Authorization header found')
      return c.text('No autorizado', 401)
    }
    const token = authHeader.split(' ')[1]
    console.log('Token recibido:', token)
    await jwtVerify(token, JWT_SECRET)
    console.log('Token verificado correctamente')
    await next()
  } catch (error) {
    console.log('Error validando token:', error)
    return c.text('Token inválido', 401)
  }
    */
   await next()
})

// POST /solicitudes
app.post('/solicitudes', async (c) => {
  const solicitud = await c.req.json()

  try {
    // Llamada al servicio SOAPClientService
    const res = await fetch('http://soapclient-service.finpay.svc.cluster.local:3000/registrar-certificacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solicitud),
    })

    if (!res.ok) throw new Error('Error al llamar SOAPClientService')

    const resultado = await res.json()

    return c.json({
      solicitudId: solicitud.id,
      estado: resultado.estado,
    })
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500)
  }
})

// GET /solicitudes/:id (mock)
app.get('/solicitudes/:id', (c) => {
  const id = c.req.param('id')
  // Aquí podrías consultar base de datos, ahora mock
  return c.json({
    solicitudId: id,
    estado: 'procesado',
  })
})

Bun.serve({
  port: 3000,
  fetch: app.fetch,
})
