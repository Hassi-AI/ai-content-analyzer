export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get content from request body
  const { content } = req.body;

  // Validate input
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Content is required" });
  }

  if (content.trim().length < 20) {
    return res.status(400).json({ error: "Content too short. Please provide at least 20 characters." });
  }

  // Structured AI Prompt
  const prompt = `
You are a professional content analyst and SEO expert. Analyze the following content and provide a detailed structured report.

CONTENT TO ANALYZE:
"""
${content}
"""

Provide your analysis in the following EXACT JSON format only, no extra text:

{
  "summary": "A clear 2-3 sentence summary of what this content is about",
  "tone": {
    "primary": "Main tone (e.g., Formal, Casual, Persuasive, Informative, Emotional)",
    "secondary": "Secondary tone if any",
    "explanation": "Brief explanation of why this tone was identified"
  },
  "readability": {
    "level": "Level (e.g., Beginner, Intermediate, Advanced, Expert)",
    "score": "Score out of 10",
    "explanation": "Why this readability level was assigned"
  },
  "seo": {
    "score": "SEO score out of 10",
    "strengths": ["strength 1", "strength 2"],
    "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
  },
  "improvements": {
    "structure": ["improvement 1", "improvement 2"],
    "content": ["improvement 1", "improvement 2"],
    "engagement": ["improvement 1", "improvement 2"]
  },
  "wordCount": "number of words in content",
  "sentiment": "Overall sentiment (Positive, Negative, Neutral, Mixed)"
}
`;

  try {
    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a professional content analyst. Always respond with valid JSON only. No markdown, no extra text, just pure JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    // Handle Groq API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      return res.status(500).json({ 
        error: "AI service error. Please try again.",
        details: errorData.error?.message || "Unknown error"
      });
    }

    const data = await response.json();
    
    // Extract AI response text
    const aiText = data.choices[0]?.message?.content;

    if (!aiText) {
      return res.status(500).json({ error: "No response from AI. Please try again." });
    }

    // Clean and parse JSON response
    const cleanedText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return res.status(500).json({ 
        error: "Could not parse AI response. Please try again." 
      });
    }

    // Send successful response
    return res.status(200).json({ 
      success: true, 
      analysis 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ 
      error: "Internal server error. Please try again.",
      details: error.message 
    });
  }
}