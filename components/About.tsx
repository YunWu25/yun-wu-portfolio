
import React from 'react';
import { TYPOGRAPHY, COLORS, LAYOUT } from '../styles';

const About: React.FC = () => {
  return (
    <div id="about-root" data-debug="about-root" className="w-full">
      <div id="about-header" data-debug="about-header" className="text-center mb-16">
        <h2 className={TYPOGRAPHY.h2}>About Yun</h2>
        <div className="h-1 w-16 bg-coral mx-auto rounded-full mb-8"></div>
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray600}`}>
          "I focus on visual storytelling through photography and interactive design.
          Based in Seattle, I explore the intersection of nature, technology, and human emotion."
        </p>
      </div>

      <div id="about-body" data-debug="about-body" className={`${COLORS.gray500} font-light leading-loose`}>
        <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
        <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>
        <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
        </p>
        <blockquote className="border-l-4 border-coral pl-4 italic text-gray-700 my-8 bg-gray-50 py-4 pr-4 rounded-r-lg">
          "Design is not just what it looks like and feels like. Design is how it works."
        </blockquote>
        <p className={TYPOGRAPHY.bodySmall}>
          Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
        </p>
      </div>

      <div id="about-footer" data-debug="about-footer" className={`mt-16 pt-8 border-t border-gray-100 flex justify-between ${TYPOGRAPHY.small} ${COLORS.gray400}`}>
        <span>Seattle, WA</span>
        <span>Available for freelance</span>
      </div>
    </div>
  );
};

export default About;
