export function FeedbackForm(onSubmit) {
  const formElement = document.createElement('div');
  formElement.className = 'card fade-in';
  
  const formTitle = document.createElement('h2');
  formTitle.className = 'card-title';
  formTitle.textContent = 'Share Your Experience';
  
  const form = document.createElement('form');
  form.id = 'feedbackForm';
  
  // Name field
  const nameGroup = createFormGroup('name', 'Name', 'text', 'Your name');
  
  // Email field
  const emailGroup = createFormGroup('email', 'Email', 'email', 'Your email address');
  
  // Product dropdown field
  const productGroup = document.createElement('div');
  productGroup.className = 'form-group';
  
  const productLabel = document.createElement('label');
  productLabel.setAttribute('for', 'product');
  productLabel.textContent = 'Product';
  
  const productSelect = document.createElement('select');
  productSelect.className = 'form-control';
  productSelect.id = 'product';
  productSelect.name = 'product';
  productSelect.required = true;
  
  // Add default/placeholder option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select a product --';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  productSelect.appendChild(defaultOption);
  
  // Add product options
  const products = ['Samsung mobile', 'Dell mouse', 'Smart watch', 'Acer laptop'];
  products.forEach(product => {
    const option = document.createElement('option');
    option.value = product;
    option.textContent = product;
    productSelect.appendChild(option);
  });
  
  productGroup.appendChild(productLabel);
  productGroup.appendChild(productSelect);
  
  // Rating field
  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'form-group';
  
  const ratingLabel = document.createElement('label');
  ratingLabel.textContent = 'Your Rating';
  
  const ratingContainer = document.createElement('div');
  ratingContainer.className = 'rating';
  
  for (let i = 5; i >= 1; i--) {
    const ratingInput = document.createElement('input');
    ratingInput.type = 'radio';
    ratingInput.id = `star${i}`;
    ratingInput.name = 'rating';
    ratingInput.value = i;
    
    const ratingStarLabel = document.createElement('label');
    ratingStarLabel.setAttribute('for', `star${i}`);
    ratingStarLabel.innerHTML = `<i class="fas fa-star"></i>`;
    ratingStarLabel.title = `${i} stars`;
    
    ratingContainer.appendChild(ratingInput);
    ratingContainer.appendChild(ratingStarLabel);
  }
  
  ratingGroup.appendChild(ratingLabel);
  ratingGroup.appendChild(ratingContainer);
  
  // Feedback text
  const feedbackGroup = document.createElement('div');
  feedbackGroup.className = 'form-group';
  
  const feedbackLabel = document.createElement('label');
  feedbackLabel.setAttribute('for', 'feedback');
  feedbackLabel.textContent = 'Your Feedback';
  
  const feedbackTextarea = document.createElement('textarea');
  feedbackTextarea.className = 'form-control';
  feedbackTextarea.id = 'feedback';
  feedbackTextarea.name = 'feedback';
  feedbackTextarea.placeholder = 'Please share your feedback, suggestions or issues...';
  feedbackTextarea.required = true;
  
  feedbackGroup.appendChild(feedbackLabel);
  feedbackGroup.appendChild(feedbackTextarea);
  
  // Create sentiment analysis results container (hidden by default)
  const sentimentResultsContainer = document.createElement('div');
  sentimentResultsContainer.id = 'sentiment-results';
  sentimentResultsContainer.className = 'sentiment-results-container';
  sentimentResultsContainer.style.display = 'none';
  sentimentResultsContainer.style.marginTop = '20px';
  sentimentResultsContainer.style.padding = '15px';
  sentimentResultsContainer.style.backgroundColor = '#f9f9f9';
  sentimentResultsContainer.style.borderRadius = '8px';
  sentimentResultsContainer.style.transition = 'all 0.3s ease';
  
  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-large btn-block';
  submitBtn.textContent = 'Submit Feedback';
  
  // Add form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const feedbackData = Object.fromEntries(formData.entries());
    
    // Add current timestamp
    feedbackData.timestamp = new Date().toISOString();
    
    // Show loading state in sentiment results container
    sentimentResultsContainer.style.display = 'block';
    sentimentResultsContainer.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
        <p style="margin-top: 10px;">Analyzing your feedback...</p>
      </div>
    `;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing...';
    
    // Call the onSubmit callback with the feedback data
    onSubmit(feedbackData, sentimentResultsContainer);
  });
  
  // Append all elements to the form
  form.appendChild(nameGroup);
  form.appendChild(emailGroup);
  form.appendChild(productGroup);
  form.appendChild(ratingGroup);
  form.appendChild(feedbackGroup);
  form.appendChild(sentimentResultsContainer);
  form.appendChild(submitBtn);
  
  // Append title and form to the card
  formElement.appendChild(formTitle);
  formElement.appendChild(form);
  
  return formElement;
}

// Helper function to create form groups
function createFormGroup(id, labelText, type, placeholder, required = false) {
  const group = document.createElement('div');
  group.className = 'form-group';
  
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = labelText;
  
  const input = document.createElement('input');
  input.type = type;
  input.className = 'form-control';
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.required = required;
  
  group.appendChild(label);
  group.appendChild(input);
  
  return group;
}