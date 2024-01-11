
import React, { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';
import FadeIn from 'react-fade-in/lib/FadeIn';
import SketchComponent from './SketchComponent';

const openWeatherAPIKey = '5d07d30b0246f6207ec7888efecc0602';
const options = {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
};

const formatter = new Intl.DateTimeFormat('en-US', options);

const NYCtime = formatter.format(new Date());

console.log("Current time in New York City:", NYCtime);

const AboutMe = () => {
    const [weatherData, setWeatherData] = useState(null); // State for weather data

    useEffect(() => {
        const lat = 40.7128; // Latitude of New York City
        const lng = -74.0060; // Longitude of New York City

        const getWeatherData = async (lat, lng) => {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherAPIKey}&units=imperial`);
            const data = await response.json();
            setWeatherData(data); // Update weather data state
        };

        getWeatherData(lat, lng)
            .catch(error => {
                // Handle error
                console.error(error);
            });
    }, []);

    return (
        <div className='mx-auto items-center justify-center py-[40px]'>
            <FadeIn>
                <div className='grid grid-cols-1 my-auto mx-auto laptop:grid-cols-2 text-left text-text'>
                    <div className='justify-center mx-auto my-auto'>
                        <h2 className='text-4xl text-left font-serif font-bold italic my-[10px] text-primary'>Take Some Art</h2>
                        <p className='my-[5px]'>
                            Generative art is a form of art created from a set of rules or an algorithm. It is often used to create unique pieces of art that are impossible to replicate. By injecting data into the algorithm, we can create art that is not only unique but also meaningful and personal.
                        </p>
                        <p className='my-[5px]'>
                            To better illustrate the combination of data and generative art, I wanted to share a sample sketch based on real-time weather data in New York City.
                        </p>
                        <p className='my-[5px]'>
                            Each version of the piece is entirely unique upon each generation, with many generative elements that are randomized and that are grounded in the current conditions in New York City.
                        </p>
                        <p className='my-[5px]'>
                            <span className='font-bold'>Click anywhere on the sketch to download a copy and refresh the page to see a new output!</span>
                        </p>
                        <ul>
                            <li className='py-[5px]'>
                                <p><span className='font-bold'>Sun / Moon Position:</span> Determined by the local time in New York City.</p>
                                <p className='text-xl font-bold text-accent'>{NYCtime}</p>
                            </li>
                            <li className='py-[5px]'>
                                <p><span className='font-bold'>Background Dot Spread:</span> Determined by the current wind speed in New York City.</p>
                                <p className='text-xl font-bold text-accent'>{weatherData?.wind?.speed} MPH</p>
                            </li>
                            <li className='py-[5px]'>
                                <p><span className='font-bold'>Background Density:</span> Determined by the current cloud cover in New York City. A partial background will still be present even if cloud cover is 0.</p>
                                <p className='text-xl font-bold text-accent'>{weatherData?.clouds.all}%</p>
                            </li>
                        </ul>
                    </div>
                    <div className='mx-auto my-auto border-2 border-text'>
                        <SketchComponent />
                    </div>
                </div>
            </FadeIn>
        </div>
    );
};

export default AboutMe;
