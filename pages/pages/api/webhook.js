// This is a placeholder. We'll fill it in on Day 3.
export default function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === 'my_verify_token_123') {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  res.status(200).json({ status: 'webhook alive' });
}
