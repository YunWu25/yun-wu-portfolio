import React from 'react';
import { TYPOGRAPHY, COLORS, BORDERS } from '../styles';
import { MARQUEE } from '../constants';
import { Language } from '../App';

interface AboutProps {
  language: Language;
}

interface BrandLogo {
  name: string;
  src: string;
}

const brandLogos: BrandLogo[] = [
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

const About: React.FC<AboutProps> = ({ language }) => {
  const content = {
    en: {
      intro:
        '"I focus on visual storytelling through photography and interactive design. Based in Seattle, I explore the intersection of nature, technology, and human emotion."',
      bio1: "My past experience communicating with clients has made me skilled at understanding their needs and helping them find the solutions they're looking for. Using that insight as a foundation is one of the ways I want to dedicate myself to my craft. The experience I've gained from working as a consultant has strengthened my ability to approach and solve problems, and I know this journey will continue to be both rewarding and exciting.",
      quote: '"Design is not just what it looks like and feels like. Design is how it works."',
      quoteAuthor: '— Steve Jobs.',
      bio2: "I enjoy watching films and documentaries, and also love games like Animal Crossing. I'm passionate about documenting my life and the lives of my friends—for the past few years, I've been carefully selecting and sharing photos on a near-weekly basis that capture this stage of my journey.",
      services: 'Services',
      servicesDesc: 'Let me help build out a unique, story-led photo campaign for your brand.',
      photography: 'Photography',
      photographyDesc:
        'Social Media Activation and Brand Representation: With an engaged and ever-growing audience of more than 100,000 followers, I help brands target new audiences through strategic social channel partnerships.',
      brandAmbassador: 'Brand Ambassadorship',
      brandAmbassadorDesc:
        'Always looking for new brands that align with my values to work on long-term partnerships, so get in touch!',
    },
    zh: {
      intro:
        '"我专注于通过摄影和互动设计进行视觉叙事。在西雅图，我探索自然、技术和人类情感的交集。"',
      bio1: '与客户沟通的经验使我擅长理解他们的需求并帮助他们找到解决方案。以这种洞察力为基础是我致力于自己工艺的方式之一。作为顾问的经验增强了我解决问题的能力，我知道这段旅程将继续既有收获又令人兴奋。',
      quote: '"设计不仅仅是外观和感觉。设计是它如何工作。"',
      quoteAuthor: '— 史蒂夫·乔布斯',
      bio2: '我喜欢看电影和纪录片，也喜欢玩《动物森友会》等游戏。我热衷于记录我和朋友们的生活——在过去的几年里，我几乎每周都会精心挑选并分享捕捉这一人生阶段的照片。',
      services: '服务',
      servicesDesc: '让我帮助为您的品牌打造独特的、以故事为主导的照片活动。',
      photography: '摄影',
      photographyDesc:
        '社交媒体激活和品牌代言：凭借超过10万名活跃且不断增长的粉丝，我通过战略性社交渠道合作帮助品牌瞄准新受众。',
      brandAmbassador: '品牌大使',
      brandAmbassadorDesc: '一直在寻找与我的价值观一致的新品牌进行长期合作，所以请联系我！',
    },
  };

  const t = content[language];

  return (
    <div id="about-root" className="w-full">
      <div id="about-header" className="text-center mb-16">
        <p data-wobble-target className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
          {t.intro}
        </p>
      </div>

      <div id="about-body">
        <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600} mb-6`}>{t.bio1}</p>
        <blockquote
          data-wobble-target
          className={`border-l-4 ${COLORS.borderCoral} pl-4 italic ${COLORS.gray700} my-8 ${COLORS.bgGray50} py-4 pr-4 rounded-r-lg`}
        >
          {t.quote}{' '}
          <cite className={`text-sm not-italic ${COLORS.gray500} ml-3`}>{t.quoteAuthor}</cite>
        </blockquote>
        <img
          data-wobble-target
          src="images/about-page-yun.jpg"
          alt="Yun Wu"
          className={`w-full ${BORDERS.radius.md} my-4`}
        />
        <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600} mb-6`}>{t.bio2}</p>

        <div className="mt-12">
          <h4 data-wobble-target className={`${TYPOGRAPHY.sectionHeading} ${COLORS.gray900} mb-3`}>
            {t.services}
          </h4>
          <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600} mb-6`}>{t.servicesDesc}</p>

          <h4 data-wobble-target className={`${TYPOGRAPHY.sectionHeading} ${COLORS.gray900} mb-3`}>
            {t.photography}
          </h4>
          <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600} mb-6`}>{t.photographyDesc}</p>

          <h4 data-wobble-target className={`${TYPOGRAPHY.sectionHeading} ${COLORS.gray900} mb-3`}>
            {t.brandAmbassador}
          </h4>
          <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600} mb-6`}>
            {t.brandAmbassadorDesc}
          </p>
        </div>

        <div className="mt-16 mb-8 relative overflow-hidden py-12">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

          <div
            className="flex whitespace-nowrap"
            style={
              {
                animation: `marquee ${MARQUEE.ANIMATION_DURATION}s linear infinite`,
                '--marquee-distance': `${-100 * MARQUEE.REPETITIONS}%`,
              } as React.CSSProperties
            }
          >
            {(Array(MARQUEE.REPETITIONS).fill(brandLogos) as BrandLogo[][])
              .flat()
              .map((brand, index) => (
                <div
                  data-wobble-target
                  key={index}
                  className="inline-flex items-center justify-center mx-16 opacity-100 min-w-30 shrink-0"
                >
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
