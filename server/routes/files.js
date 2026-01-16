import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const DOCS_DIR = join(process.cwd(), 'docs')

export default async function filesRoutes(fastify) {
  fastify.get('/api/files', async (request, reply) => {
    try {
      const entries = await readdir(DOCS_DIR, { withFileTypes: true })
      const files = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => entry.name)
        .sort()
      return { files }
    } catch (err) {
      if (err.code === 'ENOENT') {
        return { files: [] }
      }
      throw err
    }
  })

  fastify.get('/api/files/:name', async (request, reply) => {
    const { name } = request.params

    if (!name.endsWith('.md') || name.includes('/') || name.includes('\\')) {
      return reply.status(400).send({ error: 'Invalid file name' })
    }

    try {
      const filePath = join(DOCS_DIR, name)
      const content = await readFile(filePath, 'utf-8')
      return { content }
    } catch (err) {
      if (err.code === 'ENOENT') {
        return reply.status(404).send({ error: 'File not found' })
      }
      throw err
    }
  })
}
