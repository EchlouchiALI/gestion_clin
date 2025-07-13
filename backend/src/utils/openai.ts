import axios from 'axios';

export async function envoyerVersIA(texte: string): Promise<string> {
  if (!texte || texte.trim().length < 10) {
    throw new Error('❌ Le texte fourni est vide ou trop court pour être analysé.');
  }

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'mistralai/mixtral-8x7b',
      messages: [
        {
          role: 'user',
          content: `Voici une ordonnance médicale :\n\n"${texte}"\n\nExplique les médicaments, posologies et conseils pour un patient.`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}
