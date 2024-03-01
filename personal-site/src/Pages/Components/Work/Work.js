
import React from 'react';
import Typewriter from 'typewriter-effect';
import FadeIn from 'react-fade-in/lib/FadeIn';
import ArtFeature from './ArtFeature';

const AboutMe = () => {
    return (
        <div className='mx-auto'>
                <div className='grid grid-cols-1 my-auto mx-auto laptop:text-left'>
                    <div className='my-auto'>

                        <h2 className='text-4xl text-left font-serif font-bold italic my-[10px] text-primary'>Work</h2>

                        <p className='my-[5px]'>
                            Most of my time is spent focused on building <span className='font-serif font-bold italic text-primary'><a href="https://ngenart.com>">n-gen</a></span>. To-date, we've had over 9M users create upwards of 25M data art pieces on the platform. I've included a few of my favorite pieces from the site along with a few of my personal projects below.
                        </p>
                    </div>
                    <div className='justify-center my-auto'>
                        <ArtFeature link={"https://loves-languages.vercel.app"} image={require("../../../Assets/Images/love-languages.png")} title="Love's Languages" description="This piece aims to capture the diverse shapes and sounds of our universal language: love. It features a heart meticulously crafted from the wavelengths of 26 speakers across various languages. My hope is that this creation marks just the beginning, with aspirations to eventually open source it. This would allow us to capture the intricacies of all the ways love is expressed around the world. Submitted to the Data is Art competition hosted by the University of Virginia." />
                        <ArtFeature link={"https://eco-nebulae.vercel.app/"} image={require("../../../Assets/Images/nebulae.png")} title="Nebulae" description="For my first attempt at working with real-time data and The Device by ifmagic.io, I created a piece that highlights the often imperceptible changes in the environment around us over time. This piece was custom-built for the Data is Art competition in Charlottesville, and I'd like to continue building on this type of real-time data art in the future. This links to a test version of the piece, the real one requires a connected sensor to work!" />
                        <ArtFeature link={"https://ngenart.com/spotify/topten"} image={require("../../../Assets/Images/my-topTen.png")} title="Top Ten" description="The first piece that went viral for n-gen, with over 3.5M people around the globe creating a version of this piece. The goal was to create an elegant yet customizable representation of your listening habits through soundwaves. It was one of my earliest attempts at working with the Spotify API and helped me better understand how to use their robust dataset to highlight different characteristics of music." />
                        <ArtFeature link={"https://ngenart.com/strava/trailblazer"} image={require("../../../Assets/Images/my-trail.png")} title="Trailblazer" description="This piece was my first step into generative and data art for me. Using the Strava API, I was able to visualize 4,000 miles of my runs, bike rides, and other activities on one canvas for the first time. I am excited to revisit this piece in the future as I continue to develop new techniques and approaches to working with data." />
                        <ArtFeature image={require("../../../Assets/Images/people.png")} title="Little People Big Thoughts" description="An in-progress look at generative sketch people. In this piece, I want to illustrate the complex and everchanging thoughts we all experience through ink and watercolor. To achieve this style, I implemented R1B2 and Peter Ravenborg's approach to the lines and Tyler Hobb's approach to watercolor. I look forward to bringing these little people to life across future pieces." link={null}/>
                        <ArtFeature link={"https://ngenart.com/spotify/dna"} image={require("../../../Assets/Images/my-dna.png")} title="Spotify DNA" description="With over 7M people creating a version of this piece, DNA is my most popular piece to-date. The goal here was to highlight our top artists and their musical qualities to say something about ourselves. The animation mechanic took a lot of tweaking, but I am really happy with the final product." />
                        <ArtFeature image={require("../../../Assets/Images/networking.png")} title="Networking in Section G" description="A piece for a friend representing his business school class. Each student is represented by their seat in class with the corresponding flag colors of their home country. The piece takes in a highlighted student, who is represented in the shape of a heart." />
                        <ArtFeature image={require("../../../Assets/Images/hearts.png")} title="Days with K" description="I built a tracker since me and my girlfriend's first date, adding a growing heart for each day since. The piece manages to tell an extremely personal story with the only true variable being the time." link={"https://pcybriwsky.github.io/anni-days/"}/>
                    </div>
                </div>
        </div>
    );
};

export default AboutMe;
