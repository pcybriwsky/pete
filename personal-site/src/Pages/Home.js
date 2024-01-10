
import React, { useState } from 'react';
import AboutMe from './Components/About/AboutMe';
import Drawing from './Components/Sketches/Drawing';
import Resources from './Components/Resources/Resources';
import Work from './Components/Work/Work';




const Home = () => {
  return (
    <div className="App bg-background">
      <div className='w-[80%] mx-auto'>
        {/* Need to have styling and content here */}
        <AboutMe />
        <div className='flex justify-center'>
          <Drawing />
        </div>
        <Work />
        <Resources />
        {/* After this need to have more of a bottom Nav*/}
      </div>
    </div>
  );
}

export default Home;