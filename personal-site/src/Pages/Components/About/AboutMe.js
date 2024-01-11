
import React from 'react';
import Typewriter from 'typewriter-effect';
import FadeIn from 'react-fade-in/lib/FadeIn';

const AboutMe = () => {
    return (
        <div id="pete" className='mx-auto items-center justify-center'>
            <FadeIn>

                <div className='grid grid-cols-1 my-auto mx-auto laptop:grid-cols-2 text-left h-[900px]'>
                    <div className='justify-center mx-auto my-auto'>

                        <h2 className='text-4xl text-left font-serif font-bold italic my-[10px] text-primary'>Hi, I'm Pete</h2>

                        <h1 className='my-[5px]'>
                            On paper, I'm an entrepreneur based in New York building <span className='font-serif font-bold italic text-primary'><a href="https://ngenart.com">n-gen</a></span> at the intersection of art and data. You should check it out.
                        </h1>

                        <p className='my-[5px]'>
                            At heart, I’m a passionate runner, music listener, and tinkerer. I love to build things and learn new skills. I'm currently trying to learn to draw alongside my generative art journey.
                        </p>

                        <p className='my-[5px]'>
                            In the past, I studied computer science and worked in product marketing and design.
                        </p>

                        <p className='my-[5px]'>
                            Follow me on <span className='font-serif font-bold italic text-primary'><a href="https://twitter.com/pete_cybriwsky">Twitter</a></span> or <span className='font-serif font-bold italic text-primary'><a href="https://www.instagram.com/peter_cybriwsky/">Instagram</a></span> to see what I'm up to or read some longer-form thoughts on <span className='font-serif font-bold italic text-primary'><a href="https://ngenart.substack.com/">Substack</a></span>. Feel free to give me a shout there or over <span className='font-serif font-bold italic text-primary'><a href="mailto:pete@ngenart.com">email</a></span> as well.
                        </p>

                    </div>
                    <div className='mx-auto my-auto'>
                        <img className="w-[300px] h-[300px] rounded-full shadow-2xl" src={require("../../../Assets/Images/headshot.png")} alt="Profile Picture" />
                    </div>
                </div>
            </FadeIn>
        </div>
    );
};

export default AboutMe;
