// pages/api/medecin/me.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const apiRes = await fetch(`${process.env.BACKEND_URL}/admin/medecins/me/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
