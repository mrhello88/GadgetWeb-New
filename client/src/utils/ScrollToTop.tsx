import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Scroll window to top
    window.scrollTo(0, 0);
    
    // Also reset any scrollable containers that might exist
    document.querySelectorAll('.overflow-auto, .overflow-y-auto').forEach(element => {
      if (element instanceof HTMLElement) {
        element.scrollTop = 0;
      }
    });
  }, [pathname]);
  
  return null;
};

export default ScrollToTop; 