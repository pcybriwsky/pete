import React from 'react';
import { useParams } from 'react-router-dom';
import { artPiecesData } from './Components/Art/ArtPieces';
import FadeIn from 'react-fade-in/lib/FadeIn';

const ArtPiecePage = () => {
    const { pieceId } = useParams();
    const piece = artPiecesData.find(p => p.id === pieceId);

    if (!piece) return <div>Art piece not found</div>;

    return (
        <div className="min-h-screen bg-background">
            <FadeIn>
                <div className="max-w-4xl mx-auto px-6 py-16">
                    {/* Header */}
                    <h1 className="text-5xl font-mono text-primary mb-4">
                        {piece.title}
                    </h1>
                    <p className="font-serif text-lg text-text/70 mb-8">
                        {piece.medium} • {piece.date}
                    </p>

                    {/* Main Image */}
                    <div className="mb-12">
                        <img 
                            src={piece.thumbnail} 
                            alt={piece.title}
                            className="w-full max-h-[400px] object-cover rounded-lg mx-auto"
                        />
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 laptop:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="laptop:col-span-2">
                            <h2 className="text-2xl font-mono text-primary mb-4">About</h2>
                            <div className="prose max-w-none font-serif">
                                {piece.fullDescription.split('\n\n').map((paragraph, index) => (
                                    <p key={index} className="text-lg mb-6">{paragraph}</p>
                                ))}
                            </div>

                            <h2 className="text-2xl font-mono text-primary mb-4 mt-8">Process</h2>
                            <div className="prose max-w-none font-serif">
                                <p className="text-lg">{piece.process}</p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-mono text-primary mb-4">Details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm text-text/70">Dimensions</h3>
                                            <p className="font-serif">{piece.dimensions}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm text-text/70">Location</h3>
                                            <p className="font-serif">{piece.location}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm text-text/70">Exhibition Period</h3>
                                            <p className="font-serif">{piece.exhibition}</p>
                                        </div>
                                        {piece.awards && (
                                            <div>
                                                <h3 className="text-sm text-text/70">Awards</h3>
                                                <ul className="mt-2 space-y-2">
                                                    {piece.awards.map((award, index) => (
                                                        <li key={index} className="font-serif text-sm">{award}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-sm text-text/70">Technologies</h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {piece.technologies.map((tech) => (
                                                    <span key={tech} 
                                                          className="text-xs px-2 py-1 bg-cream-light text-text/70 rounded">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {piece.links && (
                                    <div>
                                        <h2 className="text-2xl font-mono text-primary mb-4">Links</h2>
                                        <div className="space-y-4">
                                            {piece.links.map((link, index) => (
                                                <div key={index}>
                                                    <a 
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-mono text-primary hover:opacity-70 
                                                                 transition-opacity inline-flex items-center gap-2"
                                                    >
                                                        {link.title} →
                                                    </a>
                                                    <p className="font-serif text-sm text-text/70 mt-1">
                                                        {link.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
};

export default ArtPiecePage; 