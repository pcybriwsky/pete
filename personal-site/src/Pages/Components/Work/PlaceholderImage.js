import React from 'react';

const PlaceholderImage = ({ title }) => {
    // Get initials from title
    const initials = title
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();

    return (
        <div className="w-full h-full bg-gradient-to-br from-coral-light to-sand-light flex items-center justify-center">
            <span className="text-4xl font-serif font-bold text-background">
                {initials}
            </span>
        </div>
    );
};

export default PlaceholderImage; 