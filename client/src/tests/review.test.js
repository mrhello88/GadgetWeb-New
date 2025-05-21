// This is a simple verification script - not a proper test suite
// Use this in the browser console to test your reviews functionality

// Function to test creating a review
async function testCreateReview() {
  const productId = 'replace-with-a-real-product-id'; // Replace with a real product ID
  const reviewData = {
    rating: 4,
    title: 'Test Review',
    text: 'This is a test review to verify the review creation functionality'
  };
  
  try {
    // This assumes you're logged in and have authentication token set
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assumes token is in localStorage
      },
      body: JSON.stringify({
        query: `
          mutation CreateReview($input: ReviewInput!) {
            createReview(input: $input) {
              success
              message
              data {
                _id
                productId
                userId
                userName
                rating
                title
                text
                createdAt
              }
              statusCode
            }
          }
        `,
        variables: {
          input: {
            productId,
            rating: reviewData.rating,
            title: reviewData.title,
            text: reviewData.text
          }
        }
      })
    });
    
    const result = await response.json();
    console.log('Create review result:', result);
    return result;
  } catch (error) {
    console.error('Error testing review creation:', error);
    return null;
  }
}

// Function to test getting reviews for a product
async function testGetReviewsByProduct() {
  const productId = 'replace-with-a-real-product-id'; // Replace with a real product ID
  
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query GetReviewsByProduct($productId: ID!) {
            getReviewsByProduct(productId: $productId) {
              success
              message
              data {
                _id
                productId
                userId
                userName
                rating
                title
                text
                likesCount
                dislikesCount
                repliesCount
                createdAt
              }
              statusCode
            }
          }
        `,
        variables: {
          productId
        }
      })
    });
    
    const result = await response.json();
    console.log('Get reviews result:', result);
    return result;
  } catch (error) {
    console.error('Error testing get reviews:', error);
    return null;
  }
}

// Export the test functions for use in the browser console
window.testCreateReview = testCreateReview;
window.testGetReviewsByProduct = testGetReviewsByProduct;

// Instructions for testing:
// 1. Open a product detail page
// 2. Open browser console
// 3. Run: await testCreateReview()
// 4. Run: await testGetReviewsByProduct()
// 5. Check the results in the console output 