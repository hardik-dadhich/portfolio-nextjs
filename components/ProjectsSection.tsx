'use client';

import { Project } from '@/lib/types';
import { Github, ExternalLink, Calendar, Folder } from 'lucide-react';
import { useState } from 'react';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Color schemes for different categories
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'AI/ML': 'bg-gradient-to-br from-purple-500 to-pink-500',
      'Backend': 'bg-gradient-to-br from-blue-500 to-cyan-500',
      'Frontend': 'bg-gradient-to-br from-green-500 to-teal-500',
      'Full Stack': 'bg-gradient-to-br from-orange-500 to-red-500',
    };
    return colorMap[category] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'AI/ML': '🤖',
      'Backend': '⚙️',
      'Frontend': '🎨',
      'Full Stack': '🚀',
    };
    return iconMap[category] || '📁';
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Academic Projects
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Folder className="w-4 h-4" />
          <span>{projects.length} Projects</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Category Badge with Gradient */}
            <div className="absolute top-4 right-4 z-10">
              <div
                className={`${getCategoryColor(project.category)} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1`}
              >
                <span>{getCategoryIcon(project.category)}</span>
                <span>{project.category}</span>
              </div>
            </div>

            {/* Animated Background Gradient */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${getCategoryColor(project.category)}`}
            />

            <div className="relative p-6">
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{project.date}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* GitHub Link */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/link"
                >
                  <Github className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                  <span className="text-sm font-medium">View on GitHub</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              </div>

              {/* Hover Effect Line */}
              <div
                className={`absolute bottom-0 left-0 h-1 ${getCategoryColor(project.category)} transition-all duration-300 ${
                  hoveredIndex === index ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
              🤖
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {projects.filter(p => p.category === 'AI/ML').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI/ML Projects</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
              ⚙️
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {projects.filter(p => p.category === 'Backend').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Backend Projects</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
              💻
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {projects.reduce((acc, p) => acc + p.technologies.length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Technologies Used</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
