import React from 'react';
import { useParams } from 'react-router-dom';
import FadeIn from 'react-fade-in/lib/FadeIn';

// Enhanced AnimatedLink component that handles both internal and external links
const AnimatedLink = ({ href, children, className = "", isExternal = false }) => {
    const linkProps = isExternal ? {
        target: "_blank",
        rel: "noopener noreferrer"
    } : {};

    return (
        <a 
            href={href}
            {...linkProps}
            className={`group inline-flex items-center gap-1 font-mono hover:text-primary 
                       transition-all duration-300 hover:scale-[1.02] hover:-rotate-1 ${className}`}
        >
            <span className="font-mono opacity-0 -translate-x-2 transition-all duration-300 
                           group-hover:opacity-100 group-hover:translate-x-0">
                >
            </span>
            {children}
        </a>
    );
};

const CaseStudyPage = () => {
    const { projectId } = useParams();

    // This would eventually come from a data file or API
    const projectDetails = {
        'ngenart': {
            title: "ngenart.com",
            headerImage: require("../Assets/Images/ngenDNAPhone.png"),
            skills: ["React", "Node.js", "Firebase", "p5.js", "Data Visualization", "Viral Marketing", "SEO", "Spotify API", "Strava API"],
            description: "A viral web app that turned 9M people's Spotify and Strava data into art, inspiring TikTok trends like \"Spotify DNA\". My first attempt at representing personal data as art.",
            link: "https://ngenart.com",
            timeline: "Nov 2022 - Present",
            metrics: [
                "Users created 25M+ unique art pieces",
                "Grew to 9M+ users organically",
                "Reached 1B+ impressions through word of mouth",
            ],
            technicalDetails: {
                summary: "Solo-developed full-stack web platform for creating and sharing data-driven art.",
                bullets: [
                    "Built with React, Node.js, and Firebase for scalable infrastructure",
                    "Created custom p5.js sketches for real-time data visualization on-device, minimizing server load and latency",
                    "Integrated Spotify API for music taste visualization",
                    "Added Strava API support for fitness data art generation",
                    "Designed processing pipeline handling millions of daily requests"
                ]
            },
            images: [
                {
                    title: "Viral Growth",
                    src: require("../Assets/Images/ngenDNATrend.png"),
                    caption: "ngen took off with several trends, including Spotify DNA which had 4M+ users and 10M+ art pieces created, leading to viral TikTok posts and tutorials",
                    size: "large"
                },
                {
                    title: "Cult Classics",
                    src: require("../Assets/Images/ngenReceiptsReddit.png"),
                    caption: "Specific outputs would go viral in different subreddits for their innovative feature design across Strava and Spotify, leading to top posts in respective communities",
                    size: "large"
                }
            ],
            challenges: "Working solo was both rewarding and daunting - especially when things would break at 3am. I had to learn quickly how to make the right technical decisions that wouldn't come back to bite me as more people started using the platform.",
            learnings: "Looking back, there's a lot I would do differently with the UI/UX. But those mistakes taught me invaluable lessons about building better user experiences. I also learned the hard way about which systems actually scale well and how to keep infrastructure costs from exploding - turns out processing data client-side was a game-changer."
        },
        'day-by-data': {
            title: "Day By Data",
            headerImage: require("../Assets/Images/DayByDataHome.png"),
            skills: ["iOS", "Swift", "WidgetKit", "MusicKit", "HealthKit", "p5.js", "WebKit", "Spotify API"],
            description: "My first iOS app that turns your Apple Health, Music, and other data into beautiful art and widgets. Released December 2024.",
            link: "https://apps.apple.com/us/app/day-by-data/id6737629704",
            timeline: "Dec 2024 - Present",
            metrics: [
                "1000+ downloads in two weeks post-launch",
                "4.9 star rating on App Store"
            ],
            technicalDetails: {
                summary: "Native iOS app combining multiple Apple data sources into visual art and widgets.",
                bullets: [
                    "Built with Swift and iOS native frameworks",
                    "Integrated HealthKit, MusicKit, and WidgetKit",
                    "Created custom p5.js visualization engine in WebKit",
                    "Added Spotify integration for cross-platform music data",
                    "Designed for iOS widgets and sharing features"
                ]
            },
            images: [
                {
                    title: "Receipt Design",
                    src: require("../Assets/Images/DayByDataReceiptMockup.png"),
                    caption: "Allow users to visualize their step data as receipts, totalling their steps for the month, year, and all-time",
                    size: "large"
                },
                {
                    title: "Widget Design",
                    src: require("../Assets/Images/dayByDataWidgets.png"),
                    caption: "Sleep and distance data visualized side-by-side in iOS widgets, making personal data both beautiful and glanceable",
                    size: "large"
                }
            ],
            challenges: "Coming from web development, iOS and Swift were completely new territories. The learning curve was steep - especially with Apple's frameworks and strict App Store guidelines. It took a lot of submissions to get the first version approved lol.",
            learnings: "Once I got comfortable with Swift and iOS development, I fell in love with the ecosystem. It's opened up so many ideas for future apps. Currently working on a pro version with more features, but already excited about building more iOS apps. Give it a download and let me know what you think!"
        },
        'moon-teller': {
            title: "The Moon Teller",
            headerImage: require("../Assets/Images/MoonTellerPhone.png"),
            skills: ["p5.js", "AI", "Web Development", "Third-Party Integrations", "Cultural Design", "Music Industry"],
            description: "An interactive experience for Warner Music Group's Lunar New Year campaign, combining cultural elements with music discovery to drive playlist engagement and newsletter signups.",
            link: "https://themoonteller.com",
            timeline: "Jan 2025",
            metrics: [
                "Launched with Warner Music Group's Lunar New Year 2025 campaign",
                "Driving newsletter signups and playlist streams",
                "Results coming soon"
            ],
            technicalDetails: {
                summary: "Solo-designed and developed web experience combining AI-driven personalization with cultural storytelling.",
                bullets: [
                    "Built interactive questionnaire using p5.js for engaging visuals",
                    "Integrated with Warner Music's newsletter and streaming platforms",
                    "Created custom recommendation engine for playlist matching",
                    "Implemented analytics tracking for campaign metrics",
                    "Designed and developed according to Warner Music Group's guidelines"
                ]
            },
            images: [],
            challenges: "The main challenge was striking the perfect balance between honoring Lunar New Year traditions while creating an engaging music discovery experience. Had to ensure the design and interactions felt authentic to both the cultural moment and Warner's brand.",
            learnings: "This project taught me a lot about designing for cultural events and working with major music industry partners. Found a sweet spot between maintaining creative vision while meeting specific business objectives like newsletter signups and streams."
        },
        'rex-fit': {
            title: "Rex.Fit",
            headerImage: require("../Assets/Images/RexFitNutritionFactsPhone.png"),
            skills: ["Processing", "Google Cloud", "Data Visualization", "Fitness Tech", "Brand Design", "White Label"],
            description: "Designed and built custom fitness tracking visualizations for Rex.Fit (Y Combinator W23) WhatsApp chatbot, using a \"Nutrition Facts\"-inspired approach for clarity and white label flexibility.",
            link: "https://rex.fit",
            timeline: "September 2024",
            metrics: [
                "Integrated with existing WhatsApp chatbot",
                "Adaptable for white label partnerships",
                "Supporting users across different fitness journeys"
            ],
            technicalDetails: {
                summary: "Designed and developed visualization system for fitness data that could adapt to different branding needs while maintaining clarity and engagement.",
                bullets: [
                    "Built p5.js scripts for real-time visualization generation",
                    "Created \"Nutrition Facts\"-inspired design system for familiar data presentation",
                    "Integrated with WhatsApp's message format requirements",
                    "Developed flexible templating for white label adaptations",
                    "Implemented progress tracking against personalized fitness goals"
                ]
            },
            images: [],
            challenges: "The main challenge was designing visualizations that could work within WhatsApp's constraints while being flexible enough to adapt to different gym brands and user needs. Had to make sure the data was immediately understandable at a glance.",
            learnings: "This project taught me a lot about designing for constraints - both technical (WhatsApp) and business (white labeling). The \"Nutrition Facts\" approach ended up being a perfect solution since it's both familiar to users and highly adaptable."
        }
    };

    const project = projectDetails[projectId];

    if (!project) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="font-serif text-lg">Project not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <FadeIn>
                <div className="max-w-4xl mx-auto px-4 py-12">
                    {/* Project Title & Timeline */}
                    <h1 className="font-mono text-primary text-2xl mb-2">
                        {project.title}
                    </h1>
                    <div className="font-mono text-sm text-text/70 mb-8">
                        {project.timeline}
                    </div>

                    {/* Visit Project Link */}
                    <AnimatedLink 
                        href={project.link} 
                        isExternal
                        className="block mb-12 text-sm text-primary"
                    >
                        Visit Project
                    </AnimatedLink>

                    {/* Main Image */}
                    <div className="w-full aspect-[21/9] bg-cream-light rounded-lg overflow-hidden mb-8 
                                    transition-transform duration-500 hover:scale-[1.01]">
                        {project.headerImage ? (
                            <img 
                                src={project.headerImage} 
                                alt={project.title} 
                                className="w-full h-full object-cover object-center"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-coral-light to-sand-light" />
                        )}
                    </div>

                    {/* Description */}
                    <p className="font-serif text-lg mb-12">
                        {project.description}
                    </p>

                    {/* Impact Section */}
                    <div className="mb-12">
                        <h2 className="font-mono text-primary text-xl mb-6">Impact</h2>
                        <ul className="space-y-3">
                            {project.metrics.map((metric, index) => {
                                const formattedMetric = metric.replace(
                                    /(\d+(?:\.\d+)?[MBK+]*\+?)/g,
                                    '<span class="font-mono font-bold text-primary hover:scale-110 hover:-rotate-2 transition-all duration-300 inline-block">$1</span>'
                                );
                                
                                return (
                                    <li key={index} className="flex items-start gap-3 group">
                                        <span className="font-mono text-primary transition-transform duration-300 group-hover:rotate-12">></span>
                                        <span 
                                            className="font-serif"
                                            dangerouslySetInnerHTML={{ __html: formattedMetric }}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Technical Overview */}
                    <div className="mb-12">
                        <h2 className="font-mono text-primary text-xl mb-6">Technical Overview</h2>
                        <p className="font-serif mb-6">{project.technicalDetails.summary}</p>
                        <ul className="space-y-2">
                            {project.technicalDetails.bullets.map((bullet, index) => (
                                <li key={index} className="flex items-start gap-3 group">
                                    <span className="font-mono text-primary transition-transform duration-300 group-hover:rotate-12">></span>
                                    <span className="font-serif">{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-12">
                        {project.skills.map((skill, index) => (
                            <span key={index} 
                                  className="font-mono text-xs px-2 py-1 bg-cream-light 
                                           text-text/70 rounded">
                                {skill}
                            </span>
                        ))}
                    </div>

                    {/* Challenges & Learnings */}
                    <div className="mb-12">
                        <h2 className="font-mono text-primary text-xl mb-6">Challenges & Learnings</h2>
                        <div className="font-serif space-y-4">
                            <p>{project.challenges}</p>
                            <p>{project.learnings}</p>
                        </div>
                    </div>

                    {/* Images */}
                    {project.images && project.images.length > 0 && (
                        <div className="space-y-16 mb-12">
                            {project.images.map((image, index) => (
                                <div key={index} className="space-y-4">
                                    {/* Title and Caption */}
                                    <div className="space-y-2">
                                        <h3 className="font-mono text-primary text-lg">
                                            {image.title}
                                        </h3>
                                        <p className="font-mono text-sm text-text/70">
                                            {image.caption}
                                        </p>
                                    </div>
                                    
                                    {/* Image */}
                                    <div className="bg-cream-light rounded-lg overflow-hidden 
                                                transition-transform duration-500 hover:scale-[1.01]">
                                        <img 
                                            src={image.src} 
                                            alt={image.caption} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </FadeIn>
        </div>
    );
};

export default CaseStudyPage; 