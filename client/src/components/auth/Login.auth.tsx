import { useState } from 'react';
import { LoginUser } from '../../hooks/store/thunk/user.thunk';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../hooks/store/store';
import { storeTokenInLocalStorage } from '../../hooks/store/slice/user.slices';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validateEmail, validatePassword } from '../../utils/validation';

export const Login = ({ role }: { role: string }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const isAdmin = role !== 'user';
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      
      // Reset errors
      setErrors({});
      
      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setErrors(prev => ({ ...prev, email: emailValidation.message }));
        toast.error(emailValidation.message);
        return;
      }
      
      // Validate password - simple validation for login (not the full complexity check)
      if (!password) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
        toast.error('Password is required');
        return;
      }
      
      // All validation passed, proceed with login
      dispatch(LoginUser({ email, password, isAdmin })).then(({ payload }) => {
        if (payload?.success) {
          dispatch(storeTokenInLocalStorage({ token: payload.token, isAdmin }));
          if (isAdmin) {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
          toast.success(payload.message);
        } else {
          toast.error(payload.message || 'Login Failed!');
          navigate(isAdmin ? '/admin/login' : '/user/login');
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Server error during login');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Login {role}
          </h1>
          <form
            className="w-full max-w-md space-y-4 bg-white rounded-lg shadow dark:bg-gray-800 p-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                  ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className={`bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                  ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Login
            </button>
            {!isAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleRegister}
                  className="w-full text-blue-600 border border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Register
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
};
