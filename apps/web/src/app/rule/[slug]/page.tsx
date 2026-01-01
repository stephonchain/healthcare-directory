import { notFound } from 'next/navigation';
import { getRuleBySlug, rules } from '@healthcare-directory/data';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ArrowLeft, Package, Tag, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface RulePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return rules.map((rule) => ({
    slug: rule.slug,
  }));
}

export async function generateMetadata({ params }: RulePageProps): Promise<Metadata> {
  const rule = getRuleBySlug(params.slug);

  if (!rule) {
    return {
      title: 'Rule Not Found',
    };
  }

  return {
    title: `${rule.title} | Healthcare Directory`,
    description: rule.content.substring(0, 160),
    keywords: rule.tags.join(', '),
  };
}

export default function RulePage({ params }: RulePageProps) {
  const rule = getRuleBySlug(params.slug);

  if (!rule) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all rules
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {rule.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {rule.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Libraries */}
          {rule.libs && rule.libs.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <Package className="w-5 h-5" />
                <h3 className="font-semibold">Required Libraries:</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {rule.libs.map((lib) => (
                  <code
                    key={lib}
                    className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded font-mono text-sm"
                  >
                    {lib}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Author */}
          {rule.author && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>By</span>
              <a
                href={rule.author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                {rule.author.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
            <MarkdownRenderer content={rule.content} />
          </article>

          {/* Footer CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Found this guide helpful?
            </h2>
            <p className="text-blue-100 mb-6">
              Explore more healthcare development rules and best practices
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              View All Rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
