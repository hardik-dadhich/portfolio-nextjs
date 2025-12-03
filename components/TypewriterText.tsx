'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export default function TypewriterText({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = '',
}: TypewriterTextProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;

    const currentPhrase = phrases[currentPhraseIndex];

    // Handle pause after completing a phrase
    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }

    // Handle typing
    if (!isDeleting && currentText !== currentPhrase) {
      const typingTimeout = setTimeout(() => {
        setCurrentText(currentPhrase.slice(0, currentText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(typingTimeout);
    }

    // Pause after completing typing
    if (!isDeleting && currentText === currentPhrase) {
      setIsPaused(true);
      return;
    }

    // Handle deleting
    if (isDeleting && currentText !== '') {
      const deletingTimeout = setTimeout(() => {
        setCurrentText(currentText.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(deletingTimeout);
    }

    // Move to next phrase after deleting
    if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }
  }, [
    currentText,
    currentPhraseIndex,
    isDeleting,
    isPaused,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse text-blue-600 dark:text-blue-400">|</span>
    </span>
  );
}
