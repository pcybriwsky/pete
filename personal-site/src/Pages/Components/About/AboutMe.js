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

                        <h2 className='my-[5px]'>
                            I'm a New York-based artist and entrepreneur transforming everyday data into beautiful experiences. I build data-driven art and apps, and help companies tell creative stories with their data. If you'd like to work together, <a href="mailto:pete@ngenart.com">let's chat!</a>
                        </h2>

                        <h1 className='my-[5px]'>
                            Recently, I created <span className='font-serif font-bold italic text-primary'><a href="https://apps.apple.com/us/app/day-by-data/id6737629704">Day by Data</a></span> and <span className='font-serif font-bold italic text-primary'><a href="https://ngenart.com">n-gen</a></span>, helping millions of people express themselves through their health and music data. 
                        </h1>

                        <h2 className='my-[5px]'>
                            My data art piece <span className='font-serif font-bold italic text-primary'><a href="https://datascience.virginia.edu/pages/nebulae-pete-cybriwsky">Nebulae</a></span> is currently on display at UVA's School of Data Science and won two awards at their innagural Data is Art competition.
                        </h2>

                        <p className='my-[5px]'>
                            Previously, I studied engineering and computer science at the <a href='https://engineering.virginia.edu/'>University of Virginia</a> and worked in digital product marketing and design at <a href ="https://prophet.com/">Prophet</a>.
                        </p>

                        <p className='my-[5px]'>
                        Find me on <span className='text-primary'><a href="https://instagram.com/_re_pete">Instagram</a></span> or <span className='text-primary'><a href="https://twitter.com/_re_pete">Twitter</a></span> or reach out via <span className='text-primary'><a href="mailto:pete@ngenart.com">email</a></span> to work together.
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
