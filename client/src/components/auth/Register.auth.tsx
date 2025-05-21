import React, { useState } from 'react';
import { RegisterUser } from '../../hooks/store/thunk/user.thunk';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../hooks/store/store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validateEmail, validateName, validatePassword } from '../../utils/validation';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin: boolean;
};

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when changing
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Validate name
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }
    
    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }
    
    // Validate password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    
    // Show the first error as a toast
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0] as keyof FormErrors;
      toast.error(newErrors[firstErrorKey]);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { payload } = await dispatch(RegisterUser(formData));

      if (payload?.success) {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          isAdmin: false,
        });
        navigate('/');
        toast.success(payload.message);
      } else {
        toast.error(payload.message);
        setErrors({ general: payload.message });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Server error during registration');
        setErrors({ general: error.message || 'Server error during registration' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign Up</h2>

        {errors.general && <div className="text-red-500 text-center text-sm">{errors.general}</div>}

        <div>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          value={formData.name}
          onChange={handleChange}
          required
        />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          value={formData.email}
          onChange={handleChange}
          required
        />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          value={formData.password}
          onChange={handleChange}
          required
        />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Create Account
        </button>

        <button
          type="button"
          onClick={() => navigate('/user/login')}
          className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition duration-200"
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
};
