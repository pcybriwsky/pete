import React, { useEffect, useState } from 'react';
import { BsFillEnvelopeFill, BsFillHeartFill } from 'react-icons/bs';
import { SiSubstack, SiReact, SiP5Dotjs, SiVercel } from 'react-icons/si';
import { AiFillInstagram, AiFillTwitterCircle, AiFillLinkedin } from 'react-icons/ai';
import { 
    RiInstagramLine,
    RiTwitterLine,
    RiGithubLine,
    RiLinkedinLine,
    RiMailLine,
    RiCalendarLine,
} from 'react-icons/ri';
import { FaGithub, FaDatabase } from 'react-icons/fa';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiDust, WiNightClear, WiNightCloudy } from 'react-icons/wi';

const Footer = () => {
    const technologies = [
        { text: 'love', color: 'primary' },
        { text: 'React', color: 'primary' },
        { text: 'p5.js', color: 'primary' },
        { text: 'Vercel', color: 'primary' },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [weather, setWeather] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // New York coordinates
    const NY_LAT = 40.7128;
    const NY_LNG = -74.0060;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % technologies.length);
            setCurrentTime(new Date());
        }, 3000);

        // Get New York weather
        const fetchWeather = async () => {
            const apiKey = '5d07d30b0246f6207ec7888efecc0602';
            try {
                const weatherRes = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${NY_LAT}&lon=${NY_LNG}&appid=${apiKey}&units=imperial`
                );
                const weatherData = await weatherRes.json();
                setWeather(weatherData);
            } catch (err) {
                console.log('Weather fetch error:', err);
            }
        };

        fetchWeather();
        return () => clearInterval(timer);
    }, []);

    const getWeatherIcon = (weatherCode) => {
        // Check if it's nighttime
        const isNight = weather && (
            Date.now() < weather.sys.sunrise * 1000 || 
            Date.now() > weather.sys.sunset * 1000
        );

        if (!weatherCode) return isNight ? <WiNightClear /> : <WiDaySunny />;
        
        if (weatherCode >= 200 && weatherCode < 300) return <WiThunderstorm />;
        if (weatherCode >= 300 && weatherCode < 600) return <WiRain />;
        if (weatherCode >= 600 && weatherCode < 700) return <WiSnow />;
        if (weatherCode >= 700 && weatherCode < 800) return <WiDust />;
        if (weatherCode === 800) return isNight ? <WiNightClear /> : <WiDaySunny />;
        if (weatherCode > 800) return isNight ? <WiNightCloudy /> : <WiCloudy />;
        
        return isNight ? <WiNightClear /> : <WiDaySunny />;
    };

    const formatNYTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className='bg-primary text-background py-12'>
            <div className='max-w-6xl mx-auto px-6'>
                <div className="grid grid-cols-1 laptop:grid-cols-3 gap-8 items-center">
                    {/* Tech Stack */}
                    <div className="text-center laptop:text-left">
                        <p className="font-mono text-lg">
                            made with{' '}
                            <span className="relative inline-block w-24 h-7 align-bottom overflow-hidden">
                                {technologies.map((tech, index) => (
                                    <span
                                        key={index}
                                        className={`absolute left-0 w-full
                                            transform transition-all duration-700 ease-in-out
                                            ${index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                    >
                                        {tech.text}
                                    </span>
                                ))}
                            </span>
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex justify-center gap-8'>
                            <a href='mailto:pete@ngenart.com' 
                               className="text-background hover:text-background/90 transition-all duration-300 hover:scale-[1.02] hover:-rotate-3"
                               title="Email">
                                <RiMailLine className='w-6 h-6' />
                            </a>
                            <a href="https://www.instagram.com/_re_pete/" 
                               className="text-background hover:text-background/90 transition-all duration-300 hover:scale-[1.02] hover:-rotate-3"
                               title="Instagram">
                                <RiInstagramLine className='w-6 h-6' />
                            </a>
                            <a href="https://twitter.com/_re_pete" 
                               className="text-background hover:text-background/90 transition-all duration-300 hover:scale-[1.02] hover:rotate-3"
                               title="Twitter">
                                <RiTwitterLine className='w-6 h-6' />
                            </a>
                            <a href="https://www.linkedin.com/in/pete-cybriwsky/" 
                               className="text-background hover:text-background/90 transition-all duration-300 hover:scale-[1.02] hover:-rotate-3"
                               title="LinkedIn">
                                <RiLinkedinLine className='w-6 h-6' />
                            </a>
                            <a href="https://github.com/pcybriwsky" 
                               className="text-background hover:text-background/90 transition-all duration-300 hover:scale-[1.02] hover:rotate-3"
                               title="GitHub">
                                <RiGithubLine className='w-6 h-6' />
                            </a>
                            <a href='https://substack.com/@petecybriwsky' 
                               className="text-background hover:text-background/90 transition-all duration-300 hover:scale-[1.02] hover:rotate-3"
                               title="Substack">
                                <SiSubstack className='w-5 h-6' />
                            </a>
                        </div>
                    </div>

                    {/* Location and Weather */}
                    {weather && (
                        <div className="text-center laptop:text-right font-mono">
                            <div className="flex flex-col items-center laptop:items-end gap-1">
                                <span className="text-sm">conditions in new york</span>
                                <div className="flex items-center gap-2">
                                    {getWeatherIcon(weather.weather[0]?.id)}
                                    <span>{Math.round(weather.main?.temp)}°F</span>
                                    <span>at {formatNYTime()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Footer;
