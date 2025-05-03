// filepath: d:\Philips\feed\src\components\FeedbackSummary.js

// API URL - Update this to match your backend URL
const API_URL = 'http://localhost:3000/api';

export function FeedbackSummary() {
  const summaryElement = document.createElement('div');
  summaryElement.className = 'feedback-summary fade-in';
  
  const summaryTitle = document.createElement('h2');
  summaryTitle.className = 'card-title';
  summaryTitle.textContent = 'Product Feedback Insights';
  
  // Create loading indicator
  const loadingContainer = document.createElement('div');
  loadingContainer.id = 'summary-loading';
  loadingContainer.style.textAlign = 'center';
  loadingContainer.style.padding = '50px 0';
  loadingContainer.innerHTML = `
    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
    <p style="margin-top: 20px;">Analyzing feedback data and generating insights...</p>
  `;
  
  // Create summary container (initially empty)
  const summariesContainer = document.createElement('div');
  summariesContainer.className = 'summaries-container';
  summariesContainer.style.display = 'none';
  
  // Create error message container (initially hidden)
  const errorContainer = document.createElement('div');
  errorContainer.id = 'summary-error';
  errorContainer.className = 'error-container';
  errorContainer.style.display = 'none';
  errorContainer.style.color = 'var(--danger-color)';
  errorContainer.style.padding = '20px';
  errorContainer.style.backgroundColor = '#ffebee';
  errorContainer.style.borderRadius = '8px';
  errorContainer.style.margin = '20px 0';
  
  // Append elements to the main container
  summaryElement.appendChild(summaryTitle);
  summaryElement.appendChild(loadingContainer);
  summaryElement.appendChild(errorContainer);
  summaryElement.appendChild(summariesContainer);
  
  // Remove back button since we now have the navigation bar
  // summaryElement.appendChild(backButton);
  
  // Fetch feedback summaries when the component is created
  fetchFeedbackSummaries()
    .then(summariesData => {
      if (summariesData.length === 0) {
        showError('No feedback data available to generate insights. Please collect more feedback first.');
        return;
      }
      
      // Successfully fetched data, hide loading and show summaries
      loadingContainer.style.display = 'none';
      summariesContainer.style.display = 'block';
      
      // Create and display summaries for each product
      summariesData.forEach(productSummary => {
        const summaryCard = createSummaryCard(productSummary);
        summariesContainer.appendChild(summaryCard);
      });
    })
    .catch(error => {
      console.error('Error fetching feedback summaries:', error);
      showError('Failed to load feedback insights. Please try again later.');
    });
  
  return summaryElement;
  
  // Helper function to fetch summaries from the API
  async function fetchFeedbackSummaries() {
    try {
      const response = await fetch(`${API_URL}/feedback/summaries`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedback summaries:', error);
      throw error;
    }
  }
  
  // Helper function to create a summary card for each product
  function createSummaryCard(productData) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card summary-card';
    cardElement.style.marginBottom = '30px';
    cardElement.style.padding = '20px';
    
    // Product header
    const productHeader = document.createElement('div');
    productHeader.style.display = 'flex';
    productHeader.style.alignItems = 'center';
    productHeader.style.justifyContent = 'space-between';
    productHeader.style.marginBottom = '15px';
    
    const productName = document.createElement('h3');
    productName.style.margin = '0';
    productName.textContent = productData.product;
    
    const feedbackCount = document.createElement('span');
    feedbackCount.style.backgroundColor = 'var(--primary-color)';
    feedbackCount.style.color = 'white';
    feedbackCount.style.padding = '4px 10px';
    feedbackCount.style.borderRadius = '15px';
    feedbackCount.style.fontSize = '0.9rem';
    feedbackCount.textContent = `${productData.feedbackCount} Feedback`;
    
    productHeader.appendChild(productName);
    productHeader.appendChild(feedbackCount);
    cardElement.appendChild(productHeader);
    
    // Check if there was an error generating summary for this product
    if (productData.error) {
      const errorMessage = document.createElement('div');
      errorMessage.style.color = 'var(--danger-color)';
      errorMessage.style.padding = '10px';
      errorMessage.style.backgroundColor = '#ffebee';
      errorMessage.style.borderRadius = '4px';
      errorMessage.textContent = productData.error;
      
      cardElement.appendChild(errorMessage);
      return cardElement;
    }
    
    // Summary section
    if (productData.summary?.summary && productData.summary.summary.length > 0) {
      const summarySection = createSection('Key Insights', productData.summary.summary);
      cardElement.appendChild(summarySection);
    }
    
    // Strengths section
    if (productData.summary?.strengths && productData.summary.strengths.length > 0) {
      const strengthsSection = createSection('Product Strengths', productData.summary.strengths, 'fas fa-thumbs-up', 'var(--success-color)');
      cardElement.appendChild(strengthsSection);
    }
    
    // Areas for Improvement section
    if (productData.summary?.improvements && productData.summary.improvements.length > 0) {
      const improvementsSection = createSection('Areas for Improvement', productData.summary.improvements, 'fas fa-exclamation-circle', 'var(--warning-color)');
      cardElement.appendChild(improvementsSection);
    }
    
    // Create columns for suggestions and new features
    const columnsContainer = document.createElement('div');
    columnsContainer.style.display = 'flex';
    columnsContainer.style.flexWrap = 'wrap';
    columnsContainer.style.gap = '20px';
    columnsContainer.style.marginTop = '20px';
    
    // Suggestions section
    if (productData.summary?.suggestions && productData.summary.suggestions.length > 0) {
      const suggestionsSection = document.createElement('div');
      suggestionsSection.style.flex = '1';
      suggestionsSection.style.minWidth = '250px';
      
      const suggestionsTitle = document.createElement('h4');
      suggestionsTitle.style.display = 'flex';
      suggestionsTitle.style.alignItems = 'center';
      suggestionsTitle.style.color = 'var(--dark-color)';
      suggestionsTitle.innerHTML = '<i class="fas fa-lightbulb" style="color: var(--primary-color); margin-right: 8px;"></i> Suggested Improvements';
      
      const suggestionsList = createList(productData.summary.suggestions);
      
      suggestionsSection.appendChild(suggestionsTitle);
      suggestionsSection.appendChild(suggestionsList);
      columnsContainer.appendChild(suggestionsSection);
    }
    
    // New features section
    if (productData.summary?.newFeatures && productData.summary.newFeatures.length > 0) {
      const featuresSection = document.createElement('div');
      featuresSection.style.flex = '1';
      featuresSection.style.minWidth = '250px';
      
      const featuresTitle = document.createElement('h4');
      featuresTitle.style.display = 'flex';
      featuresTitle.style.alignItems = 'center';
      featuresTitle.style.color = 'var(--dark-color)';
      featuresTitle.innerHTML = '<i class="fas fa-star" style="color: var(--primary-color); margin-right: 8px;"></i> Recommended New Features';
      
      const featuresList = createList(productData.summary.newFeatures);
      
      featuresSection.appendChild(featuresTitle);
      featuresSection.appendChild(featuresList);
      columnsContainer.appendChild(featuresSection);
    }
    
    cardElement.appendChild(columnsContainer);
    
    return cardElement;
  }
  
  // Helper function to create a section with a list of items
  function createSection(title, items, iconClass = null, iconColor = null) {
    const section = document.createElement('div');
    section.style.marginBottom = '15px';
    
    const sectionTitle = document.createElement('h4');
    sectionTitle.style.display = 'flex';
    sectionTitle.style.alignItems = 'center';
    sectionTitle.style.marginBottom = '10px';
    
    if (iconClass) {
      const icon = document.createElement('i');
      icon.className = iconClass;
      icon.style.marginRight = '8px';
      icon.style.color = iconColor || 'var(--primary-color)';
      sectionTitle.appendChild(icon);
    }
    
    sectionTitle.appendChild(document.createTextNode(title));
    
    const sectionList = createList(items);
    
    section.appendChild(sectionTitle);
    section.appendChild(sectionList);
    
    return section;
  }
  
  // Helper function to create a list of items
  function createList(items) {
    const list = document.createElement('ul');
    list.style.paddingLeft = '20px';
    list.style.marginTop = '8px';
    
    items.forEach(item => {
      const listItem = document.createElement('li');
      listItem.style.marginBottom = '5px';
      listItem.textContent = item;
      list.appendChild(listItem);
    });
    
    return list;
  }
  
  // Helper function to show error messages
  function showError(message) {
    loadingContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    errorContainer.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
  }
}