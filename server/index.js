import Fastify from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import fastifyCors from '@fastify/cors'
import { spawn } from 'child_process'
import filesRoutes from './routes/files.js'
import exportRoutes from './routes/export.js'
import websocketPlugin from './websocket.js'

const fastify = Fastify({ logger: true })

await fastify.register(fastifyCors, {
  origin: true,
})
await fastify.register(fastifyWebsocket)

await fastify.register(filesRoutes)
await fastify.register(exportRoutes)
await fastify.register(websocketPlugin)

const startVite = () => {
  const vite = spawn('npx', ['vite', '--port', '5173'], {
    stdio: 'inherit',
    shell: true,
  })

  vite.on('error', (err) => {
    console.error('Failed to start Vite:', err)
  })

  process.on('SIGINT', () => {
    vite.kill()
    process.exit()
  })

  process.on('SIGTERM', () => {
    vite.kill()
    process.exit()
  })
}

const start = async () => {
  try {
    await fastify.listen({ port: 3005, host: '0.0.0.0' })
    console.log('\n📝 AI Docs Editor')
    console.log('   Backend API: http://localhost:3005')
    console.log('   Frontend:    http://localhost:5173')
    console.log('\n   Edit markdown files in docs/ with your AI tool.')
    console.log('   Preview updates automatically.\n')

    startVite()
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
