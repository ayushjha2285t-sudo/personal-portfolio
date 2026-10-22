export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Please enter a message" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are Ayush Jha's portfolio assistant. Ayush is a B.Tech CSE Core student at JECRC University. His listed skills include C++, beginner DSA, HTML, CSS, JavaScript, Python, and Cursor AI. Answer questions about his portfolio honestly. Do not invent qualifications or projects.",
            },
            {
              role: "user",
              content: message.slice(0, 2000),
            },
          ],
          temperature: 0.5,
          max_tokens: 500,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(502).json({ error: "AI service request failed" });
    }

    return res.status(200).json({
      reply:
        data.choices?.[0]?.message?.content || "No reply received.",
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
