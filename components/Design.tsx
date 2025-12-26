import React from 'react';
import { Palette } from 'lucide-react';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';

interface DesignProps {
  language: Language;
}

const Design: React.FC<DesignProps> = ({ language }) => {
	const content = {
		en: {
			intro: 'Visual systems, branding explorations, and interface design experiments.',
			branding: 'Branding',
			brandingDesc: 'Logo systems, color palettes, and visual identity work.',
			interface: 'Interface Design',
			interfaceDesc: 'UI patterns, prototypes, and interaction studies.'
		},
		zh: {
			intro: '视觉系统、品牌探索和界面设计实验。',
			branding: '品牌设计',
			brandingDesc: 'Logo系统、调色板和视觉识别工作。',
			interface: '界面设计',
			interfaceDesc: 'UI模式、原型和交互研究。'
		}
	};

	const t = content[language];

	return (
		<div id="design-root" className="w-full">
			<div id="design-header" className="mb-12 text-center">
				<p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
					{t.intro}
				</p>
			</div>

			<div id="design-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className={`border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center ${COLORS.gray400} hover:border-coral hover:text-coral transition-colors cursor-pointer group`}>
					<Palette size={48} className="mb-4 opacity-50 group-hover:scale-110 transition-transform" />
					<h3 className={TYPOGRAPHY.h3 + " mb-2"}>{t.branding}</h3>
					<p className="text-sm opacity-70">{t.brandingDesc}</p>
				</div>

				<div className={`border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center ${COLORS.gray400} hover:border-coral hover:text-coral transition-colors cursor-pointer group`}>
					<Palette size={48} className="mb-4 opacity-50 group-hover:scale-110 transition-transform" />
					<h3 className={TYPOGRAPHY.h3 + " mb-2"}>{t.interface}</h3>
					<p className="text-sm opacity-70">{t.interfaceDesc}</p>
				</div>
			</div>
		</div>
	);
};

export default Design;
