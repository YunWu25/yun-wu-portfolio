import React from 'react';
import { Palette } from 'lucide-react';
import { TYPOGRAPHY, COLORS } from '../styles';

const Design: React.FC = () => {
	return (
		<div id="design-root" data-debug="design-root" className="w-full">
			<div id="design-header" data-debug="design-header" className="mb-12 border-b border-gray-100 pb-8">
				<p data-debug="design-intro" className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
					Visual systems, branding explorations, and interface design experiments.
				</p>
			</div>

			<div id="design-grid" data-debug="design-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className={`border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center ${COLORS.gray400} hover:border-coral hover:text-coral transition-colors cursor-pointer group`}>
					<Palette size={48} className="mb-4 opacity-50 group-hover:scale-110 transition-transform" />
					<h3 className={TYPOGRAPHY.h3 + " mb-2"}>Branding</h3>
					<p className="text-sm opacity-70">Logo systems, color palettes, and visual identity work.</p>
				</div>

				<div className={`border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center ${COLORS.gray400} hover:border-coral hover:text-coral transition-colors cursor-pointer group`}>
					<Palette size={48} className="mb-4 opacity-50 group-hover:scale-110 transition-transform" />
					<h3 className={TYPOGRAPHY.h3 + " mb-2"}>Interface Design</h3>
					<p className="text-sm opacity-70">UI patterns, prototypes, and interaction studies.</p>
				</div>
			</div>
		</div>
	);
};

export default Design;

