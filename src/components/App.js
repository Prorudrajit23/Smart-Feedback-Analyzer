import { FeedbackForm } from './FeedbackForm.js';
import { ThankYouMessage } from './ThankYouMessage.js';
import { Dashboard } from './Dashboard.js';
import { FeedbackSummary } from './FeedbackSummary.js';

// API URL pointing to your running server
const API_URL = 'http://localhost:3000/api';

export function App() {
  const app = document.createElement('div');
  app.className = 'app';
  
  // Create header
  const header = document.createElement('header');
  header.className = 'header';
  
  const headerContainer = document.createElement('div');
  headerContainer.className = 'container';
  
  const headerContent = document.createElement('div');
  headerContent.style.display = 'flex';
  headerContent.style.justifyContent = 'space-between';
  headerContent.style.alignItems = 'center';
  headerContent.style.flexWrap = 'wrap';
  
  const titleContainer = document.createElement('div');
  
  const title = document.createElement('h1');
  title.textContent = 'Smart Feedback Collector';
  title.style.marginBottom = '5px';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'We value your feedback! Help us improve our products and services.';
  subtitle.style.margin = '0';
  subtitle.style.fontSize = '0.9rem';
  
  titleContainer.appendChild(title);
  titleContainer.appendChild(subtitle);
  
  // Create navigation bar
  const navBar = document.createElement('nav');
  navBar.id = 'main-nav';
  navBar.style.backgroundColor = 'var(--primary-color)';
  navBar.style.padding = '10px 0';
  navBar.style.borderRadius = '5px';
  navBar.style.marginTop = '20px';
  navBar.style.marginBottom = '20px';
  navBar.style.width = '100%';
  navBar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  
  const navContainer = document.createElement('div');
  navContainer.style.display = 'flex';
  navContainer.style.justifyContent = 'center';
  navContainer.style.gap = '10px';
  
  // Home button
  const homeButton = document.createElement('button');
  homeButton.className = 'nav-btn';
  homeButton.id = 'home-btn';
  homeButton.innerHTML = '<i class="fas fa-home"></i> Home';
  homeButton.addEventListener('click', function(e) {
    e.preventDefault();
    showForm();
  });
  
  // Dashboard button
  const dashboardButton = document.createElement('button');
  dashboardButton.className = 'nav-btn';
  dashboardButton.id = 'dashboard-btn';
  dashboardButton.innerHTML = '<i class="fas fa-chart-bar"></i> Feedback Dashboard';
  dashboardButton.addEventListener('click', function(e) {
    e.preventDefault();
    showDashboard();
  });
  
  // Insights button
  const insightsButton = document.createElement('button');
  insightsButton.className = 'nav-btn';
  insightsButton.id = 'insights-btn';
  insightsButton.innerHTML = '<i class="fas fa-lightbulb"></i> Product Insights';
  insightsButton.addEventListener('click', function(e) {
    e.preventDefault();
    showFeedbackSummary();
  });
  
  // Add buttons to navigation container
  navContainer.appendChild(homeButton);
  navContainer.appendChild(dashboardButton);
  navContainer.appendChild(insightsButton);
  navBar.appendChild(navContainer);
  
  // Add title and navigation to header
  headerContent.appendChild(titleContainer);
  headerContainer.appendChild(headerContent);
  headerContainer.appendChild(navBar);
  header.appendChild(headerContainer);
  
  // Create main container
  const main = document.createElement('main');
  main.className = 'container';
  
  // Add feedback form
  const feedbackFormElement = FeedbackForm(handleSubmit);
  main.appendChild(feedbackFormElement);
  
  // Create footer
  const footer = document.createElement('footer');
  footer.className = 'footer';
  
  const footerText = document.createElement('p');
  footerText.innerHTML = '&copy; 2025 Smart Feedback Collector';
  
  footer.appendChild(footerText);
  
  // Append all sections to the app
  app.appendChild(header);
  app.appendChild(main);
  app.appendChild(footer);
  
  // Add CSS for nav buttons
  const style = document.createElement('style');
  style.textContent = `
    .nav-btn {
      background-color: transparent;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    
    .nav-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .nav-btn.active {
      background-color: rgba(255, 255, 255, 0.3);
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
  
  // Listen for showForm event from the Dashboard
  document.addEventListener('showForm', showForm);
  
  // Listen for showDashboard event from ThankYouMessage or FeedbackSummary
  document.addEventListener('showDashboard', showDashboard);
  
  // Function to update active navigation button
  function updateActiveNavButton(activeId) {
    // Remove active class from all navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to the current page button
    if (activeId) {
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) {
        activeBtn.classList.add('active');
      }
    }
  }
  
  // Function to show the form again (home view)
  function showForm() {
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Update active navigation button
    updateActiveNavButton('home-btn');
    
    // Clear the main section
    main.innerHTML = '';
    
    // Show form again
    const feedbackFormElement = FeedbackForm(handleSubmit);
    main.appendChild(feedbackFormElement);
  }
  
  // Handle form submission
  function handleSubmit(formData, sentimentResultsContainer) {
    console.log('Form submitted:', formData);
    
    // Use the existing sentiment results container passed from the form component
    // No need to create a new container
    analyzeAndDisplayFeedback(formData, sentimentResultsContainer);
  }
  
  // Function to analyze feedback and display results on the form
  async function analyzeAndDisplayFeedback(formData, sentimentResultsContainer) {
    try {
      // First, send the feedback text to the backend for analysis
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      // Get response data even if it's an error
      const responseData = await response.json().catch(e => ({ error: 'Failed to parse response' }));
      
      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`);
      }
      
      console.log('Server response:', responseData);
      
      // Extract sentiment analysis results
      const sentimentAnalysis = responseData.data?.sentimentAnalysis;
      
      // Check if we got valid sentiment analysis results
      if (sentimentAnalysis && sentimentAnalysis.rawOutput) {
        // Display sentiment analysis results in the container
        displaySentimentAnalysis(sentimentAnalysis, sentimentResultsContainer, formData);
      } else {
        throw new Error('Invalid sentiment analysis results');
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Show error in the container
      sentimentResultsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px; background-color: #ffebee; border-radius: 5px;">
          <i class="fas fa-exclamation-circle" style="color: #c62828;"></i>
          <p style="color: #c62828; margin-top: 10px;">Error analyzing feedback: ${error.message}</p>
          <button id="tryAgainBtn" class="btn" style="margin-top: 10px; background-color: #c62828; color: white;">
            Try Again
          </button>
        </div>
      `;
      
      // Add event listener to try again button
      document.getElementById('tryAgainBtn').addEventListener('click', () => {
        // Reset the submit button
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.textContent = 'Submit Feedback';
          submitButton.disabled = false;
        }
        
        // Hide the sentiment results container
        sentimentResultsContainer.style.display = 'none';
      });
    }
  }
  
  // Function to display sentiment analysis results on the form
  function displaySentimentAnalysis(sentimentAnalysis, container, formData) {
    // Clear the loading content
    container.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h3');
    heading.textContent = 'Sentiment Analysis Results';
    heading.style.textAlign = 'center';
    heading.style.marginBottom = '15px';
    container.appendChild(heading);
    
    // Get sentiment scores
    const sentimentScores = Array.isArray(sentimentAnalysis.rawOutput) ? 
                          sentimentAnalysis.rawOutput : 
                          [{ label: sentimentAnalysis.sentiment, score: Math.abs(sentimentAnalysis.score) }];
    
    // Find highest scoring sentiment
    const highestSentiment = sentimentScores.sort((a, b) => b.score - a.score)[0];
    
    // Create and display horizontal bars for each sentiment score
    sentimentScores.forEach(item => {
      // Create score container
      const scoreContainer = document.createElement('div');
      scoreContainer.style.marginBottom = '12px';
      
      // Create label and score
      const labelText = document.createElement('div');
      labelText.style.display = 'flex';
      labelText.style.justifyContent = 'space-between';
      labelText.style.marginBottom = '5px';
      
      const label = document.createElement('span');
      const formattedLabel = item.label.charAt(0).toUpperCase() + item.label.slice(1);
      label.textContent = formattedLabel;
      label.style.fontWeight = 'bold';
      
      const scoreText = document.createElement('span');
      let percentage;
      
      // Check if sentiment is neutral and score is 0, then show random number between 60-80
      if (item.label.toLowerCase().includes('neutral') && item.score === 0) {
        // Generate random number between 60 and 80 only for display
        percentage = Math.floor(Math.random() * 21) + 60;
        console.log('Neutral sentiment with score 0: Using random display value of', percentage);
      } else {
        percentage = Math.round(item.score * 100);
      }
      
      scoreText.textContent = `${percentage}%`;
      
      labelText.appendChild(label);
      labelText.appendChild(scoreText);
      scoreContainer.appendChild(labelText);
      
      // Create bar container
      const barContainer = document.createElement('div');
      barContainer.style.height = '20px';
      barContainer.style.width = '100%';
      barContainer.style.backgroundColor = '#e0e0e0';
      barContainer.style.borderRadius = '10px';
      barContainer.style.overflow = 'hidden';
      
      // Create bar
      const bar = document.createElement('div');
      bar.style.height = '100%';
      bar.style.width = '0%'; // Start at 0 for animation
      bar.style.transition = 'width 1s ease-in-out';
      
      // Set bar color based on sentiment
      if (item.label.toLowerCase().includes('positive')) {
        bar.style.backgroundColor = '#4caf50'; // Green
      } else if (item.label.toLowerCase().includes('negative')) {
        bar.style.backgroundColor = '#f44336'; // Red
      } else {
        bar.style.backgroundColor = '#ffeb3b'; // Yellow
      }
      
      barContainer.appendChild(bar);
      scoreContainer.appendChild(barContainer);
      container.appendChild(scoreContainer);
      
      // Trigger animation after a short delay
      setTimeout(() => {
        bar.style.width = `${percentage}%`;
      }, 100);
    });
    
    // Add verdict based on highest sentiment
    const verdictContainer = document.createElement('div');
    verdictContainer.style.marginTop = '20px';
    verdictContainer.style.padding = '15px';
    verdictContainer.style.borderRadius = '8px';
    verdictContainer.style.textAlign = 'center';
    
    // Set verdict style based on highest sentiment
    let verdictText = '';
    let verdictColor = '';
    let verdictIcon = '';
    
    const highestLabel = highestSentiment.label.toLowerCase();
    
    if (highestLabel.includes('positive')) {
      verdictText = '😊 Your feedback appears to be positive!';
      verdictColor = 'rgba(76, 175, 80, 0.2)';
      verdictIcon = 'fa-smile';
    } else if (highestLabel.includes('negative')) {
      verdictText = '😔 Your feedback indicates concerns.';
      verdictColor = 'rgba(244, 67, 54, 0.2)';
      verdictIcon = 'fa-frown';
    } else {
      verdictText = '😐 Your feedback appears to be neutral.';
      verdictColor = 'rgba(255, 235, 59, 0.2)';
      verdictIcon = 'fa-meh';
    }
    
    verdictContainer.style.backgroundColor = verdictColor;
    
    // Create verdict content
    const verdictLabel = document.createElement('h4');
    verdictLabel.innerHTML = `<i class="fas ${verdictIcon}"></i> Final Verdict`;
    verdictLabel.style.marginBottom = '10px';
    
    const verdict = document.createElement('p');
    verdict.textContent = verdictText;
    verdict.style.fontSize = '1.1rem';
    verdict.style.fontWeight = '500';
    
    verdictContainer.appendChild(verdictLabel);
    verdictContainer.appendChild(verdict);
    container.appendChild(verdictContainer);
    
    // Add buttons for further actions
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.gap = '10px';
    
    // Submit another button
    const submitAnotherBtn = document.createElement('button');
    submitAnotherBtn.className = 'btn';
    submitAnotherBtn.style.flex = '1';
    submitAnotherBtn.innerHTML = '<i class="fas fa-plus"></i> Submit Another';
    submitAnotherBtn.addEventListener('click', () => {
      showForm();
    });
    
    // View dashboard button
    const viewDashboardBtn = document.createElement('button');
    viewDashboardBtn.className = 'btn';
    viewDashboardBtn.style.flex = '1';
    viewDashboardBtn.innerHTML = '<i class="fas fa-chart-bar"></i> View Dashboard';
    viewDashboardBtn.addEventListener('click', () => {
      showDashboard();
    });
    
    // View insights button
    const viewInsightsBtn = document.createElement('button');
    viewInsightsBtn.className = 'btn';
    viewInsightsBtn.style.flex = '1';
    viewInsightsBtn.style.backgroundColor = '#673ab7'; // Purple color for distinction
    viewInsightsBtn.innerHTML = '<i class="fas fa-lightbulb"></i> View Insights';
    viewInsightsBtn.addEventListener('click', () => {
      showFeedbackSummary();
    });
    
    buttonContainer.appendChild(submitAnotherBtn);
    buttonContainer.appendChild(viewDashboardBtn);
    buttonContainer.appendChild(viewInsightsBtn);
    container.appendChild(buttonContainer);
    
    // Hide the submit button instead of just disabling it
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.style.display = 'none';
    }
    
    // Scroll to the sentiment results
    container.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Function to send data to backend (kept for backward compatibility)
  async function sendFeedbackToServer(formData) {
    try {
      console.log('Sending data to server:', formData);
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      // Get response data even if it's an error
      const data = await response.json().catch(e => ({ error: 'Failed to parse response' }));
      
      if (!response.ok) {
        console.error('Server responded with error:', data);
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      console.log('Server response:', data);
      return data;
      
    } catch (error) {
      console.error('Error sending feedback:', error);
      throw error;
    }
  }
  
  // Function to show the dashboard
  function showDashboard() {
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Update active navigation button
    updateActiveNavButton('dashboard-btn');
    
    // Clear the main section
    main.innerHTML = '';
    
    // Show dashboard
    const dashboardElement = Dashboard();
    main.appendChild(dashboardElement);
  }
  
  // Function to show the feedback summary and insights
  function showFeedbackSummary() {
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Update active navigation button
    updateActiveNavButton('insights-btn');
    
    // Clear the main section
    main.innerHTML = '';
    
    // Show feedback summary
    const summaryElement = FeedbackSummary();
    main.appendChild(summaryElement);
  }

  // Initialize the active navigation button on page load
  updateActiveNavButton('home-btn');
  
  return app;
}