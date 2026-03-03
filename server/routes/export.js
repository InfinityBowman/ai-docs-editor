import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { readFile, unlink } from 'fs/promises';

const execAsync = promisify(exec);
const DOCS_DIR = join(process.cwd(), 'docs');
const EXPORTS_DIR = join(process.cwd(), 'exports');
const REFERENCE_DOC = join(process.cwd(), 'reference.docx');
const LUA_FILTER = join(process.cwd(), 'strip-header-ids.lua');
const TABLE_FILTER = join(process.cwd(), 'fix-tables.lua');

// Ensure LaTeX binaries (from BasicTeX/MacTeX) are in PATH for PDF export
const EXEC_ENV = { ...process.env };
if (!EXEC_ENV.PATH.includes('/Library/TeX/texbin')) {
  EXEC_ENV.PATH = `/Library/TeX/texbin:${EXEC_ENV.PATH}`;
}

export default async function exportRoutes(fastify) {
  fastify.post('/api/export/:name', async (request, reply) => {
    const { name } = request.params;
    const format = request.query.format || 'docx';

    if (!name.endsWith('.md') || name.includes('/') || name.includes('\\')) {
      return reply.status(400).send({ error: 'Invalid file name' });
    }

    if (!['docx', 'pdf'].includes(format)) {
      return reply.status(400).send({ error: 'Invalid format. Use "docx" or "pdf".' });
    }

    const inputPath = join(DOCS_DIR, name);
    const outputName = name.replace(/\.md$/, `.${format}`);
    const outputPath = join(EXPORTS_DIR, outputName);

    try {
      let command;
      if (format === 'pdf') {
        command = `pandoc "${inputPath}" -f markdown-auto_identifiers --columns=9999 --lua-filter="${LUA_FILTER}" -V geometry:margin=1in -o "${outputPath}"`;
      } else {
        command = `pandoc "${inputPath}" -f markdown-auto_identifiers --columns=9999 --lua-filter="${LUA_FILTER}" --lua-filter="${TABLE_FILTER}" --reference-doc="${REFERENCE_DOC}" -o "${outputPath}"`;
      }

      await execAsync(command, { env: EXEC_ENV });

      const fileBuffer = await readFile(outputPath);

      await unlink(outputPath).catch(() => {});

      const contentType = format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      return reply
        .header('Content-Type', contentType)
        .header('Content-Disposition', `attachment; filename="${outputName}"`)
        .send(fileBuffer);
    } catch (err) {
      console.error('Export error:', err);

      if (err.message.includes('pandoc')) {
        return reply.status(500).send({
          error: 'Pandoc is not installed. Run: brew install pandoc',
        });
      }

      if (format === 'pdf' && (err.message.includes('pdflatex') || err.message.includes('xelatex') || err.message.includes('pdf'))) {
        return reply.status(500).send({
          error: 'PDF export requires a LaTeX engine. Run: brew install --cask basictex',
        });
      }

      return reply.status(500).send({ error: 'Export failed' });
    }
  });
}
