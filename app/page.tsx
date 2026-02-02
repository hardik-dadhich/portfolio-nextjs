import Image from 'next/image';
import { loadAbout } from '@/lib/data';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import SkillsSection from '@/components/SkillsSection';
import WorkExperience from '@/components/WorkExperience';
import TypewriterText from '@/components/TypewriterText';
import ProjectsSection from '@/components/ProjectsSection';

export default function Home() {
  const aboutData = loadAbout();

  // Map icon names to components
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    email: Mail,
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
          {/* Profile Photo */}
          <div className="flex justify-center md:justify-end order-1 md:order-2">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-2xl ring-4 ring-gray-200 dark:ring-gray-700 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {aboutData.photo ? (
                <Image
                  src={aboutData.photo}
                  alt={`${aboutData.name} profile photo`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="text-8xl text-white">👤</span>
              )}
            </div>
          </div>

          {/* Name and Tagline */}
          <div className="text-center md:text-left order-2 md:order-1">
            {/* Typewriter Greeting */}
            <div className="mb-3 h-10 sm:h-12">
              <TypewriterText
                phrases={[
                  "Hey! Hardik here 👋",
                  "नमस्ते! हार्दिक यहाँ 👋",
                  "Hola! Hardik aquí 👋",
                  "Bonjour! Hardik ici 👋",
                  "こんにちは！ハーディックです 👋",
                  "Ciao! Hardik qui 👋",
                ]}
                typingSpeed={80}
                deletingSpeed={40}
                pauseDuration={2500}
                className="text-2xl sm:text-3xl font-semibold text-blue-600 dark:text-blue-400"
              />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {aboutData.name}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-6">
              {aboutData.tagline}
            </p>

            {/* Social Links */}
            <div className="flex gap-4 justify-center md:justify-start">
              {aboutData.socialLinks.map((link) => {
                const IconComponent = iconMap[link.icon.toLowerCase()] || Mail;
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                    aria-label={link.platform}
                  >
                    <IconComponent className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <section id="about" className="mb-12 scroll-mt-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">About Me</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {aboutData.bio}
          </p>
        </section>

        {/* Work Experience Section */}
        {aboutData.workExperience && aboutData.workExperience.length > 0 && (
          <WorkExperience experiences={aboutData.workExperience} />
        )}

        {/* Skills Section */}
        {aboutData.skills && aboutData.skills.length > 0 && (
          <SkillsSection skills={aboutData.skills} />
        )}

        {/* Projects Section */}
        {aboutData.projects && aboutData.projects.length > 0 && (
          <ProjectsSection projects={aboutData.projects} />
        )}

        {/* Interests */}
        {aboutData.interests.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Interests</h2>
            <div className="flex flex-wrap gap-3">
              {aboutData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Hire Me Section */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 p-8 md:p-12 shadow-2xl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTMwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHpNNiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">💼</span>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Hire Me
              </h2>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium">
                Ready to bring innovation to your team?
              </p>

              {/* CTA Button */}
              <a
                href="https://drive.google.com/file/d/11JqS_kYNFaVEFu3IWs37WDfWID9Wtw_7/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <svg
                  className="w-6 h-6 group-hover:animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Download My Resume</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>

              {/* Additional Info */}
              <p className="mt-6 text-white/80 text-sm">
                Let&apos;s build something amazing together! 🚀
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </section>
      </div>
    </main>
  );
}
