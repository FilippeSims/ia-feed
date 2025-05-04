import { dbRun, dbAll } from '../db.js';

export default function(app) {
  // Using SQLite storage via app/db.js

  function escapeXml(unsafe) {
    const str = String(unsafe);
    return str.replace(/[<>&'"]?/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  app.post('/noticias', async (req, res) => {
    try {
      const { imagem, link, titulo, clicks, data_postagem } = req.body;
      if (!imagem || !link || !titulo || clicks == null || !data_postagem) {
        return res.status(400).send('Campos obrigatórios ausentes');
      }
      await dbRun(
        'INSERT INTO noticias (imagem, link, titulo, clicks, data_postagem) VALUES (?, ?, ?, ?, ?)',
        [imagem, link, titulo, clicks, data_postagem]
      );
      const newNoticia = { imagem, link, titulo, clicks, data_postagem };
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<noticias>\n';
      xml += '  <noticia>\n';
      xml += `    <imagem>${escapeXml(imagem)}</imagem>\n`;
      xml += `    <link>${escapeXml(link)}</link>\n`;
      xml += `    <titulo>${escapeXml(titulo)}</titulo>\n`;
      xml += `    <clicks>${escapeXml(clicks.toString())}</clicks>\n`;
      xml += `    <data_postagem>${escapeXml(data_postagem)}</data_postagem>\n`;
      xml += '  </noticia>\n';
      xml += '</noticias>';
      res.set('Content-Type', 'application/xml');
      return res.status(201).send(xml);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Erro no servidor');
    }
  });

  app.get('/noticias', async (req, res) => {
    try {
      const noticias = await dbAll(
        'SELECT imagem, link, titulo, clicks, data_postagem FROM noticias'
      );
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<noticias>\n';
      noticias.forEach((noticia) => {
        xml += '  <noticia>\n';
        xml += `    <imagem>${escapeXml(noticia.imagem)}</imagem>\n`;
        xml += `    <link>${escapeXml(noticia.link)}</link>\n`;
        xml += `    <titulo>${escapeXml(noticia.titulo)}</titulo>\n`;
        xml += `    <clicks>${escapeXml(noticia.clicks.toString())}</clicks>\n`;
        xml += `    <data_postagem>${escapeXml(noticia.data_postagem)}</data_postagem>\n`;
        xml += '  </noticia>\n';
      });
      xml += '</noticias>';
      res.set('Content-Type', 'application/xml');
      return res.send(xml);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Erro no servidor');
    }
  });
  // API de deletar notícia pelo ID
  app.delete('/noticias/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await dbRun('DELETE FROM noticias WHERE id = ?', [id]);
      if (result.changes === 0) {
        return res.status(404).send('Notícia não encontrada');
      }
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).send('Erro no servidor');
    }
  });
}