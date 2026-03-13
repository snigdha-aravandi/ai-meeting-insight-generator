const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required' });
    }

    // Securely get the API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Use the flash model for speed and efficiency
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // System instruction ensures the output is ALWAYS valid JSON
            systemInstruction: "You are an AI meeting assistant. Extract structured information from meeting transcripts and return ONLY valid JSON."
        });

        const prompt = `
Extract meeting insights from the following transcript:

"${transcript}"

Requirements:
1. Return a valid JSON object.
2. The summary must contain 3-5 concise bullet points.
3. Extract clear action items/tasks.
4. Identify owners and deadlines for each task.
5. Assign a priority to each task based on these rules:
   - High: Urgent tasks or deadlines within a few days.
   - Medium: Important but not urgent.
   - Low: Optional or long-term tasks.
6. If owner or deadline is missing, return "Not specified".

JSON Format:
{
  "summary": ["point1", "point2", "point3"],
  "action_items": [
    {
      "task": "item description",
      "owner": "name or 'Not specified'",
      "deadline": "date or 'Not specified'",
      "priority": "High | Medium | Low"
    }
  ]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Basic JSON extraction in case the AI adds markdown formatting
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonContent = jsonMatch ? jsonMatch[0] : text;
        
        try {
            const data = JSON.parse(jsonContent);
            res.status(200).json(data);
        } catch (parseError) {
            console.error("JSON Parse Error:", text);
            throw new Error("AI returned malformed JSON content.");
        }
    } catch (error) {
        console.error('Server-side AI Error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to process transcript on the server' 
        });
    }
};
