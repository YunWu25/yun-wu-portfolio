import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { ViewState } from '../types';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';

interface NavRowProps {
  label: string;
  onClick?: () => void;
  viewText: string;
}

const NavRow: React.FC<NavRowProps> = ({ label, onClick, viewText }) => (
  <div
    className={`group flex flex-col md:flex-row md:items-center justify-between border-b border-transparent hover:border-gray-100 pb-2 ${TYPOGRAPHY.link}`}
    onClick={onClick}
  >
    <span data-wobble-target className={`inline-block ${TYPOGRAPHY.navSubItem} ${COLORS.gray500} group-hover:text-coral transition-colors`}>
      {label}
    </span>
    <div className={`flex items-center ${TYPOGRAPHY.navSubItem} ${COLORS.gray400} group-hover:text-coral transition-colors mt-2 md:mt-0`}>
      <span data-wobble-target className="inline-block">{viewText}</span>
      <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

interface ContactRowProps {
  label: string;
  value: string;
  href: string;
  className?: string;
}

const ContactRow: React.FC<ContactRowProps> = ({ label, value, href, className = '' }) => (
  <div className={`flex flex-col md:flex-row md:items-center justify-between border-transparent hover:border-gray-100 pb-2 ${className}`}>
    <span data-wobble-target className={`inline-block ${TYPOGRAPHY.navSubItem} ${COLORS.gray500}`}>{label}</span>
    <a
      data-wobble-target
      href={href}
      className={`inline-block ${TYPOGRAPHY.navSubItem} ${COLORS.gray400} hover:text-gray-800 hover:underline decoration-coral decoration-1 underline-offset-8 transition-all mt-2 md:mt-0`}
    >
      {value}
    </a>
  </div>
);

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  language: Language;
}

const Home: React.FC<HomeProps> = ({ onNavigate, language }) => {
  const [currentTime, setCurrentTime] = useState('');

  const text = {
    en: {
      design: 'Design',
      video: 'Video',
      photography: 'Photography',
      sendEmail: 'Send Email',
      call: 'Call, text, WhatsApp',
      location: 'Currently based in Seattle, WA',
      view: 'View'
    },
    zh: {
      design: '设计',
      video: '影片',
      photography: '摄影',
      sendEmail: '发送邮件',
      call: '电话、短信、WhatsApp',
      location: '目前在西雅图',
      view: '查看'
    }
  };

  const t = text[language];

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
    const interval = setInterval(updateTime, 1000);
    return () => { clearInterval(interval); };
  }, []);

  const viewText = language === 'en' ? 'View' : '查看';

  return (
    <div id="home-root" className="flex flex-col justify-end space-y-8 md:space-y-10 w-full min-h-[40vh]">
      {/* Navigation and Contact Rows */}
      <div className="flex flex-col space-y-4">
        <NavRow label={t.design} onClick={() => { onNavigate(ViewState.DESIGN); }} viewText={viewText} />
        <NavRow label={t.video} onClick={() => { onNavigate(ViewState.VIDEO); }} viewText={viewText} />
        <NavRow label={t.photography} onClick={() => { onNavigate(ViewState.PHOTOGRAPHY); }} viewText={viewText} />

        <ContactRow label={t.sendEmail} value="Yunwustudio@gmail.com" href="mailto:Yunwustudio@gmail.com" />
        <ContactRow label={t.call} value="+1 4258372524" href="tel:+14258372524" />
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-transparent pb-2">
          <span data-wobble-target className={`inline-block ${TYPOGRAPHY.navSubItem} ${COLORS.gray500}`}>
            {t.location}
          </span>
          <span data-wobble-target className={`inline-block ${TYPOGRAPHY.navSubItem} ${COLORS.coral} font-mono mt-2 md:mt-0`}>
            {currentTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
