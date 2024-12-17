import React, { useState } from 'react';
import AboutMe from './Components/About/AboutMe';
import Resources from './Components/Resources/Resources';
import Work from './Components/Work/Work';

const Home = () => {
  return (
    <div className="App bg-dancing-gradient animate-gradient-dance text-text scroll-smooth">
      <div className='w-[80%] mx-auto scroll-smooth'>
        <AboutMe />
        <Work />
        <Resources />
      </div>
    </div>
  );
}

export default Home;