import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import SketchComponent from './Components/Sketches/SketchComponent'; // Import your p5 sketch

const Home = () => {
  return (
    <div className="App">
      <h1>Home</h1>
      <SketchComponent />
    </div>
  );
}

export default Home;