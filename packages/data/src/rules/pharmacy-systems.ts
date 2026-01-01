export const pharmacySystemsRules = [
  {
    tags: ["Pharmacy", "E-Prescribing", "Medication", "Healthcare"],
    title: "Pharmacy Management & E-Prescribing Systems",
    libs: ["axios", "zod", "qrcode"],
    slug: "pharmacy-systems",
    content: `You are a pharmacy systems expert helping build e-prescribing and pharmacy management applications.

## E-Prescribing (EPCS) Overview

Electronic Prescribing for Controlled Substances must comply with:
- **DEA regulations** for controlled substances
- **NCPDP SCRIPT standard** for prescription messages
- **Surescripts** network integration
- **Two-factor authentication** for EPCS

## Prescription Data Model

\`\`\`typescript
import { z } from 'zod';

const MedicationSchema = z.object({
  drugName: z.string(),
  ndc: z.string().regex(/^\d{11}$/), // National Drug Code
  rxnormCode: z.string(),
  strength: z.string(),
  dosageForm: z.enum([
    'tablet',
    'capsule',
    'liquid',
    'injection',
    'cream',
    'patch',
    'inhaler',
  ]),
});

const PrescriptionSchema = z.object({
  prescriptionId: z.string().uuid(),
  patientId: z.string(),
  providerId: z.string(),
  medication: MedicationSchema,
  directions: z.string().min(1),
  quantity: z.number().positive(),
  refills: z.number().min(0).max(12),
  daysSupply: z.number().positive(),
  substitutionAllowed: z.boolean().default(true),
  prescribedDate: z.date(),
  effectiveDate: z.date(),
  expirationDate: z.date(),
  controlledSubstanceSchedule: z.enum(['II', 'III', 'IV', 'V', 'Non-controlled']),
  pharmacyId: z.string().optional(),
  status: z.enum(['pending', 'transmitted', 'filled', 'cancelled', 'error']),
  priorAuthorizationRequired: z.boolean().default(false),
});

type Prescription = z.infer<typeof PrescriptionSchema>;

// Validate prescription
function validatePrescription(data: unknown): Prescription {
  return PrescriptionSchema.parse(data);
}
\`\`\`

## E-Prescribing Implementation

\`\`\`typescript
class EPrescribingService {
  private surescriptsApiUrl = 'https://api.surescripts.com';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendPrescription(prescription: Prescription): Promise<void> {
    // Validate prescription
    const validated = validatePrescription(prescription);

    // Convert to NCPDP SCRIPT format
    const scriptMessage = this.toNCPDPScript(validated);

    // Send via Surescripts
    const response = await fetch(\`\${this.surescriptsApiUrl}/prescriptions\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/xml',
      },
      body: scriptMessage,
    });

    if (!response.ok) {
      throw new Error(\`Failed to send prescription: \${response.statusText}\`);
    }

    // Update prescription status
    await this.updatePrescriptionStatus(validated.prescriptionId, 'transmitted');

    // Audit log
    await this.logPrescriptionEvent(validated.prescriptionId, 'transmitted');
  }

  private toNCPDPScript(prescription: Prescription): string {
    // Convert to NCPDP SCRIPT XML format
    return \`<?xml version="1.0" encoding="UTF-8"?>
<Message>
  <Header>
    <MessageID>\${prescription.prescriptionId}</MessageID>
    <SentTime>\${new Date().toISOString()}</SentTime>
    <From>
      <Identifier>\${prescription.providerId}</Identifier>
    </From>
  </Header>
  <Body>
    <NewRx>
      <Patient>
        <Identification>\${prescription.patientId}</Identification>
      </Patient>
      <Prescriber>
        <Identification>\${prescription.providerId}</Identification>
      </Prescriber>
      <Medication>
        <DrugDescription>\${prescription.medication.drugName}</DrugDescription>
        <DrugCoded>
          <ProductCode>\${prescription.medication.ndc}</ProductCode>
          <ProductCodeQualifier>ND</ProductCodeQualifier>
        </DrugCoded>
        <Quantity>
          <Value>\${prescription.quantity}</Value>
        </Quantity>
        <Directions>\${prescription.directions}</Directions>
        <Refills>\${prescription.refills}</Refills>
        <DaysSupply>\${prescription.daysSupply}</DaysSupply>
        <Substitutions>\${prescription.substitutionAllowed ? '1' : '0'}</Substitutions>
      </Medication>
    </NewRx>
  </Body>
</Message>\`;
  }

  async checkDrugInteractions(
    newMedication: string,
    currentMedications: string[]
  ): Promise<any[]> {
    // Check using FDB or similar drug database
    const response = await fetch('/api/drug-interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newDrug: newMedication,
        currentDrugs: currentMedications,
      }),
    });

    return response.json();
  }

  async verifyInsuranceCoverage(
    patientId: string,
    medication: string
  ): Promise<{
    covered: boolean;
    copay?: number;
    priorAuthRequired: boolean;
  }> {
    // Check with insurance via NCPDP Formulary and Benefit
    const response = await fetch('/api/insurance/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, medication }),
    });

    return response.json();
  }

  private async updatePrescriptionStatus(
    prescriptionId: string,
    status: string
  ): Promise<void> {
    // Update in database
  }

  private async logPrescriptionEvent(
    prescriptionId: string,
    event: string
  ): Promise<void> {
    // Audit logging for DEA compliance
  }
}
\`\`\`

## Pharmacy Management System

\`\`\`typescript
interface Inventory {
  ndc: string;
  drugName: string;
  quantityOnHand: number;
  reorderPoint: number;
  expirationDate: Date;
  lotNumber: string;
  location: string;
  cost: number;
}

class PharmacyManagementSystem {
  async fillPrescription(prescriptionId: string): Promise<void> {
    // 1. Retrieve prescription
    const prescription = await this.getPrescription(prescriptionId);

    // 2. Check inventory
    const inventory = await this.checkInventory(prescription.medication.ndc);

    if (inventory.quantityOnHand < prescription.quantity) {
      throw new Error('Insufficient inventory');
    }

    // 3. Verify patient insurance
    const insurance = await this.verifyInsurance(
      prescription.patientId,
      prescription.medication.ndc
    );

    // 4. Calculate pricing
    const pricing = this.calculatePricing(
      prescription.quantity,
      inventory.cost,
      insurance
    );

    // 5. Update inventory
    await this.decrementInventory(
      prescription.medication.ndc,
      prescription.quantity
    );

    // 6. Generate label
    const label = await this.generateLabel(prescription);

    // 7. Update prescription status
    await this.updatePrescriptionStatus(prescriptionId, 'filled');

    // 8. Notify patient
    await this.notifyPatient(prescription.patientId, {
      message: 'Your prescription is ready for pickup',
      prescriptionId,
    });
  }

  private async checkInventory(ndc: string): Promise<Inventory> {
    // Query inventory database
    const inventory = await db.inventory.findUnique({
      where: { ndc },
    });

    if (!inventory) {
      throw new Error('Medication not in inventory');
    }

    // Check expiration
    if (new Date(inventory.expirationDate) < new Date()) {
      throw new Error('Medication expired');
    }

    return inventory;
  }

  private calculatePricing(
    quantity: number,
    cost: number,
    insurance: any
  ): { totalCost: number; patientPay: number; insurancePay: number } {
    const totalCost = quantity * cost;

    let patientPay = totalCost;
    let insurancePay = 0;

    if (insurance.covered) {
      if (insurance.copay) {
        patientPay = insurance.copay;
        insurancePay = totalCost - insurance.copay;
      } else if (insurance.coinsurance) {
        patientPay = totalCost * insurance.coinsurance;
        insurancePay = totalCost * (1 - insurance.coinsurance);
      }
    }

    return {
      totalCost,
      patientPay,
      insurancePay,
    };
  }

  private async generateLabel(prescription: Prescription): Promise<string> {
    const label = \`
Pharmacy: Example Pharmacy
Phone: (555) 123-4567

Rx #\${prescription.prescriptionId}
Date: \${new Date().toLocaleDateString()}

PATIENT: \${await this.getPatientName(prescription.patientId)}

\${prescription.medication.drugName} \${prescription.medication.strength}

DIRECTIONS: \${prescription.directions}

Qty: \${prescription.quantity}
Refills: \${prescription.refills}

Prescriber: \${await this.getPrescriberName(prescription.providerId)}

\${prescription.substitutionAllowed ? '' : 'DISPENSE AS WRITTEN - NO SUBSTITUTIONS'}

Discard after: \${prescription.expirationDate.toLocaleDateString()}
    \`;

    return label;
  }

  async processRefillRequest(prescriptionId: string): Promise<void> {
    const prescription = await this.getPrescription(prescriptionId);

    // Check if refills available
    if (prescription.refills <= 0) {
      throw new Error('No refills remaining - contact prescriber');
    }

    // Check if too soon to refill (typically 80% of days supply)
    const daysSinceLastFill = this.getDaysSinceLastFill(prescriptionId);
    const minDaysBeforeRefill = prescription.daysSupply * 0.8;

    if (daysSinceLastFill < minDaysBeforeRefill) {
      throw new Error(\`Too soon to refill. Please wait \${Math.ceil(minDaysBeforeRefill - daysSinceLastFill)} more days\`);
    }

    // Check expiration
    if (new Date() > prescription.expirationDate) {
      throw new Error('Prescription expired - new prescription required');
    }

    // Process refill
    await this.fillPrescription(prescriptionId);

    // Decrement refills
    await this.decrementRefills(prescriptionId);
  }

  private getDaysSinceLastFill(prescriptionId: string): number {
    // Calculate from last fill date
    return 0; // Implementation
  }

  private async decrementRefills(prescriptionId: string): Promise<void> {
    // Update prescription refills count
  }

  private async getPrescription(prescriptionId: string): Promise<Prescription> {
    // Retrieve from database
    return {} as Prescription;
  }

  private async getPatientName(patientId: string): Promise<string> {
    return 'John Doe';
  }

  private async getPrescriberName(providerId: string): Promise<string> {
    return 'Dr. Smith';
  }

  private async verifyInsurance(patientId: string, ndc: string): Promise<any> {
    return { covered: true, copay: 10 };
  }

  private async decrementInventory(ndc: string, quantity: number): Promise<void> {
    // Update inventory
  }

  private async updatePrescriptionStatus(
    prescriptionId: string,
    status: string
  ): Promise<void> {
    // Update status
  }

  private async notifyPatient(
    patientId: string,
    notification: any
  ): Promise<void> {
    // Send SMS/email
  }
}
\`\`\`

## Medication Adherence Tracking

\`\`\`typescript
class MedicationAdherenceTracker {
  async trackAdherence(patientId: string, prescriptionId: string) {
    // Calculate PDC (Proportion of Days Covered)
    const fills = await this.getPrescriptionFills(prescriptionId);

    const totalDays = this.calculateTotalDays(fills);
    const daysCovered = this.calculateDaysCovered(fills);

    const pdc = daysCovered / totalDays;

    // PDC >= 80% is considered adherent
    const isAdherent = pdc >= 0.8;

    return {
      pdc: pdc * 100,
      isAdherent,
      recommendation: isAdherent
        ? 'Patient is adherent to medication'
        : 'Patient may need adherence support',
    };
  }

  async sendRefillReminder(patientId: string, prescriptionId: string) {
    const prescription = await this.getPrescription(prescriptionId);

    // Calculate when patient should have ~7 days of medication left
    const lastFillDate = await this.getLastFillDate(prescriptionId);
    const reminderDate = new Date(lastFillDate);
    reminderDate.setDate(reminderDate.getDate() + prescription.daysSupply - 7);

    if (new Date() >= reminderDate) {
      await this.sendNotification(patientId, {
        type: 'refill_reminder',
        message: \`Time to refill your \${prescription.medication.drugName}\`,
        prescriptionId,
      });
    }
  }

  private async getPrescriptionFills(prescriptionId: string): Promise<any[]> {
    return []; // Retrieve fill history
  }

  private calculateTotalDays(fills: any[]): number {
    return 0; // Implementation
  }

  private calculateDaysCovered(fills: any[]): number {
    return 0; // Implementation
  }

  private async getPrescription(prescriptionId: string): Promise<Prescription> {
    return {} as Prescription;
  }

  private async getLastFillDate(prescriptionId: string): Promise<Date> {
    return new Date();
  }

  private async sendNotification(patientId: string, notification: any): Promise<void> {
    // Send notification
  }
}
\`\`\`

## Barcode Scanning (for inventory)

\`\`\`typescript
import QRCode from 'qrcode';

class PharmacyBarcode {
  async generateNDCBarcode(ndc: string): Promise<string> {
    // Generate Data Matrix barcode for NDC
    const barcode = await QRCode.toDataURL(ndc, {
      type: 'image/png',
      errorCorrectionLevel: 'H',
      width: 200,
    });

    return barcode;
  }

  async scanBarcode(imageData: string): Promise<string> {
    // Use barcode scanning library
    // Returns NDC or other identifier
    return '12345678901';
  }

  async verifyMedication(scannedNDC: string, expectedNDC: string): Promise<boolean> {
    if (scannedNDC !== expectedNDC) {
      throw new Error('MEDICATION MISMATCH - DO NOT DISPENSE');
    }
    return true;
  }
}
\`\`\`

## Controlled Substance Monitoring

\`\`\`typescript
class ControlledSubstanceMonitoring {
  async checkPDMP(
    patientId: string,
    state: string
  ): Promise<{
    prescriptions: any[];
    riskScore: number;
    alerts: string[];
  }> {
    // Query state Prescription Drug Monitoring Program
    const pdmpData = await fetch(\`https://pdmp.\${state}.gov/api/query\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.PDMP_API_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId }),
    });

    const data = await pdmpData.json();

    // Calculate risk score
    const riskScore = this.calculateRiskScore(data.prescriptions);

    // Generate alerts
    const alerts: string[] = [];

    if (riskScore > 80) {
      alerts.push('HIGH RISK: Multiple controlled substance prescriptions');
    }

    const multipleProviders = this.checkMultipleProviders(data.prescriptions);
    if (multipleProviders) {
      alerts.push('Alert: Prescriptions from multiple providers');
    }

    const overlappingPrescriptions = this.checkOverlappingPrescriptions(data.prescriptions);
    if (overlappingPrescriptions) {
      alerts.push('Alert: Overlapping controlled substance prescriptions');
    }

    return {
      prescriptions: data.prescriptions,
      riskScore,
      alerts,
    };
  }

  private calculateRiskScore(prescriptions: any[]): number {
    // Risk scoring algorithm
    let score = 0;

    // Number of controlled substance prescriptions
    score += prescriptions.length * 10;

    // Multiple prescribers
    const uniquePrescribers = new Set(prescriptions.map(p => p.prescriberId));
    if (uniquePrescribers.size > 3) {
      score += 30;
    }

    // Multiple pharmacies
    const uniquePharmacies = new Set(prescriptions.map(p => p.pharmacyId));
    if (uniquePharmacies.size > 3) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private checkMultipleProviders(prescriptions: any[]): boolean {
    const prescribers = new Set(prescriptions.map(p => p.prescriberId));
    return prescribers.size > 3;
  }

  private checkOverlappingPrescriptions(prescriptions: any[]): boolean {
    // Check for overlapping date ranges
    return false; // Implementation
  }
}
\`\`\`

## Best Practices

1. **DEA Compliance** - Follow all DEA regulations for controlled substances
2. **Two-Factor Auth** - Required for EPCS
3. **Drug Interaction Checks** - Always check before dispensing
4. **Inventory Management** - Track controlled substances precisely
5. **PDMP Integration** - Check before dispensing controlled substances
6. **Patient Counseling** - Document all counseling sessions
7. **Expiration Tracking** - Remove expired medications
8. **Audit Trails** - Log all prescription events
9. **Insurance Verification** - Verify before filling
10. **Medication Therapy Management** - Provide MTM services`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
