import ClipLoader from 'react-spinners/ClipLoader';
import { useParams } from 'react-router-dom';
import { verifyUser } from '../../hooks/store/thunk/user.thunk';
import { AppDispatch } from '../../hooks/store/store';
import { RootState } from '../../hooks/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { storeTokenInLocalStorage } from '../../hooks/store/slice/user.slices';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
const override = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red',
};
export const PageLoading = () => {
  const params = useParams();
  const { token } = params;
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    try { 
      if (token) {
        dispatch(verifyUser(token)).then(({ payload }) => {
          if (payload.success) {
            dispatch(storeTokenInLocalStorage({ token: payload.token, isAdmin: false }));
            navigate('/');
          } else {
            navigate('/register');
          }
        });
      }
    } catch (error: unknown) {
      console.log(error, 'error in loading page');
    }
  }, [dispatch, navigate, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClipLoader
          color={'#36d7b7'}
          loading={true}
          cssOverride={override}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }
};
