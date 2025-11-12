require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

// --- Security & Middleware ---
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json({ limit: '10mb' }));

// --- API Key Setup ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set. Please check your .env file.');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash-preview-09-2025' 
});

// --- API Endpoint: /analyze-image ---
app.post('/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'Missing imageBase64 or mimeType' });
    }
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };
    
    const prompt = "Analyze this food item and return ONLY a valid JSON object with foodName, calories, and a nutrients object (protein, fat, carbohydrates).";
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    console.log('--- Raw text from Gemini (Image) ---');
    console.log(text);
    console.log('--- End raw text (Image) ---');

    let jsonData;
    let jsonText;

    try {
      const markdownMatch = text.match(/```json([\s\S]*)```/);
      if (markdownMatch && markdownMatch[1]) {
        console.log('Found markdown JSON block, parsing...');
        jsonText = markdownMatch[1];
      } else {
        const rawJsonMatch = text.match(/\{[\s\S]*\}/);
        if (rawJsonMatch && rawJsonMatch[0]) {
          console.log('Found raw JSON object, parsing...');
          jsonText = rawJsonMatch[0];
        } else {
          console.log('No JSON of any kind found in response.');
          throw new Error('Gemini API returned non-JSON response.');
        }
      }
      
      console.log('--- Attempting to parse the following text as JSON: ---');
      console.log(jsonText);
      console.log('--- End of text to parse ---');
      
      const cleanedJsonText = jsonText.replace(/[^\S \t\r\n\f\v{}[\]":,0-9.truefalsenull-]/g, '');

      console.log('--- Attempting to parse CLEANED text: ---');
      console.log(cleanedJsonText);
      console.log('--- End of cleaned text ---');
      
      jsonData = JSON.parse(cleanedJsonText);

    } catch (parseError) {
      console.error('Failed to parse JSON from response:', parseError);
      console.error('--- Cleaned text that failed to parse: ---');
      console.error(cleanedJsonText);
      console.error('--- End of failed cleaned text ---');
      return res.status(500).json({ error: 'Gemini API returned malformed JSON.', details: text });
    }

    res.status(200).json(jsonData);

  } catch (error) {
    console.error('Error in /analyze-image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// --- REMOVED: /get-recommendation endpoint ---


app.listen(port, () => {
  console.log(`Dieter backend listening on http://localhost:${port}`);
});