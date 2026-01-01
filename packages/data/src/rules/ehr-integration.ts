export const ehrIntegrationRules = [
  {
    tags: ["EHR", "EMR", "Integration", "Healthcare", "Epic", "Cerner"],
    title: "EHR/EMR Integration Best Practices",
    libs: ["axios", "fhir", "hl7"],
    slug: "ehr-emr-integration",
    content: `You are an EHR/EMR integration expert helping connect healthcare applications with Electronic Health Record systems.

## Major EHR/EMR Systems

### Epic (40% US market share)
- **Integration Methods**: FHIR API, HL7 v2, Web Services
- **Epic App Orchard**: Marketplace for Epic integrations
- **MyChart API**: Patient-facing applications

### Cerner (25% US market share)
- **Integration Methods**: FHIR API, CCL (Cerner Command Language), HL7
- **Cerner Code**: Developer program
- **HealtheIntent**: Population health platform

### Others
- **Allscripts**: FHIR, HL7, proprietary APIs
- **Meditech**: Magic API, FHIR
- **athenahealth**: athenaNet API (REST)

## Integration Patterns

### 1. FHIR API Integration (Recommended)

\`\`\`typescript
import axios from 'axios';

interface EpicFHIRConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

class EpicFHIRClient {
  private config: EpicFHIRConfig;
  private accessToken?: string;

  constructor(config: EpicFHIRConfig) {
    this.config = config;
  }

  // OAuth 2.0 Authorization
  async authenticate(authCode: string): Promise<void> {
    const tokenUrl = \`\${this.config.baseUrl}/oauth2/token\`;

    const response = await axios.post(tokenUrl, {
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    this.accessToken = response.data.access_token;
  }

  // Get Patient Demographics
  async getPatient(patientId: string) {
    const url = \`\${this.config.baseUrl}/api/FHIR/R4/Patient/\${patientId}\`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Accept': 'application/fhir+json'
      }
    });

    return response.data;
  }

  // Search Observations (Labs, Vitals)
  async getObservations(patientId: string, category?: string) {
    const url = \`\${this.config.baseUrl}/api/FHIR/R4/Observation\`;

    const params: any = {
      patient: patientId,
      _count: 100
    };

    if (category) {
      params.category = category; // 'vital-signs', 'laboratory', etc.
    }

    const response = await axios.get(url, {
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Accept': 'application/fhir+json'
      },
      params
    });

    return response.data;
  }

  // Get Medications
  async getMedicationRequests(patientId: string) {
    const url = \`\${this.config.baseUrl}/api/FHIR/R4/MedicationRequest\`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Accept': 'application/fhir+json'
      },
      params: {
        patient: patientId,
        status: 'active'
      }
    });

    return response.data;
  }

  // Get Appointments
  async getAppointments(patientId: string) {
    const url = \`\${this.config.baseUrl}/api/FHIR/R4/Appointment\`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Accept': 'application/fhir+json'
      },
      params: {
        patient: patientId,
        date: \`ge\${new Date().toISOString().split('T')[0]}\`
      }
    });

    return response.data;
  }
}

// Usage
const epicClient = new EpicFHIRClient({
  baseUrl: 'https://fhir.epic.com',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://yourapp.com/callback'
});

await epicClient.authenticate(authorizationCode);
const patient = await epicClient.getPatient('eXYZ123');
console.log('Patient:', patient.name[0].family);
\`\`\`

### 2. HL7 v2 Integration (Legacy Systems)

\`\`\`typescript
import net from 'net';
import HL7 from 'simple-hl7';

class EHRMessageListener {
  private server: net.Server;
  private port: number;

  constructor(port: number) {
    this.port = port;
    this.server = net.createServer(this.handleConnection.bind(this));
  }

  start(): void {
    this.server.listen(this.port, () => {
      console.log(\`HL7 listener started on port \${this.port}\`);
    });
  }

  private handleConnection(socket: net.Socket): void {
    console.log('EHR connected:', socket.remoteAddress);

    let buffer = '';

    socket.on('data', async (data) => {
      buffer += data.toString();

      // Check for complete message (ends with 0x1C + 0x0D)
      if (buffer.includes(String.fromCharCode(0x1C))) {
        const messages = this.extractMessages(buffer);

        for (const message of messages) {
          await this.processMessage(message, socket);
        }

        buffer = '';
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  }

  private extractMessages(buffer: string): string[] {
    const START_BYTE = String.fromCharCode(0x0B);
    const END_BYTES = String.fromCharCode(0x1C) + String.fromCharCode(0x0D);

    return buffer
      .split(END_BYTES)
      .map(msg => msg.replace(START_BYTE, '').trim())
      .filter(msg => msg.length > 0);
  }

  private async processMessage(message: string, socket: net.Socket): Promise<void> {
    try {
      const hl7Msg = new HL7(message);
      const messageType = hl7Msg.get('MSH.9');

      console.log('Received message type:', messageType);

      // Process based on message type
      if (messageType.startsWith('ADT')) {
        await this.handleADT(hl7Msg);
      } else if (messageType.startsWith('ORU')) {
        await this.handleLabResult(hl7Msg);
      } else if (messageType.startsWith('ORM')) {
        await this.handleOrder(hl7Msg);
      }

      // Send ACK
      const ack = this.createACK(hl7Msg, 'AA');
      socket.write(this.wrapMLLP(ack));

    } catch (error) {
      console.error('Error processing message:', error);
      const ack = this.createACK(new HL7(message), 'AE');
      socket.write(this.wrapMLLP(ack));
    }
  }

  private async handleADT(msg: HL7): Promise<void> {
    // Handle patient admission/discharge/transfer
    const patientId = msg.get('PID.3.1');
    const eventType = msg.get('EVN.1');

    console.log(\`ADT Event: \${eventType} for patient \${patientId}\`);

    // Update your database
    await this.updatePatientStatus(patientId, eventType);
  }

  private async handleLabResult(msg: HL7): Promise<void> {
    // Handle lab results
    const patientId = msg.get('PID.3.1');
    const orderingProvider = msg.get('OBR.16');

    console.log(\`Lab result for patient \${patientId}\`);

    // Store lab results
    await this.storeLabResult(msg);
  }

  private async handleOrder(msg: HL7): Promise<void> {
    // Handle new orders
    const patientId = msg.get('PID.3.1');
    const orderControl = msg.get('ORC.1');

    console.log(\`Order \${orderControl} for patient \${patientId}\`);

    await this.processOrder(msg);
  }

  private createACK(originalMsg: HL7, status: 'AA' | 'AE' | 'AR'): string {
    const ack = new HL7();

    ack.set('MSH.1', '|');
    ack.set('MSH.2', '^~\\\\&');
    ack.set('MSH.3', originalMsg.get('MSH.5'));
    ack.set('MSH.5', originalMsg.get('MSH.3'));
    ack.set('MSH.9', 'ACK');
    ack.set('MSH.10', \`ACK\${Date.now()}\`);
    ack.set('MSA.1', status);
    ack.set('MSA.2', originalMsg.get('MSH.10'));

    return ack.toString();
  }

  private wrapMLLP(message: string): string {
    const START = String.fromCharCode(0x0B);
    const END = String.fromCharCode(0x1C) + String.fromCharCode(0x0D);
    return START + message + END;
  }

  private async updatePatientStatus(patientId: string, eventType: string): Promise<void> {
    // Implement database update
  }

  private async storeLabResult(msg: HL7): Promise<void> {
    // Implement lab result storage
  }

  private async processOrder(msg: HL7): Promise<void> {
    // Implement order processing
  }
}

// Start listener
const listener = new EHRMessageListener(2575);
listener.start();
\`\`\`

## Common Integration Challenges

### 1. Authentication & Authorization
- OAuth 2.0 flows can be complex
- Token refresh mechanisms
- Scope management
- Patient authorization

### 2. Data Mapping
- Different EHRs use different codes
- Map LOINC, SNOMED, ICD codes
- Handle missing data gracefully

### 3. Rate Limiting
- Epic: 1000 requests/hour per app
- Cerner: Varies by agreement
- Implement retry logic with exponential backoff

\`\`\`typescript
async function fetchWithRetry(
  url: string,
  options: any,
  maxRetries = 3
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios(url, options);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Rate limited
        const retryAfter = error.response.headers['retry-after'] || Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
\`\`\`

### 4. Testing
- Use sandbox environments
- Epic Sandbox: https://fhir.epic.com/Documentation
- Cerner Sandbox: https://fhir.cerner.com/millennium/dstu2/

## Best Practices

1. **Always use FHIR when available** - Modern, standardized, RESTful
2. **Implement robust error handling** - EHRs can be unreliable
3. **Cache data appropriately** - Reduce API calls
4. **Log everything** - Essential for debugging integrations
5. **Handle downtime gracefully** - EHRs have maintenance windows
6. **Validate data thoroughly** - Don't trust incoming data
7. **Document your integration** - Future you will thank you
8. **Monitor API usage** - Stay within rate limits
9. **Keep patient data secure** - HIPAA compliance is critical
10. **Test edge cases** - Missing data, malformed responses, etc.

## Certification Requirements

### Epic App Orchard
- FHIR certification required
- Security review
- Privacy review
- Annual re-certification

### Cerner Code
- Registration required
- Code review for marketplace apps
- Compliance documentation

## Resources
- Epic FHIR: https://fhir.epic.com
- Cerner FHIR: https://fhir.cerner.com
- SMART on FHIR: https://smarthealthit.org`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
