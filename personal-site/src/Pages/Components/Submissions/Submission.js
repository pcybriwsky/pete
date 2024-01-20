
import React, { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';
import FadeIn from 'react-fade-in/lib/FadeIn';
import SketchComponent from './SketchComponent';




const AboutMe = () => {

    return (
        <div className='mx-auto items-center justify-center py-[40px]'>
            <FadeIn>
                <div className='grid grid-cols-1 my-auto mx-auto laptop:grid-cols-2 text-left text-text'>
                    <div className='justify-center mx-auto my-auto'>
                        <h2 className='text-4xl text-left font-serif font-bold italic my-[10px] text-primary'>Take Some Art</h2>
                        <p className='my-[5px]'>
                            Generative art is a form of art created from a set of rules or an algorithm. It is often used to create unique pieces of art that are impossible to replicate. By injecting data into the algorithm, we can create art that is not only unique but also meaningful and personal.
                        </p>
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
