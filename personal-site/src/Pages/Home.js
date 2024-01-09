
import React, { useState } from 'react';
import AboutMe from './Components/About/AboutMe';
import SketchComponent from './Components/Sketches/SketchComponent';
import Resources from './Components/Resources/Resources';
import Work from './Components/Work/Work';




const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };

  return (
    <div className="App bg-background">
      <div className='w-[80%] mx-auto'>
        <a href='repete.art'>
          <p
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            className={`hover:text-primary text-2xl flex text-text text-left py-[10px] ease-linear transition-all duration-150 `}
          ><img className='w-[32px] h-[32px]' src={require("../Assets/Images/browserIcon32.png")}></img><span className={`${isHovered ? 'visible text-text' : 'invisible'} ease-linear transition-all duration-150`}>(ete)</span>
          </p>
        </a>
        {/* Need to have styling and content here */}
        <AboutMe />
        <div className='flex justify-center'>
          <SketchComponent />
        </div>
        <Resources />
        <Work />
        {/* After this need to have more of a bottom Nav*/}
      </div>
    </div>
  );
}

export default Home;