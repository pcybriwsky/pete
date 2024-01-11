
import React from 'react';
import Typewriter from 'typewriter-effect';
import FadeIn from 'react-fade-in/lib/FadeIn';

const AboutMe = () => {
    return (
        <div className='mx-auto items-center justify-center py-[10px]'>
                <div className='grid grid-cols-1 my-auto text-left'>
                    <div className='justify-center my-auto'>

                        <h2 className='text-4xl text-left font-serif font-bold italic my-[10px] text-primary'>Resources + Reading</h2>

                        <p className='my-[5px]'>
                            If you've made it this far, you're probably interested in learning more about generative art. Below are a few resources that I've found helpful in my journey. I'll continue to add to this list as I find more resources. Of course, feel free to reach out to me directly if you have more questions about generative art, data art, or <span className='font-serif font-bold italic text-primary'><a href="https://ngenart.com">n-gen</a></span>.
                        </p>

                        <ul className='list-disc ml-4'>
                            <li style={{ marginLeft: '1em' }}><a href="https://www.youtube.com/channel/UCvjgXvBlbQiydffZU7m1_aw" className='font-bold font-serif italic text-xl'>The Coding Train</a>
                                <p className='my-[5px]'>
                                    Dan Shiffman's YouTube channel is a great place to start learning about generative art. He has a great way of explaining concepts and is very entertaining.
                                </p>
                            </li>

                            <li style={{ marginLeft: '1em' }}><a href="https://twitter.com/generativelight/status/1519759169045381127" className='font-bold font-serif italic text-xl'>10 Minute Art Tutorial</a>
                                <p className='my-[5px]'>
                                    Generative Light's put together a great tutorial to create your first generative art piece. Now you have no excuse not to get started.
                                </p>
                            </li>
                            
                            <li style={{ marginLeft: '1em' }}><a href="https://www.datasketch.es" className='font-bold font-serif italic text-xl'>Data Sketches</a>
                                <p className='my-[5px]'>
                                    A great project by Nadieh Bremer and Shirley Wu where they create a new data visualization each month. I've barely scratched the surface of their work but it's a great place to get inspired by different datasets, approaches, and styles.
                                </p>
                            </li>
                            
                            <li style={{ marginLeft: '1em' }}><a href="https://tylerxhobbs.com/essays" className='font-bold font-serif italic text-xl'>Tyler Hobb's Essays</a>
                                <p className='my-[5px]'>
                                    A great collection of essays by Tyler Hobb's on generative art. His essays share a lot of great insights into his process and approach to creating generative art.
                                </p>
                            </li>
                            
                            <li style={{ marginLeft: '1em' }}><a href="https://www.r1b2.com/2022/01/28/mining-structures-walkthrough/?fbclid=IwAR3H5SgUcwCBNQWknQVCS2dqbxeN-t8A4GSpnSyluyIZcgdt4JwYj1OLqMQ" className='font-bold font-serif italic text-xl'>Mining Structures Walkthrough</a>
                                <p className='my-[5px]'>
                                    A great walkthrough by R1B2 on how to replicate Peter Ravenborg's hand-drawn style for their generative art collection <span className='italic'>Mining Structures</span>. I've been using this approach for my own work and it's been a great way to learn.
                                </p>
                            </li>



                        </ul>

                    </div>
                </div>
        </div>
    );
};

export default AboutMe;
