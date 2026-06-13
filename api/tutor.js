export default async function handler(req, res) {
  // Securely pulls your hidden key from Vercel's infrastructure vault
  const key = process.env.GROQ_API_KEY; 
  
  if (!key) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY environment variable on Vercel backend." });
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
