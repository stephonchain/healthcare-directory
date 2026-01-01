import { hipaaComplianceRules } from './hipaa-compliance';
import { fhirApiRules } from './fhir-api';
import { hl7IntegrationRules } from './hl7-integration';
import { telemedicineRules } from './telemedicine';
import { medicalImagingRules } from './medical-imaging';

export interface Author {
  name: string;
  url: string;
  avatar: string;
}

export interface Rule {
  tags: string[];
  title: string;
  libs: string[];
  slug: string;
  content: string;
  author: Author;
}

export interface Section {
  tag: string;
  slug: string;
  rules: Rule[];
}

// Combine all rules
export const rules: Rule[] = [
  ...hipaaComplianceRules,
  ...fhirApiRules,
  ...hl7IntegrationRules,
  ...telemedicineRules,
  ...medicalImagingRules
].map(rule => ({
  ...rule,
  libs: rule.libs || []
}));

// Utility function to create URL-friendly slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Get all unique sections based on tags
export function getSections(): Section[] {
  const tagMap = new Map<string, Rule[]>();

  // Group rules by tags
  rules.forEach(rule => {
    rule.tags.forEach(tag => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, []);
      }
      tagMap.get(tag)!.push(rule);
    });
  });

  // Convert to sections array
  const sections: Section[] = Array.from(tagMap.entries()).map(([tag, rules]) => ({
    tag,
    slug: slugify(tag),
    rules
  }));

  // Sort by number of rules (descending)
  sections.sort((a, b) => b.rules.length - a.rules.length);

  return sections;
}

// Get a specific section by slug
export function getSectionBySlug(slug: string): Section | undefined {
  const sections = getSections();
  return sections.find(section => section.slug === slug);
}

// Get a specific rule by slug
export function getRuleBySlug(slug: string): Rule | undefined {
  return rules.find(rule => rule.slug === slug || rule.slug === \`official/\${slug}\`);
}

// Get all tags
export function getAllTags(): string[] {
  const tags = new Set<string>();
  rules.forEach(rule => {
    rule.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// Search rules by keyword
export function searchRules(query: string): Rule[] {
  const lowerQuery = query.toLowerCase();
  return rules.filter(rule =>
    rule.title.toLowerCase().includes(lowerQuery) ||
    rule.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    rule.content.toLowerCase().includes(lowerQuery)
  );
}

// Export everything
export {
  hipaaComplianceRules,
  fhirApiRules,
  hl7IntegrationRules,
  telemedicineRules,
  medicalImagingRules
};
