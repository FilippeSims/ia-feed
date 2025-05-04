export default function(app) {
  app.get('/on', (req, res) => {
    res.send('On!');
  });
}
