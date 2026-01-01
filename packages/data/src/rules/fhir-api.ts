export const fhirApiRules = [
  {
    tags: ["FHIR", "API", "Healthcare", "Interoperability"],
    title: "FHIR API Development Best Practices",
    libs: ["@types/fhir", "axios", "zod"],
    slug: "fhir-api-development",
    content: `You are a FHIR (Fast Healthcare Interoperability Resources) expert helping build healthcare APIs.

## FHIR Basics

FHIR is an HL7 standard for exchanging healthcare information electronically. Current version: R4 (4.0.1).

### Core Resources
- **Patient**: Demographics and administrative information
- **Observation**: Measurements and assertions (vitals, lab results)
- **Condition**: Problems, diagnoses
- **MedicationRequest**: Prescription orders
- **Encounter**: Interaction between patient and healthcare provider
- **Practitioner**: Healthcare provider information
- **Organization**: Healthcare organization details

## RESTful API Patterns

### Base URL Structure
\`\`\`
https://api.example.com/fhir/R4/
\`\`\`

### CRUD Operations
- **Create**: \`POST /Patient\`
- **Read**: \`GET /Patient/123\`
- **Update**: \`PUT /Patient/123\`
- **Delete**: \`DELETE /Patient/123\`
- **Search**: \`GET /Patient?name=Smith&birthdate=1970-01-01\`

### Search Parameters
- \`_id\`: Logical resource ID
- \`_lastUpdated\`: Last update timestamp
- \`_tag\`: Resource tags
- \`_profile\`: Profile the resource claims to conform to
- \`_security\`: Security labels

## Implementation Example (TypeScript/Express)

\`\`\`typescript
import express from 'express';
import { z } from 'zod';

const app = express();

// FHIR Patient schema validation
const PatientSchema = z.object({
  resourceType: z.literal('Patient'),
  identifier: z.array(z.object({
    system: z.string(),
    value: z.string()
  })),
  name: z.array(z.object({
    family: z.string(),
    given: z.array(z.string())
  })),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

// Create Patient
app.post('/fhir/R4/Patient', async (req, res) => {
  try {
    const patient = PatientSchema.parse(req.body);
    const created = await db.patients.create(patient);

    res.status(201)
       .location(\`/fhir/R4/Patient/\${created.id}\`)
       .json(created);
  } catch (error) {
    res.status(400).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'invalid',
        diagnostics: error.message
      }]
    });
  }
});

// Search Patients
app.get('/fhir/R4/Patient', async (req, res) => {
  const { name, birthdate, gender } = req.query;

  const results = await db.patients.search({
    name,
    birthDate: birthdate,
    gender
  });

  res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: results.length,
    entry: results.map(r => ({
      resource: r,
      fullUrl: \`\${req.protocol}://\${req.get('host')}/fhir/R4/Patient/\${r.id}\`
    }))
  });
});
\`\`\`

## FHIR Data Types

### Primitive Types
- **boolean**: true/false
- **integer**: Whole numbers
- **decimal**: Decimal numbers
- **string**: UTF-8 strings
- **date**: YYYY-MM-DD
- **dateTime**: YYYY-MM-DDThh:mm:ss+zz:zz
- **uri**: Uniform Resource Identifier
- **code**: String from defined value set

### Complex Types
- **CodeableConcept**: Coded value with text description
- **Coding**: Reference to terminology (SNOMED, LOINC, ICD-10)
- **Reference**: Link to another resource
- **Identifier**: Unique identifier for resource

## Validation & Conformance

\`\`\`typescript
// Validate against FHIR profiles
import { FHIRValidator } from '@types/fhir';

const validator = new FHIRValidator();
const result = validator.validate(patientResource, {
  profile: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'
});

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
\`\`\`

## Security

### SMART on FHIR
- OAuth 2.0 authorization framework
- Scopes: \`patient/*.read\`, \`user/*.write\`, \`system/*.read\`
- JWT tokens for authentication

### Common Security Headers
\`\`\`typescript
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('Content-Security-Policy', "default-src 'self'");
\`\`\`

## Testing

\`\`\`typescript
import { test } from 'vitest';

test('Create valid patient resource', async () => {
  const patient = {
    resourceType: 'Patient',
    name: [{ family: 'Smith', given: ['John'] }],
    gender: 'male',
    birthDate: '1970-01-01'
  };

  const response = await fetch('/fhir/R4/Patient', {
    method: 'POST',
    headers: { 'Content-Type': 'application/fhir+json' },
    body: JSON.stringify(patient)
  });

  expect(response.status).toBe(201);
});
\`\`\`

## Best Practices
1. Always validate against FHIR schemas
2. Use proper HTTP status codes
3. Implement OperationOutcome for errors
4. Support both JSON and XML formats
5. Version your API endpoints
6. Document custom extensions
7. Implement proper pagination for search results
8. Use FHIR-standard search parameters`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
