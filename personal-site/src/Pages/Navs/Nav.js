import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Logo = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
            className='flex items-center group'
        >
            <span className='text-2xl font-mono text-[#0a0a0a]'>:</span>
            <span className='text-2xl font-mono bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_auto] animate-gradient-fast bg-clip-text text-transparent'>
                P
            </span>
            <span 
                className={`
                    text-2xl
                    font-mono
                    transform
                    transition-all
                    duration-300
                    ease-out
                    ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                `}
            >
                (ete)
            </span>
        </div>
    );
};

const NavItem = ({ label, isMobile = false, onClick }) => {
    const href = label === "re:Pete" ? "/about" : `#${label}`;
    
    return (
        <a 
            href={href}
            onClick={onClick}
            className={`
                font-mono text-lg hover:text-primary transition-colors duration-300
                ${isMobile ? 'text-2xl py-4' : ''}
            `}
        >
            {label}
        </a>
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
