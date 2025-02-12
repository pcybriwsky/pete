import React from 'react';
import CaseStudy from './CaseStudy';

const CaseStudies = () => {
    const projects = [
        {
            id: "day-by-data",
            title: "Day By Data",
            headerImage: require("../../../Assets/Images/DayByDataPhoneMockup.png"),
            skills: ["iOS", "Swift", "WidgetKit", "MusicKit", "HealthKit", "p5.js"],
            description: "My first iOS app that turns your Apple Health, Music, and other data into beautiful art and widgets. Released December 2024.",
            link: "https://apps.apple.com/us/app/day-by-data/id6737629704"
        },
        {
            id: "ngenart",
            title: "ngenart.com",
            headerImage: require("../../../Assets/Images/ngenDNAPhone.png"),
            skills: ["React", "Node.js", "Firebase", "p5.js", "Data Visualization", "Viral Marketing"],
            description: "A viral web app that turned 9M people's Spotify and Strava data into art, inspiring TikTok trends like \"Spotify DNA\".",
            link: "https://ngenart.com"
        },
        {
            id: "moon-teller",
            title: "The Moon Teller",
            headerImage: require("../../../Assets/Images/moonTellerMacBook.png"),
            skills: ["p5.js", "AI", "Web Development", "Design", "Firebase"],
            description: "An interactive experience I created for Warner Music Group's Lunar New Year 2025 campaign, combining cultural elements with music discovery.",
            link: "https://themoonteller.com"
        },
        {
            id: "rex-fit",
            title: "Rex.Fit",
            headerImage: require("../../../Assets/Images/RexFitNutritionFactsPhone.png"),
            skills: ["Processing", "Google Cloud", "Data Visualization", "Fitness Tech"],
            description: "Designed and built custom fitness tracking visualizations for Rex.Fit (Y Combinator W23) WhatsApp chatbot, using a \"Nutrition Facts\"-inspired approach for clarity and white label flexibility.",
            link: "https://rex.fit"
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
                {projects.map((project) => (
                    <CaseStudy key={project.id} {...project} />
                ))}
            </div>
        </div>
    );
};

export default CaseStudies;