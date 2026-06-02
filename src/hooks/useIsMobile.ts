import { useEffect, useState } from 'react';

export const useIsMobile = (width = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= width);
    };

    checkScreen();

    window.addEventListener('resize', checkScreen);

    return () => {
      window.removeEventListener('resize', checkScreen);
    };
  }, [width]);

  return isMobile;
};