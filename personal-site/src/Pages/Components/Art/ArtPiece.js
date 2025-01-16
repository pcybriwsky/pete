import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArtPiece = ({ piece }) => {
    const navigate = useNavigate();
    const { id, title, description, thumbnail, date, medium } = piece;

    return (
        <div 
            onClick={() => navigate(`/art/${id}`)}
            className="group cursor-pointer bg-cream-light/20 rounded-lg overflow-hidden"
        >
            <div className="aspect-square overflow-hidden">
                <img 
                    src={thumbnail} 
                    alt={title}
                    className="w-full h-full object-cover transition-all duration-500 
                             group-hover:scale-105"
                />
            </div>
            <div className="p-4">
                <h3 className="font-mono text-primary text-lg mb-2 group-hover:opacity-70 
                             transition-opacity">
                    {title}
                </h3>
                <p className="font-serif text-xs text-text/70 mb-2">{medium} • {date}</p>
                <p className="font-serif text-sm text-text/90 line-clamp-2">{description}</p>
            </div>
        </div>
    );
};

export default ArtPiece; 