import { SkillCategory } from '@/lib/types';

interface SkillsSectionProps {
  skills: SkillCategory[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  // Color schemes for different categories
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Languages': 'bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100 border-blue-200 dark:border-blue-800',
      'Databases': 'bg-green-100 dark:bg-green-900/30 text-gray-900 dark:text-gray-100 border-green-200 dark:border-green-800',
      'Technologies': 'bg-purple-100 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 border-purple-200 dark:border-purple-800',
      'Version Control': 'bg-orange-100 dark:bg-orange-900/30 text-gray-900 dark:text-gray-100 border-orange-200 dark:border-orange-800',
      'Monitoring': 'bg-yellow-100 dark:bg-yellow-900/30 text-gray-900 dark:text-gray-100 border-yellow-200 dark:border-yellow-800',
      'DevOps': 'bg-red-100 dark:bg-red-900/30 text-gray-900 dark:text-gray-100 border-red-200 dark:border-red-800',
      'Quantum Computing': 'bg-indigo-100 dark:bg-indigo-900/30 text-gray-900 dark:text-gray-100 border-indigo-200 dark:border-indigo-800',
      'Backend': 'bg-teal-100 dark:bg-teal-900/30 text-gray-900 dark:text-gray-100 border-teal-200 dark:border-teal-800',
    };
    return colorMap[category] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800';
  };

  const getItemColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Languages': 'bg-blue-200 dark:bg-blue-950/50 text-blue-900 dark:text-blue-400 hover:bg-blue-300 dark:hover:bg-blue-900/50 border border-blue-300 dark:border-blue-800',
      'Databases': 'bg-green-200 dark:bg-green-950/50 text-green-900 dark:text-green-400 hover:bg-green-300 dark:hover:bg-green-900/50 border border-green-300 dark:border-green-800',
      'Technologies': 'bg-purple-200 dark:bg-purple-950/50 text-purple-900 dark:text-purple-400 hover:bg-purple-300 dark:hover:bg-purple-900/50 border border-purple-300 dark:border-purple-800',
      'Version Control': 'bg-orange-200 dark:bg-orange-950/50 text-orange-900 dark:text-orange-400 hover:bg-orange-300 dark:hover:bg-orange-900/50 border border-orange-300 dark:border-orange-800',
      'Monitoring': 'bg-yellow-200 dark:bg-yellow-950/50 text-yellow-900 dark:text-yellow-400 hover:bg-yellow-300 dark:hover:bg-yellow-900/50 border border-yellow-400 dark:border-yellow-800',
      'DevOps': 'bg-red-200 dark:bg-red-950/50 text-red-900 dark:text-red-400 hover:bg-red-300 dark:hover:bg-red-900/50 border border-red-300 dark:border-red-800',
      'Quantum Computing': 'bg-indigo-200 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-400 hover:bg-indigo-300 dark:hover:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-800',
      'Backend': 'bg-teal-200 dark:bg-teal-950/50 text-teal-900 dark:text-teal-400 hover:bg-teal-300 dark:hover:bg-teal-900/50 border border-teal-300 dark:border-teal-800',
    };
    return colorMap[category] || 'bg-gray-200 dark:bg-gray-950/50 text-gray-900 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-900/50 border border-gray-300 dark:border-gray-800';
  };

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Skills & Expertise</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skillCategory, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${getCategoryColor(skillCategory.category)}`}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
              <span className="mr-2">
                {getCategoryIcon(skillCategory.category)}
              </span>
              {skillCategory.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillCategory.items.map((skill, skillIndex) => (
                <span
                  key={skillIndex}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${getItemColor(skillCategory.category)}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Helper function to get category icons
function getCategoryIcon(category: string): string {
  const iconMap: { [key: string]: string } = {
    'Languages': '💻',
    'Databases': '🗄️',
    'Technologies': '⚙️',
    'Version Control': '🔀',
    'Monitoring': '📊',
    'DevOps': '🚀',
    'Quantum Computing': '⚛️',
    'Backend': '🔧',
  };
  return iconMap[category] || '📌';
}
