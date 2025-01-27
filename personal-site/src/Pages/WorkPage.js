import React from 'react';
import FadeIn from 'react-fade-in/lib/FadeIn';
import CaseStudies from './Components/Work/CaseStudies';

const WorkPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <FadeIn>
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <h1 className="text-5xl font-mono text-primary mb-8">
                        Work
                    </h1>
                    <div className="prose max-w-none font-serif mb-12">
                        <p className="text-xl">
                            A collection of selected projects exploring data visualization, 
                            creative coding, and digital experiences.
                        </p>
                        <p className="text-xl">
                            I'm open to collaborating on interesting projects. Have something in mind? <a href="/contact" className="text-primary hover:underline">Reach out :P</a>.
                        </p>
                    </div>
                    <CaseStudies />
                </div>
            </FadeIn>
        </div>
    );
};

export default WorkPage; 