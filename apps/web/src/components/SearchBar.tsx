'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { searchRules } from '@healthcare-directory/data';
import Link from 'next/link';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (value.length >= 2) {
      const searchResults = searchRules(value);
      setResults(searchResults);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search healthcare development rules..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((rule) => (
            <Link
              key={rule.slug}
              href={`/rule/${rule.slug}`}
              className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <h4 className="font-semibold text-gray-900 mb-1">{rule.title}</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {rule.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {rule.content.substring(0, 120)}...
              </p>
            </Link>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
