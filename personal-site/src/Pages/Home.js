
import React, { useState } from 'react';
import AboutMe from './Components/About/AboutMe';
import Drawing from './Components/Sketches/Drawing';
import Resources from './Components/Resources/Resources';
import Work from './Components/Work/Work';




const Home = () => {
  return (
    <div className="App bg-background text-text scroll-smooth">
      <div className='w-[80%] mx-auto scroll-smooth'>
        {/* Need to have styling and content here */}
        <AboutMe />
        <Work />
        <div className='flex justify-center'>
          <Drawing />
        </div>
        <Resources />
        {/* After this need to have more of a bottom Nav*/}
      </div>
    </div>
  );
}

export default Home;