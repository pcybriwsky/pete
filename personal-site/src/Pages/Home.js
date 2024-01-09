import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import SketchComponent from './Components/Sketches/SketchComponent'; // Import your p5 sketch
import AboutMe from './Components/About/AboutMe';


const Home = () => {
  return (
    <div className="App bg-background">
      <div className='w-[95%] laptop:w-[80%]'>
        <h1 className='text-2xl text-[#ff0000]'>:P</h1>
        {/* Need to have styling and content here */}
        <AboutMe />
        <div className='flex justify-center'>
          <SketchComponent />
        </div>


        {/* After this need to have more of a bottom Nav*/}
      </div>
    </div>
  );
}

export default Home;