import React from 'react';
import { BsFillEnvelopeFill } from 'react-icons/bs';
import { SiSubstack } from 'react-icons/si';
import { BsFacebook, BsSubstack, BsTiktok } from "react-icons/bs";
import { AiFillInstagram, AiFillTwitterCircle, AiFillLinkedin } from 'react-icons/ai';
import { FaGithub, FaYoutube } from 'react-icons/fa';



const Footer = () => {
    return (
        <div className='bg-primary text-background mx-auto'>
            <div className='w-[80%] laptop:w-[80%] mx-auto'>
            <p>Made with love</p>

            <div className='grid grid-cols-6 '>
                <AiFillInstagram />
                <AiFillTwitterCircle />
                <AiFillLinkedin />
                <FaGithub />
                <SiSubstack />
                <BsFillEnvelopeFill />
            </div>
            </div>
        </div>
        
    );
};

export default Footer;
