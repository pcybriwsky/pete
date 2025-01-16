import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const WeatherSketch = ({ weatherData }) => {
    const sketchRef = useRef(null);

    useEffect(() => {
        // Create the p5 sketch
        const sketch = (p) => {
            let particles = [];
            const numParticles = 100;

            p.setup = () => {
                const canvas = p.createCanvas(400, 400);
                canvas.parent(sketchRef.current);
                
                // Initialize particles
                for (let i = 0; i < numParticles; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        size: p.random(2, 8)
                    });
                }
            };

            p.draw = () => {
                p.background(240, 10); // Slight fade effect
                
                // Use weather data to influence the visualization
                const temp = weatherData?.temp || 70;
                const windSpeed = weatherData?.windSpeed || 5;
                const humidity = weatherData?.humidity || 50;
                
                // Map temperature to color
                const hue = p.map(temp, 30, 90, 180, 360);
                
                particles.forEach(particle => {
                    // Move particles based on wind speed
                    particle.x += p.map(windSpeed, 0, 20, 0, 2);
                    if (particle.x > p.width) particle.x = 0;
                    
                    // Use humidity to affect vertical movement
                    particle.y += p.map(humidity, 0, 100, -0.5, 0.5);
                    if (particle.y > p.height) particle.y = 0;
                    if (particle.y < 0) particle.y = p.height;
                    
                    // Draw particle
                    p.noStroke();
                    p.colorMode(p.HSB);
                    p.fill(hue, 70, 80, 0.5);
                    p.circle(particle.x, particle.y, particle.size);
                });
            };
        };

        // Create new p5 instance
        const p5Instance = new p5(sketch);

        // Cleanup
        return () => {
            p5Instance.remove();
        };
    }, [weatherData]);

    return <div ref={sketchRef} className="w-full h-full rounded-lg overflow-hidden" />;
};

export default WeatherSketch; 