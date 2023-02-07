import express from 'express';

const router = express.Router();

router.route('/checkName').get((req, res) => {
  const { code, name } = req.query as { code: string; name: string };

  if (!code || !name) {
    res.status(400).send({ error: 'Invalid request' });
    return;
  }

  if (!req.gm!.games[code]) {
    res.status(400).send({ error: 'Game not found' });
    return;
  }

  if (req.gm!.games[code].checkName(name)) {
    res.status(400).send({ error: 'Name already taken' });
  } else {
    res.status(200).send({ success: true });
  }
});

router.route('/game/create').post((req, res) => {
  const { name } = req.body as { name: string };
  if (!name) {
    res.status(400).send({ error: 'Invalid request' });
    return;
  }

  const code = req.gm!.createClassicGame(req.io!);

  res.status(200).send({ code });
});
