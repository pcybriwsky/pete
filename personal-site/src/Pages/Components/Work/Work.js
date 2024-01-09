
import React from 'react';
import Typewriter from 'typewriter-effect';
import FadeIn from 'react-fade-in/lib/FadeIn';
import ArtFeature from './ArtFeature';

const AboutMe = () => {
    return (
        <div className='mx-auto'>
            <FadeIn>

                <div className='grid grid-cols-1 my-auto mx-auto laptop:text-left'>
                    <div className='my-auto'>

                        <h2 className='text-4xl text-left font-serif font-bold italic my-[10px] text-primary'>Work</h2>

                        <p className='my-[5px]'>
                            Much of my work is on display and free to create with on <span className='font-serif font-bold italic text-primary'><a href="https://ngenart.com>">n-gen</a></span>. I've featured a few below along with a couple of others.
                        </p>
                    </div>
                    <div className='justify-center my-auto'>
                        <ArtFeature image={require("../../../Assets/Images/people.png")} title="Little People Big Thoughts" description="An in-progress look at generative sketch people. Really wanted to try my hand at this ink and watercolor style, implemented R1B2 and Peter Ravenborg's approach to the lines and Tyler Hobb's approach to watercolor. Loving the progress here on color and shape" link={null}/>
                        <ArtFeature link={"https://ngenart.com/spotify/topten"} image={require("../../../Assets/Images/my-topTen.png")} title="Top Ten" description="The first piece that went viral for n-gen. An elegant representation of your listening habits through soundwaves. Really helped me get the hang of the Spotify API" />
                        <ArtFeature link={"https://ngenart.com/spotify/dna"} image={require("../../../Assets/Images/my-dna.png")} title="Spotify DNA" description="You are what you listen to, right? Playing with animations to form a spinning DNA strand based on your favorite artists and their traits" />
                        <ArtFeature image={require("../../../Assets/Images/hearts.png")} title="Days with k" description="A tracker since my girlfriend and I's first date, adding a heart for each day. Nothing tells a story quite like time." link={"https://pcybriwsky.github.io/anni-days/"}/>

                        <ArtFeature image={require("../../../Assets/Images/networking.png")} title="Networking in Section G" description="A piece for a friend representing his business school class. Each student is represented by their seat in class with the corresponding flag colors of their home country. The piece takes in a highlighted student, who is represented in the shape of a heart." />
                    </div>
                </div>
            </FadeIn>
        </div>
    );
};

export default AboutMe;
