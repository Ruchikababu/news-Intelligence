import React from 'react';
import type { Translations } from '../types';

interface AboutPageProps {
  t: Translations;
}

export const AboutPage: React.FC<AboutPageProps> = ({ t }) => {
  return (
    <main className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-secondary p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-highlight mb-4">{t.aboutTitle}</h2>
        <p className="text-text-secondary leading-relaxed">
          {t.aboutText}
        </p>
      </div>
    </main>
  );
};
