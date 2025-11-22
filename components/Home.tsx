
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { ViewState } from '../types';
import { TYPOGRAPHY, COLORS } from '../styles';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const NavRow = ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <div
      className={`group flex flex-col md:flex-row md:items-center justify-between border-b border-transparent hover:border-gray-100 pb-2 ${TYPOGRAPHY.link}`}
      onClick={onClick}
    >
      <span className={`${TYPOGRAPHY.navItem} ${COLORS.gray500} group-hover:text-coral transition-colors`}>
        {label}
      </span>
      <div className={`flex items-center ${TYPOGRAPHY.body} ${COLORS.gray400} group-hover:text-coral transition-colors mt-2 md:mt-0`}>
        <span>View</span>
        <ArrowRight size={24} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );

  const ContactRow = ({ label, value, href, className = '' }: { label: string; value: string; href: string; className?: string }) => (
    <div className={`flex flex-col md:flex-row md:items-center justify-between ${className}`}>
      <span className={`${TYPOGRAPHY.navItem} ${COLORS.gray500}`}>{label}</span>
      <a
        href={href}
        className={`${TYPOGRAPHY.body} ${COLORS.gray400} hover:text-gray-800 hover:underline decoration-coral decoration-1 underline-offset-8 transition-all mt-2 md:mt-0`}
      >
        {value}
      </a>
    </div>
  );

  return (
    <div id="home-root" data-debug="home-root" className="flex flex-col space-y-8 md:space-y-10 w-full">
      {/* Navigation Rows */}
      <NavRow label="Photography" onClick={() => onNavigate(ViewState.PHOTOGRAPHY)} />
      <NavRow label="Design" onClick={() => { }} />

      {/* Contact Rows */}
      <div className="space-y-8 md:space-y-0">
        <ContactRow label="Call, text, WhatsApp" value="+1 4258372524" href="tel:+14258372524" className="pt-4" />
        <ContactRow label="Send Email" value="Yunwustudio@gmail.com" href="mailto:Yunwustudio@gmail.com" />
      </div>

      {/* Location / Time Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pt-8">
        <span className={`${TYPOGRAPHY.body} ${COLORS.gray400}`}>
          Currently based in Seattle, WA
        </span>
        <span className={`${TYPOGRAPHY.body} text-coral font-mono mt-2 md:mt-0`}>
          {currentTime}
        </span>
      </div>
    </div>
  );
};

export default Home;
