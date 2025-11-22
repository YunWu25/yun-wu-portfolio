
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
          My past experience communicating with clients had made me good at understanding them and helping them find the solutions they wanted, and using that thinking as a starting point was one of the ways I wanted to dedicate myself, I think. The past life experience I have gained from working as a consultant and building on that has made me better at dealing with and solving problems, and I know I will have more fun on this journey as well ......
        </p>
        <p className={`${TYPOGRAPHY.bodySmall} mb-6`}>
          I watching some movies and documentaries, and also enjoying the likes of Animal Crossing...... Sometimes obsessed with documenting my life and the lives of my friends, and for the past few years I've been picking out, on average, almost weekly, photos that I feel comfortable sharing at this stage of my life.
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
