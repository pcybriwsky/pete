import React from 'react';
import FadeIn from 'react-fade-in/lib/FadeIn';

const RePetePage = () => {
    return (
        <div className="min-h-screen bg-background">
            <FadeIn>
                <div className="max-w-6xl mx-auto px-6 py-16">
                    {/* Header */}
                    <div className='grid grid-cols-1 laptop:grid-cols-2 gap-16 mb-20'>
                        <div>
                            <h1 className="text-5xl font-mono text-primary mb-8">
                                re<span className="text-text">:</span>Pete
                            </h1>
                            <div className="prose max-w-none font-serif">
                                <p className="text-xl mb-6">
                                    I'm Pete, a New York-based artist and developer exploring the intersection of personal data and creative expression. 
                                    <br />
                                    <br />
                                    My work transforms everyday digital experiences – from our music listening habits to our workouts – into meaningful visual experiences.
                                </p>
                                <p className="text-xl mb-6">
                                   I'm also a big fan of using old-school text emoticons ¯\_(ツ)_/¯
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center justify-center laptop:justify-end'>
                            <img className="laptop:w-[300px] laptop:h-[300px] w-[200px] h-[200px] rounded-full shadow-2xl" src={require("../Assets/Images/headshot.png")} alt="Pete Cybriwsky" />
                        </div>
                    </div>

                    <section className="mb-20">
                        <h2 className="text-3xl font-mono text-primary mb-8">The Latest</h2>
                        <div className="prose max-w-none font-serif space-y-4">
                            <p className="flex items-start gap-3">
                                <span className="text-primary font-mono text-xl">></span>
                                <p>
                                Currently open to new projects! At a high-level, I do full-stack and iOS design and development with an emphasis on data visualization and personal expression. Interested in working together? <a href="mailto:pete@ngenart.com?subject=Let's%20chat!" className="text-primary font-mono">Let's chat :D</a>
                                </p>
                            </p>

                            <p className="flex items-start gap-3">
                                <span className="text-primary font-mono text-xl">></span>
                                <p>
                                Recently launched <a href="https://apps.apple.com/us/app/day-by-data/id6737629704" className="text-primary font-mono">Day by Data</a> on iOS and <a href="https://ngenart.com" className="text-primary font-mono">n-gen</a>, where we've helped millions visualize their personal data in new ways.
                                </p>
                            </p>
                                
                            <p className="flex items-start gap-3">
                                <span className="text-primary font-mono text-xl">></span>
                                <p>
                                My latest installation <a href="https://datascience.virginia.edu/pages/nebulae-pete-cybriwsky" className="text-primary font-mono">Nebulae</a> is on display at UVA's School of Data Science, 
                                where it received two awards for innovative data representation \\(^o^)/
                                </p>
                            </p>
                        </div>
                    </section>

                    {/* Skills */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-mono text-primary mb-8">Important Skills</h2>
                        <p className="font-serif text-text/70 italic mb-4">
                            Some of these might be more useful than others ¯\_(ツ)_/¯
                        </p>
                        
                        {/* Technical */}
                        <div className="mb-8">
                            <h3 className="font-mono text-primary text-xl mb-4">Technical</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Swift</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">React</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Node.js</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Firebase</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Google Cloud</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Vercel</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Tailwind</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">JavaScript</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Python</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Processing</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">p5.js</span>
                            </div>
                        </div>

                        {/* Creative */}
                        <div className="mb-8">
                            <h3 className="font-mono text-primary text-xl mb-4">Creative</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Data Visualization</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Data Art</span>   
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Generative Art</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">UI/UX Design</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">App Design</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Widget Design</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Figma</span>
                            </div>
                        </div>

                        {/* Life Skills */}
                        <div className="mb-8">
                            <h3 className="font-mono text-primary text-xl mb-4">Life Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Making a mean cup of coffee</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Writing letters (pen and paper)</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Text emoticon usage</span>
                                <span className="font-mono text-xs px-2 py-1 bg-cream-light text-text/70 rounded">Picking up flowers</span>
                            </div>
                        </div>
                    
                    </section>

                    {/* Career Journey */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-mono text-primary mb-8">The Journey So Far</h2>
                        <div className="prose max-w-none font-serif">
                            <p className="mb-6">
                                My path started in engineering and computer science at the <a href='https://engineering.virginia.edu/' className="text-primary font-mono">University of Virginia</a>, 
                                where I first explored data visualization beyond traditional charts and graphs. After leading digital product strategy 
                                at <a href="https://prophet.com/" className="text-primary font-mono">Prophet</a>, I began experimenting with creative coding and data art.
                            </p>
                            <p className="mb-6">
                                What started as side projects quickly evolved into viral applications reaching millions of users. Now I split my time between 
                                building products that help people express themselves through data and collaborating with companies to tell more compelling data stories.
                            </p>
                            <p className="mb-6">
                                I write about the journey of building at the intersection of data, art, and technology on my <a href="https://substack.com/@petecybriwsky" className="text-primary font-mono">Substack</a>, 
                                exploring everything from creative coding techniques to the future of personal data visualization to making decisions around (not) raising venture capital money.
                            </p>

                        </div>
                    </section>

                    {/* Vision */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-mono text-primary mb-8">Vision & Projects</h2>
                        <div className="prose max-w-none font-serif">
                            <p className="mb-6">
                                I'm working toward a future where personal data becomes a medium for creative expression. From an <a href="https://substack.com/home/post/p-154101227" className="text-primary font-mono">at-home data art Canvas</a> to the <a href="https://substack.com/home/post/p-154101227" className="text-primary font-mono">New York City MoMAthon</a>, I have some big dreams.
                            </p>
                        </div>
                    </section>

                    {/* Resources */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-mono text-primary mb-8">Resources for Creators</h2>
                        <div className="prose max-w-none font-serif">
                            <p className="mb-8">
                                For those interested in exploring generative art and data visualization, here are some resources that shaped my approach:
                            </p>
                            <ul className="space-y-8">
                                <li>
                                    <a href="https://www.youtube.com/channel/UCvjgXvBlbQiydffZU7m1_aw" className="font-mono text-primary text-xl block mb-2">
                                        The Coding Train
                                    </a>
                                    <p className="mt-2">
                                        Daniel Shiffman's masterclass in creative coding fundamentals. Essential viewing for anyone starting out.
                                    </p>
                                </li>
                                <li>
                                    <a href="https://www.datasketch.es" className="font-mono text-primary text-xl block mb-2">
                                        Data Sketches
                                    </a>
                                    <p className="mt-2">
                                        Nadieh Bremer and Shirley Wu's deep dives into data visualization. A masterclass in turning complex datasets into compelling narratives.
                                    </p>
                                </li>
                                <li>
                                    <a href="https://tylerxhobbs.com/essays" className="font-mono text-primary text-xl block mb-2">
                                        Tyler Hobbs' Essays
                                    </a>
                                    <p className="mt-2">
                                        Thoughtful exploration of generative art theory and practice from the creator of Fidenza.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-3xl font-mono text-primary mb-8">Connect</h2>
                        <div className="prose max-w-none font-serif">
                            <p className="mb-6">
                                Open to collaborations and conversations about data art, creative coding, or potential projects. 
                                Find me on <a href="https://instagram.com/_re_pete" className="text-primary font-mono">@_re_pete</a>, 
                                <a href="https://twitter.com/_re_pete" className="text-primary font-mono ml-1">@_re_pete</a>, 
                                or via <a href="mailto:pete@ngenart.com" className="text-primary font-mono">pete@ngenart.com</a>
                            </p>
                        </div>
                    </section>
                </div>
            </FadeIn>
        </div>
    );
};

export default RePetePage; 