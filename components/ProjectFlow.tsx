
import React from 'react';
import { FolderOpen } from 'lucide-react';
import { TYPOGRAPHY, COLORS } from '../styles';

const ProjectFlow: React.FC = () => {
  return (
    <div id="projectflow-root" data-debug="projectflow-root" className="w-full">
      <div id="projectflow-header" data-debug="projectflow-header" className="mb-12 border-b border-gray-100 pb-8">
        <h2 className={TYPOGRAPHY.h2}>Project Flow</h2>
        <p data-debug="projectflow-intro" className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
          A collection of case studies, design processes, and architectural workflows.
        </p>
      </div>

      <div id="projectflow-grid" data-debug="projectflow-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Placeholder for future content */}
        <div className={`border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center ${COLORS.gray400} hover:border-coral hover:text-coral transition-colors cursor-pointer group`}>
          <FolderOpen size={48} className="mb-4 opacity-50 group-hover:scale-110 transition-transform" />
          <h3 className={TYPOGRAPHY.h3 + " mb-2"}>Case Study 01</h3>
          <p className="text-sm opacity-70">Coming Soon</p>
        </div>

        <div className={`border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center ${COLORS.gray400} hover:border-coral hover:text-coral transition-colors cursor-pointer group`}>
          <FolderOpen size={48} className="mb-4 opacity-50 group-hover:scale-110 transition-transform" />
          <h3 className={TYPOGRAPHY.h3 + " mb-2"}>Case Study 02</h3>
          <p className="text-sm opacity-70">Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectFlow;
