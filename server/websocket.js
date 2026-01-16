import { watch } from 'chokidar'
import { join } from 'path'

const DOCS_DIR = join(process.cwd(), 'docs')

export default async function websocketPlugin(fastify, options) {
  const clients = new Set()

  const watcher = watch(DOCS_DIR, {
    ignored: (path) => !path.endsWith('.md') && !path.endsWith('docs'),
    ignoreInitial: true,
    persistent: true,
    usePolling: true,
    interval: 100,
    binaryInterval: 100,
    atomic: true,
  })

  const broadcast = (message) => {
    const data = JSON.stringify(message)
    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(data)
      }
    }
  }

  watcher.on('add', (filePath) => {
    if (!filePath.endsWith('.md')) return
    const file = filePath.split('/').pop()
    broadcast({ type: 'file-change', event: 'add', file })
  })

  watcher.on('change', (filePath) => {
    if (!filePath.endsWith('.md')) return
    const file = filePath.split('/').pop()
    broadcast({ type: 'file-change', event: 'change', file })
  })

  watcher.on('unlink', (filePath) => {
    if (!filePath.endsWith('.md')) return
    const file = filePath.split('/').pop()
    broadcast({ type: 'file-change', event: 'unlink', file })
  })

  fastify.get('/ws', { websocket: true }, (socket, req) => {
    clients.add(socket)

    socket.on('close', () => {
      clients.delete(socket)
    })
  })

  fastify.addHook('onClose', async () => {
    await watcher.close()
  })
}
