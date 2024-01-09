import React from 'react';
import { BsFillEnvelopeFill } from 'react-icons/bs';
import { SiSubstack } from 'react-icons/si';
import { BsFacebook, BsSubstack, BsTiktok } from "react-icons/bs";
import { AiFillInstagram, AiFillTwitterCircle, AiFillLinkedin } from 'react-icons/ai';
import { FaGithub, FaYoutube } from 'react-icons/fa';



const Footer = () => {
    return (
        <div className='bg-text text-background mx-auto'>
            <div className=''>
                <p className='text-2xl items-center text-center'>Made with love</p>
                <div className='grid grid-cols-3 laptop:grid-cols-6 py-[10px]'>
                    <a href="https://www.instagram.com/peter_cybriwsky/">
                        <AiFillInstagram className='footerIcon' />
                    </a>
                    <a href="https://twitter.com/pete_cybriwsky">
                        <AiFillTwitterCircle className='footerIcon' />
                    </a>
                    <a href="https://www.linkedin.com/in/pete-cybriwsky/">
                        <AiFillLinkedin className='footerIcon' />
                    </a>
                    <a href="https://github.com/pcybriwsky">
                        <FaGithub className='footerIcon' />
                    </a>
                    <a href='https://substack.com/@ngenart'>
                        <SiSubstack className='footerIcon' />
                    </a>
                    <a href='mailto:pete@ngenart.com'>
                        <BsFillEnvelopeFill className='footerIcon' />
                    </a>
                </div>
            </div>
        </div>

    );
};

export default Footer;
