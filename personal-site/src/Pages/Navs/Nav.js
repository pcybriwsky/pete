import React, { useEffect, useState } from 'react';

const Nav = () => {
  const [navColor, setNavColor] = useState('bg-background');
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const navHeight = document.querySelector('nav').offsetHeight;

      if (scrollPosition > navHeight) {
        setNavColor('bg-alt shadow-sm');
      } else {
        setNavColor('bg-background');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${navColor} sticky top-0 transition-all duration-300`}>
      <div className='mx-auto w-[80%]'>
        <a href='#pete' className='scroll-smooth'>
          <div
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            className='flex items-center py-[10px] group'
          >
            <span className='text-2xl font-mono text-[#0a0a0a]'>:</span>
            <span className='text-2xl font-mono bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_auto] animate-gradient-fast bg-clip-text text-transparent'>
              P
            </span>
            <span 
              className={`
                text-2xl
                font-mono
                transform
                transition-all
                duration-300
                ease-out
                ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
              `}
            >
              (ete)
            </span>
          </div>
        </a>
      </div>
    </nav>
  );
};

export default Nav;
