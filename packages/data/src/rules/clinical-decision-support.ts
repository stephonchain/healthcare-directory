export const clinicalDecisionSupportRules = [
  {
    tags: ["CDS", "Clinical Decision Support", "AI", "Healthcare", "Alerts"],
    title: "Clinical Decision Support Systems Development",
    libs: ["openai", "langchain", "zod"],
    slug: "clinical-decision-support",
    content: `You are a Clinical Decision Support (CDS) expert helping build intelligent healthcare decision-making systems.

## What is Clinical Decision Support?

CDS provides healthcare professionals with knowledge and patient-specific information to enhance health and healthcare decisions.

### Types of CDS

1. **Drug-Drug Interaction Alerts**
2. **Dosing Guidance**
3. **Diagnostic Support**
4. **Preventive Care Reminders**
5. **Clinical Pathways**
6. **Order Sets**
7. **Documentation Templates**

## CDS Architecture

\`\`\`typescript
interface ClinicalAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'drug-interaction' | 'allergy' | 'dosing' | 'lab-abnormal' | 'guideline';
  title: string;
  description: string;
  recommendation: string;
  evidence: string[];
  dismissible: boolean;
  requiresAcknowledgment: boolean;
}

interface PatientContext {
  patientId: string;
  age: number;
  weight?: number;
  height?: number;
  allergies: string[];
  conditions: string[];
  medications: Medication[];
  labs: LabResult[];
  vitals: VitalSigns;
}

interface Medication {
  name: string;
  rxnormCode: string;
  dose: string;
  frequency: string;
  route: string;
  startDate: Date;
}

interface LabResult {
  loincCode: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: { low: number; high: number };
  timestamp: Date;
}
\`\`\`

## Drug-Drug Interaction Checking

\`\`\`typescript
import axios from 'axios';

class DrugInteractionChecker {
  private rxnormApiBase = 'https://rxnav.nlm.nih.gov/REST';

  async checkInteractions(medications: Medication[]): Promise<ClinicalAlert[]> {
    const alerts: ClinicalAlert[] = [];

    // Get RxNorm codes
    const rxnormCodes = medications.map(med => med.rxnormCode);

    // Check interactions using RxNorm API
    const interactions = await this.getRxNormInteractions(rxnormCodes);

    for (const interaction of interactions) {
      alerts.push({
        id: \`interaction-\${Date.now()}\`,
        severity: this.mapSeverity(interaction.severity),
        type: 'drug-interaction',
        title: \`Interaction: \${interaction.drug1} + \${interaction.drug2}\`,
        description: interaction.description,
        recommendation: this.getInteractionRecommendation(interaction),
        evidence: [interaction.source],
        dismissible: interaction.severity !== 'high',
        requiresAcknowledgment: interaction.severity === 'high'
      });
    }

    return alerts;
  }

  private async getRxNormInteractions(rxnormCodes: string[]) {
    const url = \`\${this.rxnormApiBase}/interaction/list.json\`;

    const response = await axios.get(url, {
      params: {
        rxcuis: rxnormCodes.join('+')
      }
    });

    return response.data.fullInteractionTypeGroup || [];
  }

  private mapSeverity(severity: string): 'critical' | 'warning' | 'info' {
    if (severity === 'high' || severity === 'N/A-High') return 'critical';
    if (severity === 'moderate') return 'warning';
    return 'info';
  }

  private getInteractionRecommendation(interaction: any): string {
    switch (interaction.severity) {
      case 'high':
        return 'Consider alternative medication or consult pharmacist';
      case 'moderate':
        return 'Monitor patient closely for adverse effects';
      default:
        return 'Be aware of potential interaction';
    }
  }
}
\`\`\`

## Allergy Checking

\`\`\`typescript
class AllergyChecker {
  private allergyDatabase: Map<string, string[]>;

  constructor() {
    // In production, load from database
    this.allergyDatabase = new Map([
      ['penicillin', ['amoxicillin', 'ampicillin', 'penicillin']],
      ['sulfa', ['sulfamethoxazole', 'sulfasalazine']],
      // ... more allergen groups
    ]);
  }

  checkAllergies(
    medications: Medication[],
    patientAllergies: string[]
  ): ClinicalAlert[] {
    const alerts: ClinicalAlert[] = [];

    for (const med of medications) {
      for (const allergy of patientAllergies) {
        const allergenGroup = this.allergyDatabase.get(allergy.toLowerCase());

        if (allergenGroup?.some(drug =>
          med.name.toLowerCase().includes(drug.toLowerCase())
        )) {
          alerts.push({
            id: \`allergy-\${Date.now()}\`,
            severity: 'critical',
            type: 'allergy',
            title: \`Allergy Alert: \${med.name}\`,
            description: \`Patient has documented allergy to \${allergy}\`,
            recommendation: 'DO NOT ADMINISTER. Select alternative medication.',
            evidence: ['Patient allergy list'],
            dismissible: false,
            requiresAcknowledgment: true
          });
        }
      }
    }

    return alerts;
  }
}
\`\`\`

## Dosing Guidance

\`\`\`typescript
class DosingCalculator {
  // Pediatric dosing by weight
  calculatePediatricDose(
    medication: string,
    weightKg: number,
    ageYears: number
  ): { dose: number; unit: string; frequency: string; warnings: string[] } {
    const warnings: string[] = [];

    // Example: Acetaminophen dosing
    if (medication.toLowerCase().includes('acetaminophen')) {
      const dosePerKg = 10; // 10-15 mg/kg/dose
      const maxSingleDose = 750; // mg
      const maxDailyDose = 75 * weightKg; // 75 mg/kg/day max

      let dose = dosePerKg * weightKg;

      if (dose > maxSingleDose) {
        dose = maxSingleDose;
        warnings.push(\`Dose capped at \${maxSingleDose}mg (maximum single dose)\`);
      }

      if (dose * 4 > maxDailyDose) {
        warnings.push(\`Do not exceed \${maxDailyDose}mg in 24 hours\`);
      }

      return {
        dose: Math.round(dose),
        unit: 'mg',
        frequency: 'every 4-6 hours as needed',
        warnings
      };
    }

    throw new Error(\`Dosing not configured for \${medication}\`);
  }

  // Renal dosing adjustments
  adjustForRenalFunction(
    medication: string,
    standardDose: number,
    creatinineClearance: number
  ): { adjustedDose: number; recommendation: string } {
    // Example: Adjust based on CrCl
    if (creatinineClearance < 30) {
      return {
        adjustedDose: standardDose * 0.5,
        recommendation: 'Reduce dose by 50% due to renal impairment (CrCl < 30)'
      };
    } else if (creatinineClearance < 60) {
      return {
        adjustedDose: standardDose * 0.75,
        recommendation: 'Reduce dose by 25% due to moderate renal impairment'
      };
    }

    return {
      adjustedDose: standardDose,
      recommendation: 'No renal adjustment needed'
    };
  }
}
\`\`\`

## Lab Value Monitoring

\`\`\`typescript
class LabMonitor {
  checkAbnormalLabs(labs: LabResult[]): ClinicalAlert[] {
    const alerts: ClinicalAlert[] = [];

    for (const lab of labs) {
      if (this.isCritical(lab)) {
        alerts.push({
          id: \`lab-\${lab.loincCode}-\${Date.now()}\`,
          severity: 'critical',
          type: 'lab-abnormal',
          title: \`Critical Lab: \${lab.name}\`,
          description: \`\${lab.name} is \${lab.value} \${lab.unit} (normal: \${lab.referenceRange.low}-\${lab.referenceRange.high})\`,
          recommendation: this.getLabRecommendation(lab),
          evidence: [\`Lab result from \${lab.timestamp.toISOString()}\`],
          dismissible: false,
          requiresAcknowledgment: true
        });
      }
    }

    return alerts;
  }

  private isCritical(lab: LabResult): boolean {
    const criticalLow = lab.value < lab.referenceRange.low * 0.7;
    const criticalHigh = lab.value > lab.referenceRange.high * 1.3;

    return criticalLow || criticalHigh;
  }

  private getLabRecommendation(lab: LabResult): string {
    // Example recommendations based on LOINC codes
    const recommendations: Record<string, string> = {
      '2160-0': 'Severe hypokalemia - Consider immediate potassium replacement',
      '2345-7': 'Severe hyperglycemia - Check for DKA, adjust insulin',
      '33914-3': 'Severe anemia - Consider transfusion, investigate cause',
      // ... more LOINC-specific recommendations
    };

    return recommendations[lab.loincCode] || 'Consult appropriate specialist for abnormal value';
  }
}
\`\`\`

## AI-Powered Diagnostic Support

\`\`\`typescript
import OpenAI from 'openai';

class DiagnosticSupport {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateDifferentialDiagnosis(
    symptoms: string[],
    patientContext: PatientContext
  ): Promise<{
    diagnoses: Array<{ condition: string; probability: string; reasoning: string }>;
    recommendedTests: string[];
  }> {
    const prompt = \`
Given the following patient information and symptoms, provide a differential diagnosis:

Patient Age: \${patientContext.age}
Allergies: \${patientContext.allergies.join(', ')}
Current Conditions: \${patientContext.conditions.join(', ')}
Current Medications: \${patientContext.medications.map(m => m.name).join(', ')}

Presenting Symptoms:
\${symptoms.map((s, i) => \`\${i + 1}. \${s}\`).join('\\n')}

Provide:
1. Top 5 differential diagnoses with probability (high/medium/low)
2. Reasoning for each diagnosis
3. Recommended diagnostic tests

Format as JSON.
\`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a medical diagnostic assistant. Provide evidence-based differential diagnoses. Always include a disclaimer that this is for educational purposes and should not replace clinical judgment.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      diagnoses: result.differentialDiagnoses || [],
      recommendedTests: result.recommendedTests || []
    };
  }
}
\`\`\`

## Clinical Pathway Engine

\`\`\`typescript
interface ClinicalPathway {
  condition: string;
  steps: PathwayStep[];
}

interface PathwayStep {
  order: number;
  action: string;
  type: 'assessment' | 'medication' | 'procedure' | 'lab' | 'imaging';
  required: boolean;
  timeframe?: string;
  criteria?: string;
}

class ClinicalPathwayEngine {
  private pathways: Map<string, ClinicalPathway>;

  constructor() {
    this.pathways = new Map();
    this.loadPathways();
  }

  private loadPathways(): void {
    // Example: Sepsis pathway
    this.pathways.set('sepsis', {
      condition: 'Sepsis',
      steps: [
        {
          order: 1,
          action: 'Obtain blood cultures before antibiotics',
          type: 'lab',
          required: true,
          timeframe: 'Within 1 hour'
        },
        {
          order: 2,
          action: 'Administer broad-spectrum antibiotics',
          type: 'medication',
          required: true,
          timeframe: 'Within 1 hour'
        },
        {
          order: 3,
          action: 'Begin fluid resuscitation 30mL/kg crystalloid',
          type: 'procedure',
          required: true,
          timeframe: 'Within 3 hours'
        },
        {
          order: 4,
          action: 'Measure lactate level',
          type: 'lab',
          required: true,
          timeframe: 'Initial and repeat if >2 mmol/L'
        },
        {
          order: 5,
          action: 'Monitor vital signs continuously',
          type: 'assessment',
          required: true,
          timeframe: 'Ongoing'
        }
      ]
    });
  }

  getPathway(condition: string): ClinicalPathway | undefined {
    return this.pathways.get(condition.toLowerCase());
  }

  checkPathwayCompliance(
    condition: string,
    completedSteps: number[]
  ): ClinicalAlert[] {
    const pathway = this.getPathway(condition);
    if (!pathway) return [];

    const alerts: ClinicalAlert[] = [];
    const requiredSteps = pathway.steps.filter(s => s.required);
    const missingSteps = requiredSteps.filter(s => !completedSteps.includes(s.order));

    for (const step of missingSteps) {
      alerts.push({
        id: \`pathway-\${condition}-\${step.order}\`,
        severity: 'warning',
        type: 'guideline',
        title: \`\${pathway.condition} Pathway - Step Missing\`,
        description: step.action,
        recommendation: \`Complete within \${step.timeframe}\`,
        evidence: [\`\${pathway.condition} clinical pathway\`],
        dismissible: true,
        requiresAcknowledgment: false
      });
    }

    return alerts;
  }
}
\`\`\`

## Best Practices

1. **Keep alerts actionable** - Every alert should have clear next steps
2. **Minimize alert fatigue** - Only show high-value alerts
3. **Provide evidence** - Link to guidelines, studies
4. **Make alerts dismissible** - Allow override with reason documentation
5. **Track alert outcomes** - Monitor which alerts are acted upon
6. **Integrate seamlessly** - Fit into clinical workflow
7. **Update regularly** - Keep drug databases and guidelines current
8. **Test thoroughly** - Clinical accuracy is critical
9. **Log all decisions** - Audit trail for medico-legal purposes
10. **Comply with regulations** - FDA, HIPAA, clinical guidelines

## Resources
- RxNorm API: https://rxnav.nlm.nih.gov/
- LOINC Database: https://loinc.org/
- Clinical Guidelines: https://www.guidelines.gov/`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
