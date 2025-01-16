import React from 'react';
import FadeIn from 'react-fade-in/lib/FadeIn';
import { 
    EnvelopeIcon, 
    CalendarIcon 
} from '@heroicons/react/24/outline';
import { 
    RiInstagramLine,
    RiTwitterLine,
    RiGithubLine,
    RiLinkedinLine,
    RiMailLine,
    RiCalendarLine,
} from 'react-icons/ri';
import { SiSubstack } from 'react-icons/si';

const ConnectPage = () => {
    const socialLinks = [
        {
            title: "Email",
            url: "mailto:pete@ngenart.com",
            description: "Best for project inquiries and collaboration opportunities",
            icon: RiMailLine
        },
        {
            title: "Schedule a Chat",
            url: "https://calendly.com/pcybr/chat?month=2025-01",
            description: "Book a free 30-minute chat to discuss ideas, art, or potential collaborations",
            icon: RiCalendarLine
        },
        {
            title: "Instagram",
            url: "https://instagram.com/_re_pete",
            description: "Follow for behind-the-scenes looks at my creative process and latest work",
            icon: RiInstagramLine
        },
        {
            title: "Twitter",
            url: "https://twitter.com/_re_pete",
            description: "Join discussions about creative coding, data art, and tech",
            icon: RiTwitterLine
        },
        {
            title: "GitHub",
            url: "https://github.com/pcybriwsky",
            description: "Check out my open-source projects and code experiments",
            icon: RiGithubLine
        },
        {
            title: "LinkedIn",
            url: "https://linkedin.com/in/pcybriwsky",
            description: "Connect professionally and see my work experience",
            icon: RiLinkedinLine
        },
        {
            title: "Substack",
            url: "https://repete.substack.com",
            description: "Subscribe to my newsletter for deep dives into data art and creative coding",
            icon: SiSubstack
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <FadeIn>
                <div className="max-w-4xl mx-auto px-6 py-16">
                    <h1 className="text-5xl font-mono text-primary mb-4">
                        Let's Connect
                    </h1>
                    <div className="prose max-w-none font-serif">
                        <p className="text-xl mb-12">
                            I'm always open to collaborations and conversations about data art, creative coding, 
                            or potential projects. Feel free to schedule a quick chat or drop me an email - 
                            initial consultations are always free.
                        </p>
                        
                        <div className="space-y-8">
                            {socialLinks.map((link, index) => (
                                <div key={index}>
                                    <a 
                                        href={link.url}
                                        target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                                        rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                                        className="group inline-flex items-center gap-1 font-mono text-lg 
                                                 hover:text-primary transition-all duration-300 
                                                 hover:scale-[1.02] hover:-rotate-1"
                                    >
                                        <link.icon className="w-5 h-5 opacity-0 -translate-x-2 transition-all 
                                                            duration-300 group-hover:opacity-100 
                                                            group-hover:translate-x-0" />
                                        <span>{link.title}</span>
                                    </a>
                                    <p className="font-serif text-text/70 mt-1">
                                        {link.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
};

export default ConnectPage; 