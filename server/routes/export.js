import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { readFile, unlink } from 'fs/promises'

const execAsync = promisify(exec)
const DOCS_DIR = join(process.cwd(), 'docs')
const EXPORTS_DIR = join(process.cwd(), 'exports')
const REFERENCE_DOC = join(process.cwd(), 'reference.docx')
const LUA_FILTER = join(process.cwd(), 'strip-header-ids.lua')

export default async function exportRoutes(fastify) {
  fastify.post('/api/export/:name', async (request, reply) => {
    const { name } = request.params

    if (!name.endsWith('.md') || name.includes('/') || name.includes('\\')) {
      return reply.status(400).send({ error: 'Invalid file name' })
    }

    const inputPath = join(DOCS_DIR, name)
    const outputName = name.replace(/\.md$/, '.docx')
    const outputPath = join(EXPORTS_DIR, outputName)

    try {
      await execAsync(`pandoc "${inputPath}" -f markdown-auto_identifiers --lua-filter="${LUA_FILTER}" --reference-doc="${REFERENCE_DOC}" -o "${outputPath}"`)

      const docxBuffer = await readFile(outputPath)

      await unlink(outputPath).catch(() => {})

      return reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        .header('Content-Disposition', `attachment; filename="${outputName}"`)
        .send(docxBuffer)
    } catch (err) {
      console.error('Export error:', err)

      if (err.message.includes('pandoc')) {
        return reply.status(500).send({
          error: 'Pandoc is not installed. Run: brew install pandoc'
        })
      }

      return reply.status(500).send({ error: 'Export failed' })
    }
  })
}
