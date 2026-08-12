import React, { useState } from 'react';
import { Language } from '../App';
import { COLORS, TYPOGRAPHY } from '../styles';
import FixationTraining from './eyecare/FixationTraining';
import SaccadesTraining from './eyecare/SaccadesTraining';
import PursuitsTraining from './eyecare/PursuitsTraining';

type TrainingModule = 'fixation' | 'saccades' | 'pursuits' | null;

interface EyeCareProps {
  language: Language;
}

const content = {
  en: {
    title: 'Eye Care Training',
    subtitle: 'Interactive exercises to strengthen your eye muscles',
    fixation: {
      name: 'Fixation',
      description: 'Train focus and concentration by locking your gaze on targets that flash and change position.',
    },
    saccades: {
      name: 'Saccades',
      description: 'Improve rapid eye movements by quickly tracking targets that appear at different positions.',
    },
    pursuits: {
      name: 'Pursuits',
      description: 'Enhance smooth eye movements by following a ball along circular and wave patterns.',
    },
    startTraining: 'Start Training',
    selectModule: 'Select a training module to begin',
  },
  zh: {
    title: '护眼训练',
    subtitle: '互动练习，强化眼部肌肉',
    fixation: {
      name: '定神聚焦',
      description: '通过锁定闪烁和变换位置的目标，训练眼神的专注度和爆发力。',
    },
    saccades: {
      name: '快速跳跃',
      description: '快速追踪随机出现的目标，训练眼神的灵敏度。',
    },
    pursuits: {
      name: '圆滑追踪',
      description: '跟随沿圆形、波浪形轨迹移动的小球，纠正眼神呆滞。',
    },
    startTraining: '开始训练',
    selectModule: '选择训练模块开始',
  },
};

const EyeCare: React.FC<EyeCareProps> = ({ language }) => {
  const [activeModule, setActiveModule] = useState<TrainingModule>(null);
  const [selectedModule, setSelectedModule] = useState<TrainingModule>(null);
  const t = content[language];

  // If a training module is active, show it fullscreen
  if (activeModule === 'fixation') {
    return <FixationTraining language={language} onExit={() => { setActiveModule(null); }} />;
  }
  if (activeModule === 'saccades') {
    return <SaccadesTraining language={language} onExit={() => { setActiveModule(null); }} />;
  }
  if (activeModule === 'pursuits') {
    return <PursuitsTraining language={language} onExit={() => { setActiveModule(null); }} />;
  }

  const modules: { key: TrainingModule; icon: string }[] = [
    { key: 'fixation', icon: '◎' },
    { key: 'saccades', icon: '⇆' },
    { key: 'pursuits', icon: '◠' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className={`${TYPOGRAPHY.navItem} ${COLORS.gray900} mb-4`}>
          {t.title}
        </h1>
        <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600}`}>
          {t.subtitle}
        </p>
      </div>

      {/* Module Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {modules.map(({ key, icon }) => {
          if (!key) return null;
          const moduleContent = t[key];
          const isSelected = selectedModule === key;

          return (
            <button
              key={key}
              onClick={() => { setSelectedModule(key); }}
              className={`
                p-6 rounded-lg border-2 transition-all duration-300 text-left
                ${isSelected
                  ? 'border-coral bg-coral/5 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className={`text-4xl mb-4 ${isSelected ? 'text-coral' : COLORS.gray400}`}>
                {icon}
              </div>
              <h3 className={`${TYPOGRAPHY.cardTitle} ${COLORS.gray900} mb-2`}>
                {moduleContent.name}
              </h3>
              <p className={`text-sm ${COLORS.gray600} leading-relaxed`}>
                {moduleContent.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Start Button */}
      <div className="text-center">
        {selectedModule ? (
          <button
            onClick={() => { setActiveModule(selectedModule); }}
            className={`
              px-8 py-4 rounded-full bg-coral text-white font-medium
              text-lg transition-all duration-300
              hover:bg-coral/90 hover:shadow-lg
              active:scale-95
            `}
          >
            {t.startTraining}
          </button>
        ) : (
          <p className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray500}`}>
            {t.selectModule}
          </p>
        )}
      </div>
    </div>
  );
};

export default EyeCare;
