import React from 'react';
import FadeIn from 'react-fade-in/lib/FadeIn';

const ConnectPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <FadeIn>
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <h1 className="text-5xl font-mono text-primary mb-8">
                        Let's Connect
                    </h1>
                    <div className="prose max-w-none font-serif">
                        <p className="text-xl mb-8">
                            Open to collaborations and conversations about data art, creative coding, 
                            or potential projects.
                        </p>
                        
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-mono text-primary mb-4">Find me on</h2>
                                <div className="space-y-2">
                                    <p>
                                        <a href="https://instagram.com/_re_pete" 
                                           className="text-primary font-mono hover:opacity-70">
                                            Instagram
                                        </a>
                                    </p>
                                    <p>
                                        <a href="https://twitter.com/_re_pete" 
                                           className="text-primary font-mono hover:opacity-70">
                                            Twitter
                                        </a>
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-mono text-primary mb-4">Email</h2>
                                <p>
                                    <a href="mailto:pete@ngenart.com" 
                                       className="text-primary font-mono hover:opacity-70">
                                        pete@ngenart.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
};

export default ConnectPage; 