import React from 'react';
import { IEEE_TEST_CASES } from '../../engine/testSuites/testCases';
import type { TestCase } from '../../types';
import { Layers } from 'lucide-react';

interface TestCaseSelectorProps {
  onSelectTestCase: (tc: TestCase) => void;
  selectedId: string;
  theme: 'light' | 'dark';
}

export const TestCaseSelector: React.FC<TestCaseSelectorProps> = ({
  onSelectTestCase,
  selectedId,
  theme
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`px-4 py-2 flex items-center justify-between text-xs select-none border-b transition-colors ${
        isLight
          ? 'bg-blue-50/50 border-blue-100 text-slate-800'
          : 'bg-slate-900 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex items-center space-x-2">
        <Layers className="w-4 h-4 text-blue-600" />
        <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
          IEEE Research Test Suite Presets:
        </span>
      </div>

      <select
        value={selectedId}
        onChange={(e) => {
          const found = IEEE_TEST_CASES.find((tc: TestCase) => tc.id === e.target.value);
          if (found) onSelectTestCase(found);
        }}
        className={`rounded-lg px-3 py-1 text-xs font-medium focus:outline-none cursor-pointer border ${
          isLight
            ? 'bg-white text-slate-800 border-slate-200 focus:border-blue-500 shadow-sm'
            : 'bg-slate-950 text-slate-200 border-slate-800 focus:border-indigo-500'
        }`}
      >
        {IEEE_TEST_CASES.map((tc: TestCase) => (
          <option key={tc.id} value={tc.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
            {tc.name} [{tc.category}]
          </option>
        ))}
      </select>
    </div>
  );
};
