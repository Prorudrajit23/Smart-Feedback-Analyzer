const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini API configuration
const GENAI_API_KEY = process.env.GENAI_API_KEY;
const MODEL_NAME = process.env.GENAI_MODEL || "gemini-2.0-flash";
const GENAI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.get('/', (req, res) => {
  res.send('Smart Feedback Collector API is running');
});

// API endpoint to get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error reading feedback data:', error);
    res.status(500).json({ error: 'Error retrieving feedback data' });
  }
});

// API endpoint to submit new feedback
app.post('/api/feedback', async (req, res) => {
  try {
    // Get feedback data from request body
    const feedbackData = req.body;
    
    // Validate required fields
    if (!feedbackData.feedback) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }
    
    // Analyze sentiment using Gemini API
    let sentimentAnalysis;
    try {
      sentimentAnalysis = await analyzeSentimentWithGeminiAPI(feedbackData.feedback);
    } catch (sentimentError) {
      console.error('Error analyzing sentiment:', sentimentError);
      // Continue with neutral sentiment if analysis fails
      sentimentAnalysis = {
        sentiment: 'Neutral',
        score: 0,
        error: sentimentError.message || 'Sentiment analysis failed'
      };
    }
    
    // Add sentiment analysis to feedback data
    const enrichedFeedback = {
      ...feedbackData,
      timestamp: new Date().toISOString(),
      sentimentAnalysis,
      createdAt: new Date().toISOString()
    };
    
    // Store feedback data
    try {
      const result = await storeFeedback(enrichedFeedback);
      
      res.status(201).json({
        message: 'Feedback submitted successfully',
        data: result
      });
    } catch (storageError) {
      console.error('Storage error details:', storageError);
      res.status(500).json({ 
        error: 'Error storing feedback in database',
        details: storageError.message || 'Unknown database error' 
      });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Error submitting feedback', 
      details: error.message || 'Unknown error'
    });
  }
});

// API endpoint to get feedback summaries by product
app.get('/api/feedback/summaries', async (req, res) => {
  try {
    // Get all feedback data from Supabase
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Group feedback by product
    const feedbackByProduct = {};
    data.forEach(feedback => {
      const product = feedback.product || 'Unknown Product';
      if (!feedbackByProduct[product]) {
        feedbackByProduct[product] = [];
      }
      feedbackByProduct[product].push(feedback);
    });
    
    // Generate summaries and suggestions for each product
    const summaries = [];
    for (const [product, productFeedback] of Object.entries(feedbackByProduct)) {
      if (productFeedback.length > 0) {
        try {
          const summary = await generateFeedbackSummary(product, productFeedback);
          summaries.push({
            product,
            feedbackCount: productFeedback.length,
            summary
          });
        } catch (summaryError) {
          console.error(`Error generating summary for ${product}:`, summaryError);
          summaries.push({
            product,
            feedbackCount: productFeedback.length,
            error: `Failed to generate summary: ${summaryError.message}`
          });
        }
      }
    }
    
    res.json(summaries);
  } catch (error) {
    console.error('Error generating feedback summaries:', error);
    res.status(500).json({ error: 'Error generating feedback summaries' });
  }
});

