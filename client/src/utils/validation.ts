/**
 * Validates an email address
 * @param email - Email address to validate
 * @returns Object containing validity status and any error message
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  // Basic email regex - checks for @ and at least one dot after @
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validates a password
 * @param password - Password to validate
 * @returns Object containing validity status and any error message
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
};

/**
 * Validates a name field
 * @param name - Name to validate
 * @returns Object containing validity status and any error message
 */
export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Name is required' };
  }
  
  // Name should contain at least some letters
  if (!/[a-zA-Z]/.test(name)) {
    return { isValid: false, message: 'Name must contain at least some letters' };
  }
  
  // Name should not be only numbers
  if (/^\d+$/.test(name)) {
    return { isValid: false, message: 'Name cannot contain only numbers' };
  }
  
  return { isValid: true };
};

/**
 * Validates a product price
 * @param price - Price to validate
 * @returns Object containing validity status and any error message
 */
export const validatePrice = (price: number | string): { isValid: boolean; message?: string } => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return { isValid: false, message: 'Price must be a valid number' };
  }
  
  if (numericPrice <= 0) {
    return { isValid: false, message: 'Price must be greater than zero' };
  }
  
  return { isValid: true };
};

/**
 * Validates a product description
 * @param description - Description to validate
 * @returns Object containing validity status and any error message
 */
export const validateDescription = (description: string): { isValid: boolean; message?: string } => {
  if (!description || !description.trim()) {
    return { isValid: false, message: 'Description is required' };
  }
  
  if (description.trim().length < 10) {
    return { isValid: false, message: 'Description should be at least 10 characters long' };
  }
  
  return { isValid: true };
};

/**
 * Validates that an array has at least one item
 * @param array - Array to validate
 * @param itemName - Name of the items in the array (e.g., 'image', 'feature')
 * @returns Object containing validity status and any error message
 */
export const validateArrayHasItems = (array: any[], itemName: string): { isValid: boolean; message?: string } => {
  if (!array || array.length === 0) {
    return { isValid: false, message: `At least one ${itemName} is required` };
  }
  
  return { isValid: true };
}; 