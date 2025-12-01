import React from 'react';
import { TYPOGRAPHY, COLORS } from '../styles';

const ProjectFlow: React.FC = () => {
  const phases = [
    {
      title: 'Understanding What You Need',
      description: "We kick off by chatting about your goals. I'll dive into user research, competitor analysis, and sort out the core requirements. This helps us spot the real problem and make smart assumptions to guide us."
    },
    {
      title: 'Brainstorming Ideas',
      description: "Next, we map out user scenarios and prioritize features. It's like sketching the blueprint – fun and flexible!"
    },
    {
      title: 'Workshop Vibes',
      description: "If it fits, we can hop on a quick workshop to align ideas. Think collaborative sketching or mood boarding."
    },
    {
      title: 'Prototyping Magic',
      description: "I whip up low-fi prototypes, comb through processes, and create wireframes. This is where we demo and iterate fast."
    },
    {
      title: 'Hi-Fi Polish',
      description: "Finally, we go full color: style guides, fonts, icons, and all the juicy details. Pages come to life with Bootstrap vibes if needed, or custom flair."
    }
  ];

  const faqs = [
    {
      question: 'How long does a project take?',
      answer: "Short ones: 2 weeks to nail it. Longer epics: up to 6 months for perfection. Rush jobs? I got you – let's chat!"
    },
    {
      question: "What's the price?",
      answer: "Depends on the scope, but I aim for fair and transparent. We talk details first, then I quote something you'll love."
    },
    {
      question: 'Can we collaborate remotely?',
      answer: "Absolutely! Tools like Figma, Zoom, or even coffee chats via video. I'm flexible across countries."
    },
    {
      question: 'What categories do you cover?',
      answer: "Health, government, e-commerce, automotive, insurance... you name it, I've probably designed for it!"
    }
  ];

  return (
    <div id="projectflow-root" className="w-full">
      {/* Design Flow Header */}
      <div id="design-flow" className="text-center mb-16">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray600}`}>
          "Hey! I'm Yun Wu, a designer who loves turning ideas into something beautiful and functional. 
          Every project is unique, but here's how I usually roll with clients - think of it as our collaborative adventure.
          I believe great design is about simplicity: making things intuitive, delightful, and effective. Let's make your vision pop!"
        </p>
      </div>

      {/* Our Journey */}
      <div id="our-journey" className="mb-16">
        <h2 className="text-4xl md:text-5xl font-serif text-coral mb-12 text-center">
          Our Journey
        </h2>
        
        <div className="space-y-8 max-w-3xl mx-auto">
          {phases.map((phase, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-8 border border-gray-200 hover:border-coral transition-colors"
            >
              <h3 className="text-2xl font-sans text-coral font-medium mb-4 text-center">
                {phase.title}
              </h3>
              <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600} leading-relaxed text-center`}>
                {phase.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq-section" className="mb-16">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h4 className={`${TYPOGRAPHY.h4} ${COLORS.gray900} mb-3`}>
                {faq.question}
              </h4>
              <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600}`}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* More Section */}
      <div id="more-section" className="text-center py-12">
        <h2 className="text-6xl md:text-7xl font-serif text-gray-200 mb-4">
          More....
        </h2>
        <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray400}`}>
          My site is always evolving, just like my designs. Stay tuned for more updates!
        </p>
      </div>
    </div>
  );
};

export default ProjectFlow;
