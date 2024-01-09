
import React from 'react';
import Typewriter from 'typewriter-effect';
import FadeIn from 'react-fade-in/lib/FadeIn';

const AboutMe = () => {
    return (
        <FadeIn>
        <div className='grid grid-cols-1 mx-auto laptop:grid-cols-2 w-[90%] laptop:w-[80%] text-center laptop:text-left'>
            <div className='justify-center'>
                <h2 className='text-2xl text-left'>Hi, I'm Pete</h2>

                <p className='text-2xl'>
                    Nice to meet you! I’m Pete, and I’m a data artist.
                </p>
                
                <p>
                    On paper, I run a data art company, <span className='font-serif font-bold italic text-primary'><a href="https://ngenart.com">n-gen</a></span>. You should check it out.
                </p>

                <p>
                    At heart, I’m a passionate runner, music listener, and tinkerer. My efforts to get creative with my own data led me to create a platform to empower others to do the same.
                </p>
            </div>
            <div>
                <img src="https://github.com/pcybriwsky/pete/blob/main/personal-site/src/Assets/Images/headshot.png" alt="Profile Picture" />
            </div>
        </div>
        </FadeIn>
    );
};

export default AboutMe;
