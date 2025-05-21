import { AppRoutes } from './components/routes/Routes.dom';
import { ToastContainer } from 'react-toastify';
export const App = () => {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
};
