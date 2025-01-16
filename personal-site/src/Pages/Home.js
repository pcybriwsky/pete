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
            <span>{label}</span>
            <span className="opacity-0 translate-x-2 transition-all duration-300 
                           group-hover:opacity-100 group-hover:translate-x-0">
                {getNavIcon(label)}
            </span>
        </button>
    );
};

const Landing = () => {
    const navItems = ["work", "art", "re:Pete", "contact"];
    const roles = ["Full-Stack & iOS Developer", "Data Artist", "Entrepreneur"];

    return (
        <div className="min-h-screen flex flex-col justify-center px-6" id="top">
            <div className="max-w-5xl py-8 mx-auto grid grid-cols-1 laptop:grid-cols-2 gap-12">
                {/* Profile Picture for Mobile */}
                <div className="flex items-center justify-center laptop:hidden mb-4">
                    <img 
                        className="w-[200px] h-[200px] rounded-full shadow-2xl" 
                        src={require("../Assets/Images/headshot.png")}
                        alt="Profile Picture" 
                    />
                </div>

                {/* Text Content */}
                <div className="text-left">
                    <h1 className="text-4xl laptop:text-5xl font-mono text-primary mb-4">
                        Hi, I'm Pete
                    </h1>

                    {/* Role Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {roles.map((role, index) => (
                            <span 
                                key={index}
                                className="font-mono text-xs px-2 py-1 bg-cream-light 
                                         text-text/70 rounded"
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                    
                    <p className="font-serif text-lg laptop:text-xl mb-8 leading-relaxed">
                        I'm an entrepreneur and artist working at the intersection of data, art, and technology. 
                        <br className="hidden laptop:block" />
                        <br className="hidden laptop:block" />
                        I build viral apps that help millions express themselves through their data, and partner 
                        with companies to tell compelling stories with theirs.
                    </p>

                    {/* Navigation - 2x2 grid on mobile, row on desktop */}
                    <div className="grid grid-cols-2 laptop:flex laptop:flex-row gap-4 laptop:gap-8 
                                  justify-items-start laptop:justify-start">
                        {navItems.map((item) => (
                            <NavItem key={item} label={item} />
                        ))}
                    </div>
                </div>
                
                {/* Profile Picture for Desktop */}
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