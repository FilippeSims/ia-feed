import express from 'express';
import { dbAll, dbRun } from '../app/db.js';

const router = express.Router();

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || '@iafeed123';

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/admin/login');
}

// Login
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.authenticated = true;
    return res.redirect('/admin/noticias');
  }
  res.render('admin/login', { error: 'Credenciais inválidas' });
});
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Lista notícias
router.get('/noticias', requireAuth, async (req, res) => {
  try {
    const noticias = await dbAll('SELECT * FROM noticias ORDER BY id DESC');
    res.render('admin/noticias_list', { noticias });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar notícias');
  }
});

// Nova notícia
router.get('/noticias/new', requireAuth, (req, res) => {
  res.render('admin/noticia_form', { noticia: {} });
});
router.post('/noticias/new', requireAuth, async (req, res) => {
  try {
    const { imagem, link, titulo, clicks, data_postagem } = req.body;
    await dbRun(
      'INSERT INTO noticias (imagem, link, titulo, clicks, data_postagem) VALUES (?, ?, ?, ?, ?)',
      [imagem, link, titulo, clicks, data_postagem]
    );
    res.redirect('/admin/noticias');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar notícia');
  }
});

// Editar notícia
router.get('/noticias/:id/edit', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await dbAll('SELECT * FROM noticias WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).send('Notícia não encontrada');
    }
    const noticia = rows[0];
    res.render('admin/noticia_form', { noticia });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar notícia');
  }
});
router.post('/noticias/:id/edit', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { imagem, link, titulo, clicks, data_postagem } = req.body;
    await dbRun(
      'UPDATE noticias SET imagem = ?, link = ?, titulo = ?, clicks = ?, data_postagem = ? WHERE id = ?',
      [imagem, link, titulo, clicks, data_postagem, id]
    );
    res.redirect('/admin/noticias');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar notícia');
  }
});

// Excluir notícia
router.post('/noticias/:id/delete', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM noticias WHERE id = ?', [id]);
    res.redirect('/admin/noticias');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir notícia');
  }
});

export default router;