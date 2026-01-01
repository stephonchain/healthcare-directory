import type { Section } from '@healthcare-directory/data';
import { Tag } from 'lucide-react';

interface TagFilterProps {
  sections: Section[];
}

export function TagFilter({ sections }: TagFilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sections.map((section) => (
        <a
          key={section.slug}
          href={`#${section.slug}`}
          className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition group"
        >
          <Tag className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
              {section.tag}
            </h3>
            <p className="text-sm text-gray-500">
              {section.rules.length} {section.rules.length === 1 ? 'rule' : 'rules'}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
