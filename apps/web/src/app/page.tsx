import { rules, getSections } from '@healthcare-directory/data';
import { RuleCard } from '@/components/RuleCard';
import { SearchBar } from '@/components/SearchBar';
import { TagFilter } from '@/components/TagFilter';
import { Stethoscope, Code, Shield, Brain } from 'lucide-react';

export default function Home() {
  const sections = getSections();
  const totalRules = rules.length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container-custom py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Healthcare Directory
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your comprehensive guide to building HIPAA-compliant healthcare applications
            </p>
            <p className="text-lg text-blue-200 mb-10">
              {totalRules} curated development rules for FHIR, HL7, telemedicine, AI, and more
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                <span>Production Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                <span>Healthcare Focused</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container-custom py-6">
          <SearchBar />
        </div>
      </section>

      {/* Rules Grid */}
      <section className="container-custom py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Development Rules</h2>
          <p className="text-gray-600">
            Explore comprehensive guides for healthcare software development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule) => (
            <RuleCard key={rule.slug} rule={rule} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white border-t">
        <div className="container-custom py-16">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <TagFilter sections={sections} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container-custom py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Healthcare Software?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start exploring our comprehensive development guides
          </p>
          <a
            href="#rules"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Explore Rules
          </a>
        </div>
      </section>
    </div>
  );
}
