import React from 'react';
import { useNavigate } from 'react-router-dom';
import FadeIn from 'react-fade-in/lib/FadeIn';
import { BsLightning, BsPalette, BsPerson, BsEnvelope } from 'react-icons/bs';

const getNavIcon = (label) => {
    switch (label.toLowerCase()) {
        case 'work':
            return <BsLightning className="w-4 h-4" />;
        case 'art':
            return <BsPalette className="w-4 h-4" />;
        case 're:pete':
            return <BsPerson className="w-4 h-4" />;
        case 'contact':
            return <BsEnvelope className="w-4 h-4" />;
        default:
            return null;
    }
};

const NavItem = ({ label }) => {
    const navigate = useNavigate();
    
    const handleClick = (e) => {
        e.preventDefault();
        switch(label.toLowerCase()) {
            case 're:pete':
                navigate('/about');
                break;
            case 'work':
                navigate('/work');
                break;
            case 'art':
                navigate('/art');
                break;
            case 'contact':
                navigate('/connect');
                break;
            default:
                break;
        }
    };
    
    return (
        <button 
            onClick={handleClick}
            className="group inline-flex items-center gap-2 font-mono hover:text-primary 
                      transition-all duration-300 hover:scale-[1.02] hover:-rotate-1 text-base"
        >
            <span className="opacity-0 -translate-x-2 transition-all duration-300 
                           group-hover:opacity-100 group-hover:translate-x-0">
                {getNavIcon(label)}
            </span>
            {label}
        </button>
    );
};

const Landing = () => {
    const navItems = ["work", "art", "re:Pete", "contact"];

    return (
        <div className="min-h-screen flex flex-col justify-center px-6" id="top">
            <div className="max-w-5xl py-8 mx-auto grid grid-cols-1 laptop:grid-cols-2 gap-12">
                {/* Profile Picture for Mobile - Shows at top on mobile, hidden on desktop */}
                <div className="flex items-center justify-center laptop:hidden mb-4">
                    <img 
                        className="w-[200px] h-[200px] rounded-full shadow-2xl" 
                        src={require("../Assets/Images/headshot.png")}
                        alt="Profile Picture" 
                    />
                </div>

                {/* Text Content */}
                <div className="text-left">
                    <h1 className="text-4xl laptop:text-5xl font-mono text-primary mb-6">
                        Hi, I'm Pete
                    </h1>
                    
                    <p className="font-serif text-lg laptop:text-xl mb-8 leading-relaxed">
                        I'm an entrepreneur and artist working at the intersection of data, art, and technology. 
                        <br className="hidden laptop:block" />
                        <br className="hidden laptop:block" />
                        I build viral apps that help millions express themselves through their data, and partner 
                        with companies to tell compelling stories with theirs.
                    </p>

                    {/* Navigation */}
                    <div className="flex flex-col laptop:flex-row gap-4 laptop:gap-8">
                        {navItems.map((item) => (
                            <NavItem key={item} label={item} />
                        ))}
                    </div>
                </div>
                
                {/* Profile Picture for Desktop - Hidden on mobile, shows on right on desktop */}
                <div className="hidden laptop:flex items-center justify-center laptop:justify-end">
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
            <FadeIn>
                <Landing />
            </FadeIn>
        </div>
    );
}

export default Home;