// API URL - Update this to match your backend URL
const API_URL = 'http://localhost:3000/api';

export function Dashboard() {
  const dashboardElement = document.createElement('div');
  dashboardElement.className = 'dashboard fade-in';
  
  const dashboardTitle = document.createElement('h2');
  dashboardTitle.className = 'card-title';
  dashboardTitle.textContent = 'Feedback Analysis Dashboard';
  
  // Stats containers
  const statsContainer = document.createElement('div');
  statsContainer.className = 'stats-container';
  statsContainer.style.display = 'flex';
  statsContainer.style.gap = '20px';
  statsContainer.style.marginBottom = '30px';
  statsContainer.style.flexWrap = 'wrap';
  
  // Create stat cards
  const totalFeedbackCard = createStatCard('Total Feedback', '0', 'fas fa-comments');
  const positiveFeedbackCard = createStatCard('Positive Feedback', '0', 'fas fa-thumbs-up');
  const neutralFeedbackCard = createStatCard('Neutral Feedback', '0', 'fas fa-meh');
  const negativeFeedbackCard = createStatCard('Negative Feedback', '0', 'fas fa-thumbs-down');
  
  statsContainer.appendChild(totalFeedbackCard);
  statsContainer.appendChild(positiveFeedbackCard);
  statsContainer.appendChild(neutralFeedbackCard);
  statsContainer.appendChild(negativeFeedbackCard);
  
  // Chart container for sentiment distribution - FIXED HEIGHT
  const chartContainer = document.createElement('div');
  chartContainer.className = 'card';
  chartContainer.style.marginBottom = '30px';
  // Set a fixed height for the chart container
  chartContainer.style.height = '400px';
  chartContainer.style.position = 'relative';
  
  const chartTitle = document.createElement('h3');
  chartTitle.className = 'card-title';
  chartTitle.textContent = 'Sentiment Distribution';
  
  // Create a div with fixed dimensions to contain the canvas
  const chartWrapper = document.createElement('div');
  chartWrapper.style.height = '300px';
  chartWrapper.style.width = '100%';
  chartWrapper.style.position = 'relative';
  
  const chartCanvas = document.createElement('canvas');
  chartCanvas.id = 'sentimentChart';
  chartCanvas.style.maxHeight = '100%';
  
  chartWrapper.appendChild(chartCanvas);
  chartContainer.appendChild(chartTitle);
  chartContainer.appendChild(chartWrapper);
  
  // Feedback list
  const feedbackListContainer = document.createElement('div');
  feedbackListContainer.className = 'card';
  
  const feedbackListTitle = document.createElement('h3');
  feedbackListTitle.className = 'card-title';
  feedbackListTitle.textContent = 'Recent Feedback';
  
  const feedbackList = document.createElement('div');
  feedbackList.className = 'feedback-list';
  feedbackList.style.maxHeight = '400px';
  feedbackList.style.overflowY = 'auto';
  
  // Loading message
  const loadingMessage = document.createElement('p');
  loadingMessage.textContent = 'Loading feedback data...';
  feedbackList.appendChild(loadingMessage);
  
  feedbackListContainer.appendChild(feedbackListTitle);
  feedbackListContainer.appendChild(feedbackList);
  
  // Append all elements to the dashboard
  dashboardElement.appendChild(dashboardTitle);
  dashboardElement.appendChild(statsContainer);
  dashboardElement.appendChild(chartContainer);
  dashboardElement.appendChild(feedbackListContainer);
  
  // Remove the back button and button container since we now have the navigation bar
  
  // Fetch feedback data when the dashboard is created
  fetchFeedbackData()
    .then(feedbackData => {
      // Update dashboard with feedback data
      updateDashboard(feedbackData);
    })
    .catch(error => {
      console.error('Error fetching feedback data:', error);
      feedbackList.innerHTML = '<p>Error loading feedback data. Please try again later.</p>';
    });
  
  return dashboardElement;
  
  // Helper function to create stat cards
  function createStatCard(title, value, icon) {
    const card = document.createElement('div');
    card.className = 'card stat-card';
    card.style.flex = '1';
    card.style.minWidth = '200px';
    card.style.textAlign = 'center';
    card.style.padding = '20px';
    
    const iconElement = document.createElement('i');
    iconElement.className = icon;
    iconElement.style.fontSize = '2rem';
    iconElement.style.color = 'var(--primary-color)';
    iconElement.style.marginBottom = '10px';
    
    const titleElement = document.createElement('h4');
    titleElement.style.margin = '10px 0';
    titleElement.style.fontSize = '1rem';
    titleElement.style.color = 'var(--gray-color)';
    titleElement.textContent = title;
    
    const valueElement = document.createElement('p');
    valueElement.className = 'stat-value';
    valueElement.style.fontSize = '2rem';
    valueElement.style.fontWeight = 'bold';
    valueElement.style.color = 'var(--dark-color)';
    valueElement.textContent = value;
    
    card.appendChild(iconElement);
    card.appendChild(titleElement);
    card.appendChild(valueElement);
    
    return card;
  }
  
  // Helper function to fetch feedback data from the server
  async function fetchFeedbackData() {
    try {
      const response = await fetch(`${API_URL}/feedback`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }
  
  // Helper function to update the dashboard with feedback data
  function updateDashboard(feedbackData) {
    // Debug: Log the first feedback record to see its structure
    if (feedbackData.length > 0) {
      console.log('First feedback record:', feedbackData[0]);
    }
    
    // Update stats
    const totalFeedback = feedbackData.length;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let totalSentiment = 0;
    
    // Calculate stats
    feedbackData.forEach(feedback => {
      // Handle both camelCase and snake_case property names from database
      const sentimentAnalysis = feedback.sentimentAnalysis || feedback.sentiment_analysis;
      
      // Debug to help identify the structure
      console.log('Processing feedback:', feedback.feedback);
      console.log('Sentiment data:', sentimentAnalysis);
      
      // Check if sentiment is directly in the object or in a nested property
      let sentiment;
      let score = 0;
      
      if (sentimentAnalysis) {
        if (typeof sentimentAnalysis === 'string') {
          // If it's just a string value
          sentiment = sentimentAnalysis;
        } else if (typeof sentimentAnalysis === 'object') {
          // Extract from object
          sentiment = sentimentAnalysis.sentiment;
          score = sentimentAnalysis.score || 0;
          
          // If sentiment is still undefined, check if it's nested deeper
          if (!sentiment && sentimentAnalysis.rawOutput && Array.isArray(sentimentAnalysis.rawOutput)) {
            // Find the highest scoring sentiment from raw output
            const highestSentiment = [...sentimentAnalysis.rawOutput]
              .sort((a, b) => b.score - a.score)[0];
              
            if (highestSentiment) {
              if (highestSentiment.label.toLowerCase().includes('positive')) {
                sentiment = 'Positive';
              } else if (highestSentiment.label.toLowerCase().includes('negative')) {
                sentiment = 'Negative';
              } else {
                sentiment = 'Neutral';
              }
              
              score = highestSentiment.score;
              if (sentiment === 'Negative') score = -score;
            }
          }
        }
      }
      
      // Default to 'Unknown' if still not found
      if (!sentiment) {
        sentiment = 'Neutral';
      }
      
      totalSentiment += score;
      
      // Count by sentiment category
      if (sentiment === 'Positive') {
        positiveCount++;
      } else if (sentiment === 'Negative') {
        negativeCount++;
      } else {
        neutralCount++;
      }
    });
    
    // Log the counts for debugging
    console.log('Sentiment counts:', { positiveCount, neutralCount, negativeCount });
    
    // Calculate average sentiment
    const avgSentiment = totalFeedback > 0 ? (totalSentiment / totalFeedback).toFixed(2) : 'N/A';
    
    // Update stat cards
    updateStatCard('Total Feedback', totalFeedback);
    updateStatCard('Positive Feedback', positiveCount);
    updateStatCard('Neutral Feedback', neutralCount);
    updateStatCard('Negative Feedback', negativeCount);
    
    // Update feedback list
    updateFeedbackList(feedbackData);
    
    // Draw sentiment chart
    drawSentimentChart(positiveCount, neutralCount, negativeCount);
  }
  
  // Helper function to update a stat card
  function updateStatCard(title, value) {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
      const cardTitle = card.querySelector('h4').textContent;
      if (cardTitle === title) {
        card.querySelector('.stat-value').textContent = value;
      }
    });
  }
  
  // Helper function to update the feedback list
  function updateFeedbackList(feedbackData) {
    const feedbackList = document.querySelector('.feedback-list');
    feedbackList.innerHTML = '';
    
    if (feedbackData.length === 0) {
      const noFeedbackMessage = document.createElement('p');
      noFeedbackMessage.textContent = 'No feedback data available yet.';
      feedbackList.appendChild(noFeedbackMessage);
      return;
    }
    
    // Sort feedback by date, most recent first
    const sortedFeedback = [...feedbackData].sort((a, b) => {
      return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
    });
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'feedback-tabs';
    tabsContainer.style.borderBottom = '1px solid #eee';
    tabsContainer.style.display = 'flex';
    tabsContainer.style.marginBottom = '15px';
    
    // Create tab buttons
    const positiveTab = createTabButton('Positive', 'fas fa-thumbs-up', 'var(--success-color)');
    const neutralTab = createTabButton('Neutral', 'fas fa-meh', 'var(--warning-color)');
    const negativeTab = createTabButton('Negative', 'fas fa-thumbs-down', 'var(--danger-color)');
    
    // Set first tab as active by default
    positiveTab.classList.add('active');
    
    // Add tabs to container
    tabsContainer.appendChild(positiveTab);
    tabsContainer.appendChild(neutralTab);
    tabsContainer.appendChild(negativeTab);
    
    // Add tabs container to feedback list
    feedbackList.appendChild(tabsContainer);
    
    // Create content container for feedback items
    const feedbackContent = document.createElement('div');
    feedbackContent.className = 'feedback-content';
    feedbackList.appendChild(feedbackContent);
    
    // Categorize feedback by sentiment
    const positiveFeedback = [];
    const neutralFeedback = [];
    const negativeFeedback = [];
    
    sortedFeedback.forEach(feedback => {
      // Handle both camelCase and snake_case property names from database
      const sentimentAnalysis = feedback.sentimentAnalysis || feedback.sentiment_analysis;
      let sentiment = 'Unknown';
      
      if (sentimentAnalysis) {
        if (typeof sentimentAnalysis === 'string') {
          sentiment = sentimentAnalysis;
        } else if (typeof sentimentAnalysis === 'object') {
          sentiment = sentimentAnalysis.sentiment || 'Unknown';
          
          // If sentiment is still undefined, check if it's nested deeper
          if (sentiment === 'Unknown' && sentimentAnalysis.rawOutput && Array.isArray(sentimentAnalysis.rawOutput)) {
            const highestSentiment = [...sentimentAnalysis.rawOutput]
              .sort((a, b) => b.score - a.score)[0];
              
            if (highestSentiment) {
              if (highestSentiment.label.toLowerCase().includes('positive')) {
                sentiment = 'Positive';
              } else if (highestSentiment.label.toLowerCase().includes('negative')) {
                sentiment = 'Negative';
              } else {
                sentiment = 'Neutral';
              }
            }
          }
        }
      }
      
      // Categorize based on sentiment
      if (sentiment === 'Positive') {
        positiveFeedback.push(feedback);
      } else if (sentiment === 'Negative') {
        negativeFeedback.push(feedback);
      } else {
        neutralFeedback.push(feedback);
      }
    });
    
    // Initial display - show positive feedback by default
    displayFeedbackItems(positiveFeedback);
    
    // Add click event listeners to tabs
    positiveTab.addEventListener('click', () => {
      setActiveTab(positiveTab);
      displayFeedbackItems(positiveFeedback);
    });
    
    neutralTab.addEventListener('click', () => {
      setActiveTab(neutralTab);
      displayFeedbackItems(neutralFeedback);
    });
    
    negativeTab.addEventListener('click', () => {
      setActiveTab(negativeTab);
      displayFeedbackItems(negativeFeedback);
    });
    
    // Helper function to create tab buttons
    function createTabButton(label, iconClass, color) {
      const tab = document.createElement('div');
      tab.className = 'feedback-tab';
      tab.style.padding = '10px 15px';
      tab.style.cursor = 'pointer';
      tab.style.flex = '1';
      tab.style.textAlign = 'center';
      tab.style.transition = 'all 0.3s ease';
      
      const icon = document.createElement('i');
      icon.className = iconClass;
      icon.style.marginRight = '5px';
      icon.style.color = color;
      
      tab.appendChild(icon);
      tab.appendChild(document.createTextNode(label));
      
      // Hover effect
      tab.addEventListener('mouseover', () => {
        if (!tab.classList.contains('active')) {
          tab.style.backgroundColor = '#f5f5f5';
        }
      });
      
      tab.addEventListener('mouseout', () => {
        if (!tab.classList.contains('active')) {
          tab.style.backgroundColor = 'transparent';
        }
      });
      
      return tab;
    }
    
    // Helper function to set active tab
    function setActiveTab(activeTab) {
      // Remove active class from all tabs
      document.querySelectorAll('.feedback-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.backgroundColor = 'transparent';
        tab.style.borderBottom = 'none';
      });
      
      // Add active class to clicked tab
      activeTab.classList.add('active');
      activeTab.style.backgroundColor = '#f9f9f9';
      activeTab.style.borderBottom = '3px solid var(--primary-color)';
    }
    
    // Helper function to display feedback items for a category
    function displayFeedbackItems(feedbackArray) {
      const feedbackContent = document.querySelector('.feedback-content');
      feedbackContent.innerHTML = '';
      
      if (feedbackArray.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No feedback in this category.';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '20px';
        feedbackContent.appendChild(emptyMessage);
        return;
      }
      
      feedbackArray.forEach(feedback => {
        const feedbackItem = createFeedbackItem(feedback);
        feedbackContent.appendChild(feedbackItem);
      });
    }
    
    // Helper function to create feedback item
    function createFeedbackItem(feedback) {
      const feedbackItem = document.createElement('div');
      feedbackItem.className = 'feedback-item';
      feedbackItem.style.padding = '15px';
      feedbackItem.style.borderBottom = '1px solid #eee';
      
      // Handle both camelCase and snake_case property names from database
      const sentimentAnalysis = feedback.sentimentAnalysis || feedback.sentiment_analysis;
      let sentiment = 'Unknown';
      
      if (sentimentAnalysis) {
        if (typeof sentimentAnalysis === 'string') {
          sentiment = sentimentAnalysis;
        } else if (typeof sentimentAnalysis === 'object') {
          sentiment = sentimentAnalysis.sentiment || 'Unknown';
          
          // If sentiment is still undefined, check if it's nested deeper
          if (sentiment === 'Unknown' && sentimentAnalysis.rawOutput && Array.isArray(sentimentAnalysis.rawOutput)) {
            const highestSentiment = [...sentimentAnalysis.rawOutput]
              .sort((a, b) => b.score - a.score)[0];
              
            if (highestSentiment) {
              if (highestSentiment.label.toLowerCase().includes('positive')) {
                sentiment = 'Positive';
              } else if (highestSentiment.label.toLowerCase().includes('negative')) {
                sentiment = 'Negative';
              } else {
                sentiment = 'Neutral';
              }
            }
          }
        }
      }
      
      let sentimentColor = 'var(--gray-color)';
      let sentimentIcon = 'fas fa-meh';
      
      if (sentiment === 'Positive') {
        sentimentColor = 'var(--success-color)';
        sentimentIcon = 'fas fa-smile';
      } else if (sentiment === 'Negative') {
        sentimentColor = 'var(--danger-color)';
        sentimentIcon = 'fas fa-frown';
      }
      
      // User info section
      const userInfo = document.createElement('div');
      userInfo.style.display = 'flex';
      userInfo.style.justifyContent = 'space-between';
      userInfo.style.marginBottom = '10px';
      
      // User name and email
      const userDetails = document.createElement('div');
      
      const userName = document.createElement('strong');
      userName.textContent = feedback.name || 'Anonymous';
      
      const userEmail = document.createElement('div');
      userEmail.style.fontSize = '0.9em';
      userEmail.style.color = 'var(--gray-color)';
      userEmail.style.marginTop = '2px';
      userEmail.textContent = feedback.email || 'No email provided';
      
      // Product information
      const productInfo = document.createElement('div');
      productInfo.style.fontSize = '0.9em';
      productInfo.style.marginTop = '4px';
      
      const productIcon = document.createElement('i');
      productIcon.className = 'fas fa-box-open';
      productIcon.style.marginRight = '5px';
      productIcon.style.color = 'var(--primary-color)';
      
      productInfo.appendChild(productIcon);
      productInfo.appendChild(document.createTextNode(feedback.product || 'No product specified'));
      
      userDetails.appendChild(userName);
      userDetails.appendChild(userEmail);
      userDetails.appendChild(productInfo);
      
      // Rating display
      const rating = document.createElement('span');
      rating.style.color = 'var(--primary-color)';
      
      // Display stars based on rating
      const ratingValue = parseInt(feedback.rating) || 0;
      let stars = '';
      for (let i = 0; i < ratingValue; i++) {
        stars += '★';
      }
      for (let i = ratingValue; i < 5; i++) {
        stars += '☆';
      }
      rating.textContent = stars;
      
      userInfo.appendChild(userDetails);
      userInfo.appendChild(rating);
      
      // Feedback text
      const feedbackText = document.createElement('p');
      feedbackText.textContent = feedback.feedback;
      feedbackText.style.marginBottom = '10px';
      
      // Footer section (sentiment and date)
      const footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.justifyContent = 'space-between';
      footer.style.alignItems = 'center';
      footer.style.fontSize = '0.9rem';
      
      // Sentiment badge
      const sentimentBadge = document.createElement('span');
      sentimentBadge.innerHTML = `<i class="${sentimentIcon}" style="color: ${sentimentColor}"></i> ${sentiment}`;
      sentimentBadge.style.padding = '3px 8px';
      sentimentBadge.style.borderRadius = '10px';
      sentimentBadge.style.backgroundColor = `${sentimentColor}20`;
      
      // Date
      const date = document.createElement('span');
      date.textContent = new Date(feedback.created_at || feedback.createdAt).toLocaleDateString();
      date.style.color = 'var(--gray-color)';
      
      footer.appendChild(sentimentBadge);
      footer.appendChild(date);
      
      // Assemble all parts
      feedbackItem.appendChild(userInfo);
      feedbackItem.appendChild(feedbackText);
      feedbackItem.appendChild(footer);
      
      return feedbackItem;
    }
  }
  
  // Helper function to draw sentiment chart - modified to use already loaded Chart.js
  function drawSentimentChart(positive, neutral, negative) {
    try {
      console.log('Creating chart with data:', { positive, neutral, negative });
      
      // Get the chart canvas
      const canvas = document.getElementById('sentimentChart');
      const ctx = canvas.getContext('2d');
      
      // Check if we have data to display
      if (positive === 0 && neutral === 0 && negative === 0) {
        // No data scenario
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'No sentiment data available yet.';
        noDataMessage.style.textAlign = 'center';
        noDataMessage.style.padding = '20px';
        canvas.parentNode.replaceChild(noDataMessage, canvas);
        return;
      }
      
      // Create the chart using the globally available Chart object
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Positive', 'Neutral', 'Negative'],
          datasets: [{
            data: [positive, neutral, negative],
            backgroundColor: [
              '#4caf50', // Green for positive
              '#ffeb3b', // Yellow for neutral
              '#f44336'  // Red for negative
            ],
            borderColor: 'white',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Error creating chart. Please try again later.';
      errorMessage.style.color = 'var(--danger-color)';
      errorMessage.style.textAlign = 'center';
      
      const canvas = document.getElementById('sentimentChart');
      canvas.parentNode.insertBefore(errorMessage, canvas);
    }
  }
}