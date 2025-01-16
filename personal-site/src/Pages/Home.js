import React from 'react';
import AboutMe from './Components/About/AboutMe';
import Resources from './Components/Resources/Resources';
import Work from './Components/Work/Work';
import CaseStudies from './Components/Work/CaseStudies';
import FadeIn from 'react-fade-in/lib/FadeIn';

const NavItem = ({ label }) => {
    const href = label === "re:Pete" ? "/about" : `#${label}`;
    
    return (
        <a 
            href={href}
            className="font-mono text-lg hover:text-primary transition-colors duration-300"
        >
            {label}
        </a>
    );
};

const Landing = () => {
    const navItems = ["work", "art", "re:Pete", "contact"];

    return (
        <div className="min-h-screen flex flex-col justify-center" id="top">
            <div className="max-w-5xl mx-auto grid grid-cols-1 laptop:grid-cols-2 gap-12">
                <div className="text-left">
                    {/* Intro */}
                    <h1 className="text-5xl font-mono text-primary mb-6">
                        Hi, I'm Pete
                    </h1>
                    
                    <p className="font-serif text-xl mb-8 leading-relaxed">
                        I'm an entrepreneur and artist working at the intersection of data, art, and technology. 
                        <br />
                        <br />
                        I build viral apps that help millions express themselves through their data, and partner 
                        with companies to tell compelling stories with theirs.
                    </p>

                    {/* Navigation */}
                    <div className="flex gap-8">
                        {navItems.map((item) => (
                            <NavItem key={item} label={item} />
                        ))}
                    </div>
                </div>
                
                {/* Profile Picture */}
                <div className="flex items-center justify-center laptop:justify-end">
                    <img 
                        className="w-[300px] h-[300px] rounded-full shadow-2xl" 
                        src={require("../Assets/Images/headshot.png")}
                        alt="Profile Picture" 
                    />
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    return (
        <div className="App bg-dancing-gradient animate-gradient-dance text-text scroll-smooth">
            <div className='w-[80%] mx-auto scroll-smooth'>
                <Landing />
                <div id="work">
                    <CaseStudies />
                </div>
            </div>
        </div>
    );
}

export default Home;