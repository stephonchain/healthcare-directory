# Healthcare Directory

A community directory for healthcare AI tools, development rules, and resources. This project helps developers build HIPAA-compliant healthcare applications with best practices for FHIR, HL7, telemedicine, medical imaging, and more.

## Overview

Healthcare Directory is inspired by the [Cursor Directory](https://github.com/pontusab/directories) project and adapted specifically for healthcare software development. It provides curated AI prompts, development rules, and best practices for building healthcare applications.

## Features

- **HIPAA Compliance**: Guidelines for building secure, HIPAA-compliant applications
- **FHIR API Development**: Best practices for Fast Healthcare Interoperability Resources (FHIR) APIs
- **HL7 Integration**: Working with HL7 v2.x messaging standards
- **Telemedicine**: Building secure video consultation platforms with WebRTC
- **Medical Imaging**: DICOM file processing and medical image handling
- **Healthcare Data Standards**: Implementing industry-standard healthcare data formats

## Project Structure

This is a monorepo containing:

```
healthcare-directory/
├── packages/
│   └── data/              # Healthcare rules and data
│       └── src/
│           ├── rules/     # Development rules by category
│           └── mcp/       # Model Context Protocols
├── apps/
│   └── web/              # Web application (coming soon)
└── package.json          # Workspace configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/stephonchain/healthcare-directory.git
cd healthcare-directory

# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format
```

## Available Rules

### HIPAA Compliance
Guidelines for building HIPAA-compliant healthcare applications including:
- Data encryption (at rest and in transit)
- Access controls and authentication
- Audit logging
- API security
- Database security

### FHIR API Development
Best practices for building FHIR (Fast Healthcare Interoperability Resources) APIs:
- RESTful API patterns
- FHIR resource handling (Patient, Observation, Condition, etc.)
- Search parameters and validation
- SMART on FHIR authorization

### HL7 Integration
Working with HL7 v2.x messaging:
- Message parsing and generation
- Common message types (ADT, ORM, ORU, SIU)
- MLLP (Minimal Lower Layer Protocol)
- ACK message handling

### Telemedicine Platforms
Building secure video consultation systems:
- WebRTC implementation
- HIPAA-compliant video conferencing
- Screen sharing and chat
- Session recording and audit logging

### Medical Imaging (DICOM)
Working with medical imaging data:
- DICOM file parsing
- Image display and manipulation
- DICOMweb API integration
- Image anonymization

## Contributing

We welcome contributions from the healthcare development community!

### Adding a New Rule

1. Fork the repository
2. Create a new file in `packages/data/src/rules/your-rule-name.ts`
3. Follow the rule structure:

```typescript
export const yourRules = [
  {
    tags: ["Category", "Technology"],
    title: "Your Rule Title",
    libs: ["required-library"],
    slug: "your-rule-slug",
    content: `Your rule content in markdown...`,
    author: {
      name: "Your Name",
      url: "https://github.com/yourusername",
      avatar: ""
    }
  }
];
```

4. Add your rule to `packages/data/src/rules/index.ts`
5. Create a pull request

### Guidelines for Rules

- **Be specific**: Focus on healthcare-specific scenarios
- **Be practical**: Include code examples and real-world use cases
- **Be compliant**: Emphasize HIPAA and healthcare regulations
- **Be tested**: Ensure your examples work and follow best practices
- **Be clear**: Write for developers of all experience levels

## Tech Stack

- **Language**: TypeScript
- **Package Manager**: npm/bun
- **Code Quality**: Biome (linting and formatting)
- **Standards**: FHIR R4, HL7 v2.x, DICOM

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Cursor Directory](https://github.com/pontusab/directories)
- Built for the healthcare development community
- Special thanks to all contributors

## Resources

- [FHIR Documentation](https://www.hl7.org/fhir/)
- [HL7 v2.x Standards](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)
- [DICOM Standard](https://www.dicomstandard.org/)

## Support

If you have questions or need help:
- Open an issue on GitHub
- Check existing rules and examples
- Review the contributing guidelines

---

**Note**: This project provides educational resources and best practices. Always consult with healthcare compliance experts and legal counsel when building production healthcare applications.
