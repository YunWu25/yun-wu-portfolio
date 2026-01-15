import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';
import OrbitalSystem from './ProjectFlowOrbit';

interface ProjectFlowProps {
  language: Language;
}

const ProjectFlow: React.FC<ProjectFlowProps> = ({ language }) => {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  const content = {
    en: {
      intro: "Hey! I'm Yun Wu, a designer who loves turning ideas into something beautiful and functional. Every project is unique, but here's how I usually roll with clients – think of it as our collaborative adventure. I believe great design is about simplicity: making things intuitive, delightful, and effective. Let's make your vision pop!",
      ourJourney: 'Our Journey',
      phases: [
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
          description: "Finally, we go full color: style guides, fonts, icons, and all the juicy details. Pages come to life with custom flair."
        }
      ],
      clickToLearn: 'Click to learn more',
      faqs: [
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
      ],
    },
    zh: {
      intro: '嘿！我是吴云，一个喜欢把想法变成美丽而实用的东西的设计师。每个项目都是独特的，但这是我通常与客户合作的方式——把它想象成我们的协作冒险。我相信伟大的设计在于简洁：让事物直观、令人愉悦且有效。让我们实现您的愿景！',
      ourJourney: '我们的旅程',
      phases: [
        {
          title: '了解您的需求',
          description: '我们从讨论您的目标开始。我会深入研究用户调研、竞争对手分析，并整理核心需求。这有助于我们发现真正的问题并做出明智的假设来指导我们。'
        },
        {
          title: '头脑风暴',
          description: '接下来，我们制定用户场景并确定功能优先级。这就像绘制蓝图——有趣且灵活！'
        },
        {
          title: '工作坊氛围',
          description: '如果合适，我们可以快速进行工作坊以统一想法。想想协作草图或情绪板。'
        },
        {
          title: '原型魔法',
          description: '我制作低保真原型，梳理流程，并创建线框图。这是我们演示和快速迭代的地方。'
        },
        {
          title: '高保真润色',
          description: '最后，我们全彩呈现：风格指南、字体、图标和所有精彩细节。页面以定制风格栩栩如生。'
        }
      ],
      clickToLearn: '点击了解更多',
      faqs: [
        {
          question: '项目需要多长时间？',
          answer: '短期项目：2周完成。长期项目：最多6个月以达到完美。急活？我能搞定——让我们聊聊！'
        },
        {
          question: '价格是多少？',
          answer: '取决于范围，但我追求公平和透明。我们先谈细节，然后我会给您一个满意的报价。'
        },
        {
          question: '我们可以远程协作吗？',
          answer: '当然！使用Figma、Zoom等工具，或视频咖啡聊天。我在各国都很灵活。'
        },
        {
          question: '您涵盖哪些类别？',
          answer: '健康、政府、电子商务、汽车、保险……你能想到的，我可能都设计过！'
        }
      ],
    }
  };

  const t = content[language];

  // Double the phases to get 10 cards total
  const doublePhases = [...t.phases, ...t.phases];

  const handlePhaseClick = (index: number) => {
    setExpandedPhase(expandedPhase === index ? null : index);
  };

  return (
    <div id="projectflow-root" className="w-full">
      {/* Intro Text */}
      <div id="design-flow" className="text-center mb-16">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray500} justify-center`}>
          {t.intro}
        </p>
      </div>

      {/* Our Journey Title */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif text-coral">
          {t.ourJourney}
        </h2>
      </div>

      {/* 3D Three.js Orbital Container */}
      <div className="relative w-full h-150 md:h-175 mb-24">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          {/* Simple lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          
          <OrbitalSystem
            phases={doublePhases}
            expandedPhase={expandedPhase}
            onPhaseClick={handlePhaseClick}
            language={language}
          />
          {/* OrbitControls for dragging and rotating */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={20}
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* FAQ Section */}
      <div id="faq-section" className="mb-16">
        <h2 className="text-3xl md:text-4xl font-serif text-coral mb-8 text-center">
          FAQ
        </h2>
        <div className="space-y-6 max-w-3xl mx-auto">
          {t.faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h3 className={`font-sans text-xl md:text-2xl font-medium ${COLORS.gray900} mb-3`}>
                {faq.question}
              </h3>
              <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600}`}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectFlow;
