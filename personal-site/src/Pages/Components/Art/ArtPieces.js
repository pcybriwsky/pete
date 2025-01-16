import React from 'react';
import ArtPiece from './ArtPiece';

const artPiecesData = [
    {
        id: 'nebulae',
        title: 'Nebulae',
        description: 'An award-winning interactive installation that transforms environmental data into evolving cosmic phenomena.',
        thumbnail: require('../../../Assets/Images/nebulae.png'),
        date: '2023',
        medium: 'Interactive Data Art Installation',
        fullDescription: `Nebulae is an interactive data visualization installation that transforms live environmental data 
                         into mesmerizing cosmic phenomena. The piece took home two awards in the inaugural Data is Art 
                         competition at UVA's School of Data Science - the People's Choice Award and an award for Innovative 
                         Use of Live Data.
                         
                         Using custom hardware called "The Device", the installation collects real-time environmental readings 
                         including temperature, air quality (AQI), atmospheric pressure, and light levels from the roof of the 
                         School of Data Science. These data streams are visualized as three evolving, interconnected rings that 
                         pulse and shift with the changing conditions.
                         
                         The piece maintains a historical record of its evolution, allowing viewers to explore how environmental 
                         patterns have shaped the visualization over time through an interactive timelapse feature.`,
        dimensions: '2ft x 6ft',
        location: 'UVA School of Data Science',
        exhibition: 'May 2024 - December 2024',
        awards: [
            'People\'s Choice Award - Data is Art Competition 2024',
            'Innovative Use of Live Data Award - Data is Art Competition 2024'
        ],
        technologies: ['Processing', 'p5.js', 'The Device', 'Environmental Sensors'],
        process: `The installation uses custom hardware ("The Device") mounted on the roof of the UVA School of Data Science 
                 to collect environmental data. Multiple sensors continuously monitor temperature, air quality, atmospheric pressure, 
                 and light levels. This data is processed in real-time and mapped to visual elements within three dynamic rings. 
                 Each ring responds to different data streams, creating an ever-evolving visualization that reflects the 
                 building's changing environmental conditions. The piece also maintains a historical database, enabling viewers 
                 to explore how the visualization has evolved over time through an interactive timelapse feature.`,
        links: [
            {
                title: 'View Project Details',
                url: 'https://datascience.virginia.edu/pages/nebulae-pete-cybriwsky',
                description: 'Learn more about the installation at UVA School of Data Science'
            },
            {
                title: 'Test Version',
                url: 'https://eco-nebulae.vercel.app/',
                description: 'See a live demo of the visualization'
            },
            {
                title: 'The Device',
                url: 'https://ifmagic.io',
                description: 'Learn about the custom hardware powering the installation'
            }
        ],
        liveSketch: false
    },
    // {
    //     id: 'nyc-weather',
    //     title: 'NYC Weather Patterns',
    //     description: 'A daily-generated artwork that transforms New York City weather data into abstract visual patterns.',
    //     // thumbnail: require('../../../Assets/Images/weather-art.png'),
    //     date: '2024',
    //     medium: 'Generative Art / p5.js',
    //     fullDescription: `A living artwork that changes daily based on New York City's weather patterns. 
    //                      Temperature, humidity, wind speed, and precipitation are mapped to visual elements 
    //                      creating unique compositions that reflect the city's atmospheric conditions.`,
    //     dimensions: 'Variable',
    //     location: 'Digital / Web',
    //     technologies: ['p5.js', 'OpenWeather API', 'JavaScript'],
    //     process: `Each morning, the piece fetches current weather data from NYC through the OpenWeather API. 
    //              Temperature influences the color palette, wind speed affects the movement and flow of particles, 
    //              humidity controls the density of elements, and precipitation types create different visual textures.`,
    //     liveSketch: true
    // }
];

const ArtPieces = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {artPiecesData.map((piece) => (
                <ArtPiece key={piece.id} piece={piece} />
            ))}
        </div>
    );
};

export { artPiecesData };
export default ArtPieces; 