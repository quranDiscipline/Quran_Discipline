import { XCircle, CheckCircle } from 'lucide-react';
import type { ProblemSolutionContent } from '../../types/landing.types';

const DEFAULT_CONTENT: ProblemSolutionContent = {
  problemHeadline: 'The Struggle Is Real',
  problemSubheadline: 'Sound Familiar?',
  problems: [
    'Started but lost motivation after weeks',
    'Nobody corrects your Tajweed mistakes',
    'Guilty you have not made progress in years',
    'Apps and videos do not stick',
    'Do not know your level or where to start',
  ],
  solutionHeadline: 'Discipline That Works',
  solutionSubheadline: 'The Difference',
  solutions: [
    'Personal teacher — accountability every session',
    'Live Zoom with real-time Tajweed correction',
    'Systematic curriculum — always know your next step',
    'Session recordings to review anytime',
    'Free assessment to find your exact level',
  ],
};

interface ProblemSolutionProps {
  content?: ProblemSolutionContent;
}

export function ProblemSolution({ content }: ProblemSolutionProps) {
  // Use CMS content if available, otherwise use defaults
  const problemHeadline = content?.problemHeadline || DEFAULT_CONTENT.problemHeadline;
  const problemSubheadline = content?.problemSubheadline || DEFAULT_CONTENT.problemSubheadline;
  const problems = content?.problems?.length ? content.problems : DEFAULT_CONTENT.problems;
  const solutionHeadline = content?.solutionHeadline || DEFAULT_CONTENT.solutionHeadline;
  const solutionSubheadline = content?.solutionSubheadline || DEFAULT_CONTENT.solutionSubheadline;
  const solutions = content?.solutions?.length ? content.solutions : DEFAULT_CONTENT.solutions;

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Problem */}
          <div>
            <p className="text-red-500 font-semibold mb-2">{problemSubheadline}</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{problemHeadline}</h2>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div>
            <p className="text-primary font-semibold mb-2">{solutionSubheadline}</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{solutionHeadline}</h2>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