// Function to analyze sentiment with Gemini API
async function analyzeSentimentWithGeminiAPI(text) {
  try {
    console.log(`Analyzing sentiment for text: "${text}"`);
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GENAI_API_KEY}`;
    
    // Format request payload according to Gemini API requirements
    const requestBody = {
      contents: [{
        parts: [{
          text: `Analyze the sentiment of the following text and categorize it as "Positive", "Negative", or "Neutral". 
          Also provide a sentiment score between -1.0 (very negative) and 1.0 (very positive), where 0 is neutral.
          Format the response as a JSON object with keys for "sentiment" and "score".
          
          Text to analyze: "${text}"`
        }]
      }]
    };
    
    // Make a request to the Gemini API
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Gemini API response:", JSON.stringify(response.data, null, 2));
    
    // Extract the text content from the response
    let textContent = '';
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts[0]) {
      textContent = response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
    
    // Extract JSON from the response
    let parsedResponse;
    try {
      // Try to parse the entire response as JSON
      parsedResponse = JSON.parse(textContent);
    } catch (parseError) {
      // If that fails, try to extract JSON from the text response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON from response");
      }
    }
    
    // Validate and standardize the response
    if (parsedResponse && parsedResponse.sentiment && typeof parsedResponse.score === 'number') {
      return {
        sentiment: parsedResponse.sentiment,
        score: parsedResponse.score,
        rawOutput: textContent
      };
    } else {
      // Fallback parsing if the structure is unexpected
      const sentiment = textContent.toLowerCase().includes('positive') ? 'Positive' : 
                        textContent.toLowerCase().includes('negative') ? 'Negative' : 'Neutral';
                        
      const scoreMatch = textContent.match(/-?\d+(\.\d+)?/);
      const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0;
      
      return {
        sentiment,
        score,
        rawOutput: textContent
      };
    }
  } catch (error) {
    console.error("Error analyzing sentiment with Gemini API:", error);
    return {
      sentiment: "Neutral",
      score: 0,
      error: error.message || "Error analyzing sentiment"
    };
  }
}

// Function to generate feedback summary and suggestions using Gemini API
async function generateFeedbackSummary(product, feedbackList) {
  try {
    console.log(`Generating summary for ${product} with ${feedbackList.length} feedback entries`);
    
    // Prepare feedback data in a structured format
    const feedbackData = feedbackList.map(item => ({
      text: item.feedback,
      rating: item.rating || 'N/A',
      sentiment: item.sentiment_analysis?.sentiment || 'Unknown'
    }));
    
    // Create a maximum of 10 feedback entries to avoid exceeding token limits
    const limitedFeedback = feedbackData.slice(0, 10);
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GENAI_API_KEY}`;
    
    // Format request payload with detailed instructions for Gemini
    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a product feedback analyst for a company that sells consumer electronics. 
          I want you to analyze user feedback for the product "${product}" and provide:
          
          1. A concise summary of the key points from user feedback (3-5 bullet points)
          2. Major strengths of the product based on positive feedback
          3. Major areas of improvement based on negative feedback
          4. Specific actionable suggestions for product improvements
          5. Suggestions for new features based on user needs
          
          Format the response as a JSON object with these keys:
          - "summary": array of summary bullet points
          - "strengths": array of product strengths
          - "improvements": array of areas needing improvement
          - "suggestions": array of specific actionable suggestions
          - "newFeatures": array of new feature ideas
          
          Here is the feedback data:
          ${JSON.stringify(limitedFeedback, null, 2)}
          
          Only include suggestions that are directly supported by the feedback. If there's not enough data to make recommendations in any area, include an empty array for that field.`
        }]
      }]
    };
    
    // Make the request to Gemini API
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Extract and parse the response
    let textContent = '';
    if (response.data?.candidates?.[0]?.content?.parts?.[0]) {
      textContent = response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
    
    // Extract JSON from the response
    let parsedResponse;
    try {
      // Try to parse the entire response as JSON
      parsedResponse = JSON.parse(textContent);
    } catch (parseError) {
      // If that fails, try to extract JSON from the text response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON from response");
      }
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error generating feedback summary:", error);
    throw error;
  }
}

// Function to store feedback in Supabase
async function storeFeedback(feedback) {
  try {
    console.log("Trying to store feedback in Supabase:", feedback);
    
    // Prepare data to match PostgreSQL's snake_case convention
    // Only include fields that exist in our database schema
    const dbFeedback = {
      name: feedback.name || null,
      email: feedback.email || null,
      product: feedback.product || null,  // Add the new product field
      rating: feedback.rating ? parseInt(feedback.rating, 10) || null : null,
      feedback: feedback.feedback,
      timestamp: new Date().toISOString(),
      sentiment_analysis: feedback.sentimentAnalysis || null,
      created_at: new Date().toISOString()
    };
    
    console.log("Prepared database feedback object:", dbFeedback);
    
    // First check if the table exists
    const { error: tableError } = await supabase
      .from('feedback')
      .select('id')
      .limit(1);
      
    if (tableError) {
      console.error("Table might not exist:", tableError);
      throw new Error(`Database table issue: ${tableError.message}`);
    }
    
    // Attempt to insert the data
    const { data, error } = await supabase
      .from('feedback')
      .insert([dbFeedback])
      .select();
    
    if (error) {
      console.error("Insert error details:", error);
      throw error;
    }
    
    console.log("Successfully stored feedback:", data);
    
    // Map the response back to camelCase for consistency in the app
    if (data && data[0]) {
      return {
        ...data[0],
        sentimentAnalysis: data[0].sentiment_analysis || null,
        createdAt: data[0].created_at || null
      };
    }
    
    return data?.[0] || dbFeedback;
  } catch (error) {
    console.error('Error storing feedback:', error);
    throw error;
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Using Supabase for data storage`);
  console.log(`Using Gemini API model: ${MODEL_NAME}`);
});