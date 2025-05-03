# Smart Feedback Collector

A comprehensive feedback collection and analysis system that helps organizations gather, analyze, and extract valuable insights from customer feedback.

## Features

- **Feedback Collection**: Easy-to-use interface for collecting customer feedback
- **Sentiment Analysis**: Automatically analyze the sentiment of feedback using AI
- **Interactive Dashboard**: Visualize feedback trends and sentiment distribution
- **Feedback Management**: Organize and respond to feedback efficiently

## Project Structure

```
USECASE3/
  ├── backend/        # Node.js Express backend
  ├── public/         # Static assets
  └── src/
      ├── components/ # JavaScript components 
      │   ├── App.js
      │   ├── Dashboard.js
      │   ├── FeedbackForm.js
      │   ├── FeedbackSummary.js
      │   └── ThankYouMessage.js
      └── styles/     # CSS stylesheets
```

## Technologies Used

### Backend
- Node.js
- Express
- Hugging Face AI for sentiment analysis
- Supabase for database storage

### Frontend
- Vanilla JavaScript with component-based architecture
- Chart.js for data visualization
- Modern CSS with responsive design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Prorudrajit23/Feedback-Analyzer.git
   cd Feedback-Analyzer
   ```

2. Install frontend dependencies
   ```bash
   npm install
   ```

3. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```bash
   PORT=5000
   GENAI_API_KEY=your_google_genai_api_key
   GENAI_MODEL=gemini-2.0-flash
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

5. Start the development server
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from root directory)
   npm start
   ```

## Usage

1. Navigate to `http://localhost:3000` in your browser
2. Fill out the feedback form to submit new feedback
3. View the dashboard to see analysis and trends

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google for providing the Generative AI (Gemini) API
- Supabase for the database solution
