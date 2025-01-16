import React from 'react';
import FadeIn from 'react-fade-in/lib/FadeIn';
import ArtPieces from './Components/Art/ArtPieces';

const ArtPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <FadeIn>
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <h1 className="text-5xl font-mono text-primary mb-8">
                        Art
                    </h1>
                    <div className="prose max-w-none font-serif mb-12">
                        <p className="text-xl">
                            A collection of generative art, creative coding experiments, and 
                            data-driven visual experiences.
                        </p>
                    </div>
                    <ArtPieces />
                </div>
            </FadeIn>
        </div>
    );
};

export default ArtPage; 