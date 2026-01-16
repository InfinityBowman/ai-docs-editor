import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';

const execAsync = promisify(exec);
const DOCS_DIR = join(process.cwd(), 'docs');
const UPLOADS_DIR = join(process.cwd(), 'uploads');
const PIPE_TABLES_FILTER = join(process.cwd(), 'force-pipe-tables.lua');

export default async function importRoutes(fastify) {
  fastify.post('/api/import', async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const originalName = data.filename;
    if (!originalName.endsWith('.docx')) {
      return reply.status(400).send({ error: 'Only .docx files are supported' });
    }

    // Sanitize filename
    const baseName = originalName
      .replace(/\.docx$/, '')
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .trim();

    if (!baseName) {
      return reply.status(400).send({ error: 'Invalid file name' });
    }

    const outputName = `${baseName}.md`;
    const tempPath = join(UPLOADS_DIR, originalName);
    const outputPath = join(DOCS_DIR, outputName);

    try {
      // Save uploaded file temporarily
      const buffer = await data.toBuffer();
      await writeFile(tempPath, buffer);

      // Convert with pandoc - use gfm (GitHub Flavored Markdown) with lua filter for proper pipe tables
      await execAsync(`pandoc "${tempPath}" -f docx -t gfm --lua-filter="${PIPE_TABLES_FILTER}" --wrap=none -o "${outputPath}"`);

      // Clean up temp file
      await unlink(tempPath).catch(() => {});

      return reply.send({
        success: true,
        fileName: outputName,
        message: `Imported as ${outputName}`,
      });
    } catch (err) {
      console.error('Import error:', err);

      // Clean up temp file on error
      await unlink(tempPath).catch(() => {});

      if (err.message.includes('pandoc')) {
        return reply.status(500).send({
          error: 'Pandoc is not installed. Run: brew install pandoc',
        });
      }

      return reply.status(500).send({ error: 'Import failed' });
    }
  });
}
