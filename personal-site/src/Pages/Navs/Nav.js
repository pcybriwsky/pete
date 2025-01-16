import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BsLightning, BsPalette, BsPerson, BsEnvelope } from 'react-icons/bs';

const Logo = () => {
    return (
        <div className='group flex items-center transition-all duration-300 hover:scale-[1.02] hover:-rotate-1'>
            <span className='text-2xl font-mono text-[#0a0a0a]'>:</span>
            <span className='text-2xl font-mono bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_auto] animate-gradient-fast bg-clip-text text-transparent'>
                P
            </span>
            <span className='text-2xl font-mono opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0'>
                (ete)
            </span>
        </div>
    );
};

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

const NavItem = ({ label, isMobile = false, onClick }) => {
    const navigate = useNavigate();
    
    const handleClick = (e) => {
        e.preventDefault();
        if (onClick) onClick(); // Close mobile menu if needed
        
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
            className={`
                group inline-flex items-center gap-2 font-mono hover:text-primary 
                transition-all duration-300 hover:scale-[1.02] hover:-rotate-1
                ${isMobile ? 'text-2xl py-4' : 'text-sm'}
            `}
        >
            <span className="opacity-0 -translate-x-2 transition-all duration-300 
                           group-hover:opacity-100 group-hover:translate-x-0">
                {getNavIcon(label)}
            </span>
            {label}
        </button>
    );
};

const MobileMenu = ({ isOpen, onClose, navItems }) => {
    return (
        <div 
            className={`
                fixed inset-0 bg-background/98 backdrop-blur-sm z-50
                flex flex-col items-center justify-center
                transition-all duration-500 ease-in-out
                ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
            `}
        >
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-2xl font-mono hover:text-primary transition-colors"
            >
                ×
            </button>

            {/* Mobile Nav Items */}
            <div className="flex flex-col items-center space-y-6">
                {navItems.map((item) => (
                    <NavItem 
                        key={item} 
                        label={item} 
                        isMobile={true}
                        onClick={onClose}
                    />
                ))}
            </div>
        </div>
    );
};

const HamburgerButton = ({ onClick, isOpen }) => {
    return (
        <button 
            onClick={onClick}
            className="laptop:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
        >
            <span className={`
                block w-6 h-0.5 bg-text transition-all duration-300
                ${isOpen ? 'rotate-45 translate-y-2' : ''}
            `}></span>
            <span className={`
                block w-6 h-0.5 bg-text transition-all duration-300
                ${isOpen ? 'opacity-0' : ''}
            `}></span>
            <span className={`
                block w-6 h-0.5 bg-text transition-all duration-300
                ${isOpen ? '-rotate-45 -translate-y-2' : ''}
            `}></span>
        </button>
    );
};

const Nav = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';
    const navItems = ["work", "art", "re:Pete", "contact"];
    
    const [navColor, setNavColor] = useState('bg-background');
    const [showNavItems, setShowNavItems] = useState(!isLandingPage);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isLandingPage) {
            setShowNavItems(true);
            return;
        }

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            
            // Update nav background
            if (scrollPosition > 0) {
                setNavColor('bg-alt shadow-sm');
            } else {
                setNavColor('bg-background');
            }

            // Update nav items visibility only on landing page
            if (scrollPosition > windowHeight * 0.4) {
                setShowNavItems(true);
            } else {
                setShowNavItems(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLandingPage]);

    return (
        <>
            <nav className={`${navColor} sticky top-0 transition-all duration-300 z-40`}>
                <div className='mx-auto w-[80%] flex justify-between items-center py-[10px]'>
                    <a href='/' className='scroll-smooth'>
                        <Logo />
                    </a>
                    <div className="flex items-center">
                        {/* Desktop Navigation */}
                        <div className={`
                            hidden laptop:flex gap-8 transition-all duration-500
                            ${isLandingPage && !showNavItems ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
                        `}>
                            {navItems.map((item) => (
                                <NavItem key={item} label={item} />
                            ))}
                        </div>
                        {/* Mobile Menu Button */}
                        <div className={`
                            laptop:hidden
                            transition-all duration-500
                            ${isLandingPage && !showNavItems ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
                        `}>
                            <HamburgerButton 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                isOpen={isMobileMenuOpen}
                            />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <MobileMenu 
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                navItems={navItems}
            />
        </>
    );
};

export default Nav;
