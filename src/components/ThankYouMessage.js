export function ThankYouMessage(sentimentAnalysis) {
  const thankYouElement = document.createElement('div');
  thankYouElement.className = 'card fade-in';
  
  const icon = document.createElement('div');
  icon.innerHTML = '<i class="fas fa-check-circle" style="font-size: 4rem; color: var(--success-color); display: block; text-align: center; margin-bottom: 20px;"></i>';
  
  const title = document.createElement('h2');
  title.className = 'card-title';
  title.style.textAlign = 'center';
  title.textContent = 'Thank You for Your Feedback!';
  
  const message = document.createElement('p');
  message.style.textAlign = 'center';
  message.style.fontSize = '1.1rem';
  message.style.marginBottom = '30px';
  message.textContent = 'Your feedback has been submitted successfully. We appreciate your input and will use it to improve our products and services.';
  
  // Add sentiment analysis visualization if available
  if (sentimentAnalysis && sentimentAnalysis.rawOutput) {
    // Create container for sentiment analysis
    const sentimentContainer = document.createElement('div');
    sentimentContainer.className = 'sentiment-analysis-container';
    sentimentContainer.style.marginBottom = '30px';
    sentimentContainer.style.padding = '20px';
    sentimentContainer.style.backgroundColor = '#f9f9f9';
    sentimentContainer.style.borderRadius = '8px';
    
    // Create heading for sentiment analysis
    const sentimentTitle = document.createElement('h3');
    sentimentTitle.textContent = 'Your Feedback Sentiment Analysis';
    sentimentTitle.style.textAlign = 'center';
    sentimentTitle.style.marginBottom = '20px';
    sentimentContainer.appendChild(sentimentTitle);
    
    // Get the sentiment scores from the analysis
    const sentimentScores = Array.isArray(sentimentAnalysis.rawOutput) ? 
                          sentimentAnalysis.rawOutput : 
                          [{ label: sentimentAnalysis.sentiment, score: Math.abs(sentimentAnalysis.score) }];
    
    console.log('Sentiment scores for visualization:', sentimentScores);
    
    // Find the highest scoring sentiment for the verdict
    let highestScore = 0;
    let highestLabel = '';
    
    // Create and append visualization for each sentiment score
    sentimentScores.forEach(item => {
      if (!item || typeof item !== 'object') return;
      
      // Track highest score for verdict
      if (item.score > highestScore) {
        highestScore = item.score;
        highestLabel = item.label;
      }
      
      // Create label container
      const scoreContainer = document.createElement('div');
      scoreContainer.style.marginBottom = '15px';
      
      // Create label
      const labelText = document.createElement('div');
      labelText.style.display = 'flex';
      labelText.style.justifyContent = 'space-between';
      labelText.style.marginBottom = '5px';
      
      const label = document.createElement('span');
      // Capitalize the first letter
      const formattedLabel = item.label.charAt(0).toUpperCase() + item.label.slice(1);
      label.textContent = formattedLabel;
      label.style.fontWeight = 'bold';
      
      const scoreText = document.createElement('span');
      // Format the score as a percentage
      const percentage = Math.round(item.score * 100);
      scoreText.textContent = `${percentage}%`;
      
      labelText.appendChild(label);
      labelText.appendChild(scoreText);
      scoreContainer.appendChild(labelText);
      
      // Create bar container
      const barContainer = document.createElement('div');
      barContainer.style.height = '24px';
      barContainer.style.width = '100%';
      barContainer.style.backgroundColor = '#e0e0e0';
      barContainer.style.borderRadius = '12px';
      barContainer.style.overflow = 'hidden';
      
      // Create the bar with the score percentage
      const bar = document.createElement('div');
      bar.style.height = '100%';
      bar.style.width = `${percentage}%`;
      bar.style.borderRadius = '12px';
      
      // Set different colors based on sentiment
      if (item.label.toLowerCase().includes('positive')) {
        bar.style.backgroundColor = '#4caf50'; // Green for positive
      } else if (item.label.toLowerCase().includes('negative')) {
        bar.style.backgroundColor = '#f44336'; // Red for negative
      } else {
        bar.style.backgroundColor = '#ffeb3b'; // Yellow for neutral
      }
      
      // Add transition effect
      bar.style.transition = 'width 1s ease-in-out';
      
      barContainer.appendChild(bar);
      scoreContainer.appendChild(barContainer);
      
      // Add to the sentiment container
      sentimentContainer.appendChild(scoreContainer);
    });
    
    // Add verdict based on highest scoring sentiment
    const verdictContainer = document.createElement('div');
    verdictContainer.style.marginTop = '25px';
    verdictContainer.style.padding = '15px';
    verdictContainer.style.borderRadius = '8px';
    verdictContainer.style.textAlign = 'center';
    
    // Set verdict style based on sentiment
    let verdictText = '';
    let verdictColor = '';
    let verdictIcon = '';
    
    // Get the overall sentiment from the analyzed result
    const overallSentiment = sentimentAnalysis.sentiment || 'Neutral';
    
    if (overallSentiment === 'Positive') {
      verdictText = '😊 Feedback is generally positive!';
      verdictColor = 'rgba(76, 175, 80, 0.2)'; // Light green
      verdictIcon = 'fa-smile';
    } else if (overallSentiment === 'Negative') {
      verdictText = '😔 Feedback indicates concerns.';
      verdictColor = 'rgba(244, 67, 54, 0.2)'; // Light red
      verdictIcon = 'fa-frown';
    } else {
      verdictText = '😐 Feedback appears to be neutral.';
      verdictColor = 'rgba(255, 235, 59, 0.2)'; // Light yellow
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
    
    // Add to sentiment container
    sentimentContainer.appendChild(verdictContainer);
    
    // Add sentiment container to the thank you message
    thankYouElement.appendChild(sentimentContainer);
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.gap = '15px';
  
  const returnButton = document.createElement('button');
  returnButton.className = 'btn';
  returnButton.innerHTML = '<i class="fas fa-plus"></i> Submit Another Feedback';
  
  // Add event listener to go to form without page refresh
  returnButton.addEventListener('click', (e) => {
    e.preventDefault();
    const event = new CustomEvent('showForm');
    document.dispatchEvent(event);
  });
  
  const viewDashboardButton = document.createElement('button');
  viewDashboardButton.className = 'btn';
  viewDashboardButton.innerHTML = '<i class="fas fa-chart-bar"></i> View Dashboard';
  
  // Add event listener to view dashboard
  viewDashboardButton.addEventListener('click', (e) => {
    e.preventDefault();
    const event = new CustomEvent('showDashboard');
    document.dispatchEvent(event);
  });
  
  // Append buttons to container
  buttonContainer.appendChild(returnButton);
  buttonContainer.appendChild(viewDashboardButton);
  
  // Append all elements to the container
  thankYouElement.appendChild(icon);
  thankYouElement.appendChild(title);
  thankYouElement.appendChild(message);
  thankYouElement.appendChild(buttonContainer);
  
  return thankYouElement;
}