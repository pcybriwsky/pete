import React, { useEffect, useState } from 'react';
import { BsFillEnvelopeFill } from 'react-icons/bs';
import { SiSubstack } from 'react-icons/si';
import { BsFacebook, BsSubstack, BsTiktok } from "react-icons/bs";
import { AiFillInstagram, AiFillTwitterCircle, AiFillLinkedin } from 'react-icons/ai';
import { FaGithub, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    const technologies = [
        { text: 'love', color: 'primary' },
        { text: 'React', color: 'accent' },
        { text: 'Next.js', color: 'primary' },
        { text: 'Processing', color: 'accent' },
        { text: 'TailwindCSS', color: 'primary' },
        { text: 'Vercel', color: 'accent' },
        { text: 'Figma', color: 'primary' }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % technologies.length);
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className='bg-text text-background mx-auto py-[30px]'>
            <div className='mx-auto text-center'>
                <div className="text-center pb-[10px]">
                    <p className="text-2xl font-serif italic lowercase font-bold">
                        made with{' '}
                        <span className="relative inline-block w-32 h-8 align-bottom">
                            {technologies.map((tech, index) => (
                                <span
                                    key={tech.text}
                                    className={`absolute left-0 w-full
                                        transform transition-all duration-700 ease-in-out
                                        ${index === currentIndex 
                                            ? 'opacity-100 translate-y-0' 
                                            : 'opacity-0 translate-y-8'}
                                        bg-gradient-to-r from-${tech.color} to-secondary 
                                        bg-clip-text text-transparent`}
                                >
                                    {tech.text}
                                </span>
                            ))}
                        </span>
                    </p>
                </div>
                <div className='grid grid-cols-6 py-[30px] mx-auto w-[90%] laptop:w-[35%]'>
                    <a href='mailto:pete@ngenart.com'>
                        <BsFillEnvelopeFill className='footerIcon' />
                    </a>
                    <a href='https://substack.com/@ngenart'>
                        <SiSubstack className='footerIcon' />
                    </a>
                    <a href="https://www.instagram.com/_re_pete/">
                        <AiFillInstagram className='footerIcon' />
                    </a>
                    <a href="https://twitter.com/_re_pete">
                        <AiFillTwitterCircle className='footerIcon' />
                    </a>
                    <a href="https://www.linkedin.com/in/pete-cybriwsky/">
                        <AiFillLinkedin className='footerIcon' />
                    </a>
                    <a href="https://github.com/pcybriwsky">
                        <FaGithub className='footerIcon' />
                    </a>
                </div>
            </div>
        </div>

    );
};

export default Footer;
