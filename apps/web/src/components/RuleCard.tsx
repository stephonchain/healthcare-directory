import Link from 'next/link';
import type { Rule } from '@healthcare-directory/data';
import { ArrowRight, Package } from 'lucide-react';

interface RuleCardProps {
  rule: Rule;
}

export function RuleCard({ rule }: RuleCardProps) {
  return (
    <Link
      href={`/rule/${rule.slug}`}
      className="block group"
    >
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-full hover:border-blue-500 hover:shadow-lg transition-all">
        <div className="flex flex-col h-full">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
            {rule.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {rule.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
            {rule.tags.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{rule.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Libraries */}
          {rule.libs && rule.libs.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <Package className="w-4 h-4" />
                <span className="font-medium">Libraries:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {rule.libs.slice(0, 4).map((lib) => (
                  <code
                    key={lib}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono"
                  >
                    {lib}
                  </code>
                ))}
                {rule.libs.length > 4 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{rule.libs.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
            {rule.content.split('\n\n')[0].substring(0, 150)}...
          </p>

          {/* Read more */}
          <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
            <span>Read more</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
