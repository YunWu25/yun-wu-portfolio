
import React from 'react';
import { TYPOGRAPHY, COLORS, LAYOUT } from '../styles';

const About: React.FC = () => {
  return (
    <div id="about-root" data-debug="about-root" className="w-full">
      <div id="about-header" data-debug="about-header" className="text-center mb-16">
        {/* <h2 className={TYPOGRAPHY.h2}>About Yun</h2> */}
        {/* <div className="h-1 w-16 bg-coral mx-auto rounded-full mb-8"></div> */}
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
          "Design is not just what it looks like and feels like. Design is how it works." <cite className="text-sm not-italic text-gray-500 ml-3"> — Steve Jobs</cite>
        </blockquote>
        <img src="images/about-page-yun.jpg" alt="Yun Wu" className="w-full rounded-lg my-4" />
        <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
          I enjoy watching films and documentaries, and also love games like Animal Crossing. I'm passionate about documenting my life and the lives of my friends—for the past few years, I've been carefully selecting and sharing photos on a near-weekly basis that capture this stage of my journey.
        </p>

        <div className="mt-12">
          {/* <h3 className={`${TYPOGRAPHY.h3} mb-8`}>Services</h3> */}
          <h4 className={`text-xl ${COLORS.gray900}`}>Services</h4>
          <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
            Let me help build out a unique, story-led photo campaign for your brand.
          </p>

          <h4 className={`text-xl ${COLORS.gray900}`}>Photography</h4>
          <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
            Social Media Activation and Brand Representation:
            With an engaged and ever-growing audience of more than 100,000 followers,
            I help brands target new audiences through strategic social channel partnerships.
          </p>

          <h4 className={`text-xl ${COLORS.gray900}`}>Brand Ambassadorship</h4>
          <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
            Always looking for new brands that align with my values
            to work on long-term partnerships, so get in touch!
          </p>
        </div>

      </div>

      <div id="about-footer" data-debug="about-footer" className={`mt-16 pt-8 border-t border-gray-100 flex justify-between ${TYPOGRAPHY.small} ${COLORS.gray400}`}>
        <span>Seattle, WA</span>
        <span>Available for freelance</span>
      </div>
    </div>
  );
};

export default About;
