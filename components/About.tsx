import React from 'react';
import { TYPOGRAPHY, COLORS, MARQUEE } from '../styles';

const brandLogos = [
  { name: 'BELLE', src: 'images/brand-logo/BELLE.svg' },
  { name: 'Chinese Radio Seattle', src: 'images/brand-logo/chinese-radio-seattle.svg' },
  { name: 'Joy Moving', src: 'images/brand-logo/JOY-MOVING.svg' },
  { name: 'Luna', src: 'images/brand-logo/Luna.svg' },
  { name: 'MICA', src: 'images/brand-logo/MICA.svg' },
  { name: 'Murasec', src: 'images/brand-logo/Murasec.svg' },
  { name: 'Ride the Wind Workshop', src: 'images/brand-logo/Ride-the-Wind-Workshop.svg' },
  { name: 'Smile', src: 'images/brand-logo/smile.svg' },
  { name: 'US China Press', src: 'images/brand-logo/uschinapress.svg' },
];

const About: React.FC = () => {
  return (
    <div id="about-root" data-debug="about-root" className="w-full">
      <div id="about-header" data-debug="about-header" className="text-center mb-16">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray600}`}>
          "I focus on visual storytelling through photography and interactive design.
          Based in Seattle, I explore the intersection of nature, technology, and human emotion."
        </p>
      </div>

      <div id="about-body" data-debug="about-body" className={`${COLORS.gray500} font-light leading-loose`}>
        <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
          My past experience communicating with clients has made me skilled at understanding their needs and helping them find the solutions they're looking for. Using that insight as a foundation is one of the ways I want to dedicate myself to my craft. The experience I've gained from working as a consultant has strengthened my ability to approach and solve problems, and I know this journey will continue to be both rewarding and exciting.
        </p>
        <blockquote className="border-l-4 border-coral pl-4 italic text-gray-700 my-8 bg-gray-50 py-4 pr-4 rounded-r-lg">
          "Design is not just what it looks like and feels like. Design is how it works." <cite className="text-sm not-italic text-gray-500 ml-3"> — Steve Jobs.</cite>
        </blockquote>
        <img src="images/about-page-yun.jpg" alt="Yun Wu" className="w-full rounded-lg my-4" />
        <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
          I enjoy watching films and documentaries, and also love games like Animal Crossing. I'm passionate about documenting my life and the lives of my friends—for the past few years, I've been carefully selecting and sharing photos on a near-weekly basis that capture this stage of my journey.
        </p>

        <div className="mt-12">
          {/* <h3 className={`${TYPOGRAPHY.h3} mb-8`}>Services</h3> */}
          <h4 className={`${TYPOGRAPHY.h4} ${COLORS.gray900} mb-3`}>Services</h4>
          <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
            Let me help build out a unique, story-led photo campaign for your brand.
          </p>

          <h4 className={`${TYPOGRAPHY.h4} ${COLORS.gray900} mb-3`}>Photography</h4>
          <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
            Social Media Activation and Brand Representation:
            With an engaged and ever-growing audience of more than 100,000 followers,
            I help brands target new audiences through strategic social channel partnerships.
          </p>

          <h4 className={`${TYPOGRAPHY.h4} ${COLORS.gray900} mb-3`}>Brand Ambassadorship</h4>
          <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
            Always looking for new brands that align with my values
            to work on long-term partnerships, so get in touch!
          </p>
        </div>

        <div className="mt-16 mb-8 relative overflow-hidden py-12">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

          <div
            className="flex whitespace-nowrap"
            style={{
              animation: `marquee ${MARQUEE.ANIMATION_DURATION}s linear infinite`,
              ['--marquee-distance' as any]: `${-100 * MARQUEE.REPETITIONS}%`,
            }}
          >
            {Array(MARQUEE.REPETITIONS).fill(brandLogos).flat().map((brand, index) => (
              <div key={index} className="inline-flex items-center justify-center mx-16 opacity-100 min-w-[120px] flex-shrink-0">
                <img src={brand.src} alt={brand.name} className="h-24 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
