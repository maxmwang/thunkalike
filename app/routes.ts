import express from 'express';

const router = express.Router();

router.route('/checkName').get((req, res) => {
  const { code, username } = req.query as { code: string; username: string };

  console.log(code, username);

  if (!code || !username) {
    res.status(400).send({ error: { type: 'invalid', message: 'Invalid request' } });
    return;
  }

  if (!req.gm!.games[code]) {
    res.status(400).send({ error: { type: 'code', message: 'Game not found' } });
    return;
  }

  if (req.gm!.games[code].checkName(username)) {
    res.status(400).send({ error: { type: 'username', message: 'Username already taken' } });
  } else {
    res.status(200).send({ success: true });
  }
});

router.route('/game/create').post((req, res) => {
  const { username, mode } = req.body as { username: string, mode: string };
  if (!username) {
    res.status(400).send({ error: { type: 'username', message: 'Invalid request' } });
    return;
  }
  if (!mode) {
    res.status(400).send({ error: { type: 'mode', message: 'Invalid request' } });
    return;
  }

  let code;
  switch (mode) {
    case 'classic':
      code = req.gm!.createClassicGame(req.io!);
      break;
    case 'duet':
      // TODO: Implement duet mode
      break;
    default:
      res.status(400).send({ error: { type: 'mode', message: 'Invalid request' } });
      return;
  }

  res.status(200).send({ code });
});

export default router;
