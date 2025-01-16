import React from 'react';
import { Link } from 'react-router-dom';
import FadeIn from 'react-fade-in/lib/FadeIn';

const NavItem = ({ label, icon, href }) => {
    return (
        <Link 
            to={href} 
            className="group relative flex items-center font-mono text-lg hover:text-primary transition-colors duration-300"
        >
            <span className="absolute right-full mr-3 text-primary opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                {icon}
            </span>
            {label}
        </Link>
    );
};

const Landing = () => {
    const navItems = [
        { label: "work", icon: "⚡", href: "/work" },
        { label: "art", icon: "✧", href: "/art" },
        { label: "about", icon: "→", href: "/about" },
        { label: "contact", icon: "✉", href: "/contact" }
    ];

    return (
        <div className="min-h-screen flex flex-col justify-center">
            <FadeIn>
                <div className="max-w-3xl mx-auto px-4">
                    {/* Intro */}
                    <h1 className="text-5xl font-serif font-bold italic text-primary mb-6">
                        Hi, I'm Pete
                    </h1>
                    
                    <p className="font-serif text-xl mb-8 leading-relaxed">
                        I'm an entrepreneur and artist working at the intersection of data, art, and technology. 
                        I build viral apps that help millions express themselves through their data, and partner 
                        with companies to tell compelling stories with theirs.
                    </p>

                    {/* Navigation */}
                    <nav className="space-y-4">
                        {navItems.map((item, index) => (
                            <NavItem 
                                key={index}
                                label={item.label}
                                icon={item.icon}
                                href={item.href}
                            />
                        ))}
                    </nav>
                </div>
            </FadeIn>
        </div>
    );
};

export default Landing; 