import { WorkExperience as WorkExperienceType } from '@/lib/types';

interface WorkExperienceProps {
  experiences: WorkExperienceType[];
}

export default function WorkExperience({ experiences }: WorkExperienceProps) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Work Experience</h2>
      <div className="space-y-8">
        {experiences.map((experience, index) => (
          <div
            key={index}
            className="relative pl-8 pb-8 border-l-2 border-blue-500 dark:border-blue-400 last:pb-0"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-white dark:ring-gray-900"></div>
            
            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {experience.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {experience.company}
                  </span>
                  <span className="text-gray-400 dark:text-gray-600">•</span>
                  <span>{experience.location}</span>
                  <span className="text-gray-400 dark:text-gray-600">•</span>
                  <span className="text-sm">{experience.period}</span>
                </div>
              </div>

              {/* Highlights */}
              <ul className="space-y-2">
                {experience.highlights.map((highlight, highlightIndex) => (
                  <li
                    key={highlightIndex}
                    className="flex items-start text-gray-700 dark:text-gray-300"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 mr-3 flex-shrink-0"></span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
