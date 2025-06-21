import { AppRoutes } from './components/routes/Routes.dom';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/error/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

export const App = () => {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ErrorBoundary>
  );
};
