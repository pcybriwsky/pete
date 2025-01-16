import React from 'react';
import { Link } from 'react-router-dom';
import FadeIn from 'react-fade-in/lib/FadeIn';

const CaseStudy = ({ title, headerImage, skills, description, link, id }) => {
    const slug = id || title.toLowerCase().replace(/\s+/g, '-');
    
    return (
        <FadeIn>
            <Link to={`/projects/${slug}`} className="block">
                <article className="bg-white border border-text/10 rounded-lg overflow-hidden 
                                  transition-all duration-300 hover:border-text/20 hover:scale-[1.01]">
                    {/* Header Image */}
                    <div className="aspect-[3/2] w-full bg-cream-light overflow-hidden">
                        {headerImage ? (
                            <img 
                                src={headerImage} 
                                alt={title} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-coral-light/40 to-sand-light/40 
                                          flex items-center justify-center">
                                <span className="font-mono text-4xl text-primary/40">
                                    {title.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Title */}
                        <h2 className="font-mono text-lg text-primary">{title}</h2>
                        
                        {/* Description */}
                        <p className="font-serif text-base leading-relaxed text-left text-text/70">{description}</p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <span key={index} 
                                      className="font-mono text-xs px-2 py-1 bg-cream-light 
                                               text-text/70 rounded">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </article>
            </Link>
        </FadeIn>
    );
};

export default CaseStudy; 