export const hl7IntegrationRules = [
  {
    tags: ["HL7", "Integration", "Healthcare", "Messaging"],
    title: "HL7 v2.x Message Integration",
    libs: ["simple-hl7", "node-hl7-client"],
    slug: "hl7-v2-integration",
    content: `You are an HL7 v2.x integration expert helping parse and generate healthcare messages.

## HL7 v2.x Overview

HL7 v2.x is a messaging standard for clinical and administrative data exchange between hospital systems.

### Common Message Types
- **ADT (Admit, Discharge, Transfer)**: Patient administration
  - ADT^A01: Patient admission
  - ADT^A03: Patient discharge
  - ADT^A08: Patient information update
- **ORM (Order Message)**: Orders for tests, medications
- **ORU (Observation Result)**: Lab results, observations
- **SIU (Scheduling Information)**: Appointment scheduling
- **DFT (Detailed Financial Transaction)**: Billing information

## Message Structure

\`\`\`
MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20240101120000||ADT^A01|MSG00001|P|2.5
EVN|A01|20240101120000
PID|1||123456^^^MRN||DOE^JOHN^A||19700101|M|||123 MAIN ST^^ANYTOWN^CA^12345||(555)555-5555
PV1|1|I|WARD1^101^01^HOSPITAL|||123^SMITH^JANE^MD
\`\`\`

### Segment Structure
- **MSH**: Message Header (required)
- **EVN**: Event Type
- **PID**: Patient Identification
- **PV1**: Patient Visit
- **OBX**: Observation/Result
- **ORC**: Order Control

## Parsing HL7 Messages (Node.js)

\`\`\`typescript
import HL7 from 'simple-hl7';

function parseHL7Message(rawMessage: string) {
  const msg = new HL7(rawMessage);

  return {
    messageType: msg.get('MSH.9'),
    sendingApp: msg.get('MSH.3'),
    receivingApp: msg.get('MSH.5'),
    timestamp: msg.get('MSH.7'),
    messageControlId: msg.get('MSH.10'),
    patient: {
      id: msg.get('PID.3.1'),
      name: {
        family: msg.get('PID.5.1'),
        given: msg.get('PID.5.2'),
        middle: msg.get('PID.5.3')
      },
      dob: msg.get('PID.7'),
      gender: msg.get('PID.8'),
      address: {
        street: msg.get('PID.11.1'),
        city: msg.get('PID.11.3'),
        state: msg.get('PID.11.4'),
        zip: msg.get('PID.11.5')
      },
      phone: msg.get('PID.13')
    }
  };
}

// Usage
const message = \`MSH|^~\\&|SENDAPP|SENDFAC|RECAPP|RECFAC|20240101120000||ADT^A01|MSG001|P|2.5
PID|1||123456^^^MRN||DOE^JOHN^A||19700101|M|||123 MAIN ST^^ANYTOWN^CA^12345||(555)555-5555\`;

const parsed = parseHL7Message(message);
console.log(parsed);
\`\`\`

## Generating HL7 Messages

\`\`\`typescript
import HL7 from 'simple-hl7';

function createADTA01(patient: any) {
  const msg = new HL7();

  // MSH - Message Header
  msg.set('MSH.1', '|');
  msg.set('MSH.2', '^~\\\\&');
  msg.set('MSH.3', 'MY_APP');
  msg.set('MSH.4', 'MY_FACILITY');
  msg.set('MSH.5', 'RECEIVING_APP');
  msg.set('MSH.6', 'RECEIVING_FAC');
  msg.set('MSH.7', new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14));
  msg.set('MSH.9', 'ADT^A01');
  msg.set('MSH.10', generateMessageId());
  msg.set('MSH.11', 'P');
  msg.set('MSH.12', '2.5');

  // EVN - Event Type
  msg.set('EVN.1', 'A01');
  msg.set('EVN.2', new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14));

  // PID - Patient Identification
  msg.set('PID.1', '1');
  msg.set('PID.3.1', patient.id);
  msg.set('PID.3.4', 'MRN');
  msg.set('PID.5.1', patient.lastName);
  msg.set('PID.5.2', patient.firstName);
  msg.set('PID.7', patient.dob.replace(/-/g, ''));
  msg.set('PID.8', patient.gender);
  msg.set('PID.11.1', patient.address.street);
  msg.set('PID.11.3', patient.address.city);
  msg.set('PID.11.4', patient.address.state);
  msg.set('PID.11.5', patient.address.zip);
  msg.set('PID.13', patient.phone);

  return msg.toString();
}

function generateMessageId(): string {
  return \`MSG\${Date.now()}\${Math.random().toString(36).substr(2, 9)}\`;
}
\`\`\`

## HL7 MLLP (Minimal Lower Layer Protocol)

HL7 messages are typically sent over TCP using MLLP framing:
- **Start Byte**: 0x0B (Vertical Tab)
- **End Bytes**: 0x1C (File Separator) + 0x0D (Carriage Return)

\`\`\`typescript
import net from 'net';

const START_BYTE = String.fromCharCode(0x0B);
const END_BYTES = String.fromCharCode(0x1C) + String.fromCharCode(0x0D);

class HL7MLLPClient {
  private socket: net.Socket;

  constructor(private host: string, private port: number) {
    this.socket = new net.Socket();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.host, () => {
        console.log('Connected to HL7 server');
        resolve();
      });

      this.socket.on('error', reject);
    });
  }

  sendMessage(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const wrappedMessage = START_BYTE + message + END_BYTES;

      this.socket.write(wrappedMessage, (err) => {
        if (err) reject(err);
      });

      this.socket.once('data', (data) => {
        const response = data.toString()
          .replace(START_BYTE, '')
          .replace(END_BYTES, '');
        resolve(response);
      });
    });
  }

  disconnect(): void {
    this.socket.end();
  }
}

// Usage
const client = new HL7MLLPClient('hl7.hospital.com', 2575);
await client.connect();

const ack = await client.sendMessage(adtMessage);
console.log('Acknowledgment:', ack);

client.disconnect();
\`\`\`

## ACK (Acknowledgment) Messages

\`\`\`typescript
function createACK(originalMessage: string, status: 'AA' | 'AE' | 'AR'): string {
  const msg = new HL7(originalMessage);
  const ack = new HL7();

  // Copy MSH fields
  ack.set('MSH.1', '|');
  ack.set('MSH.2', '^~\\\\&');
  ack.set('MSH.3', msg.get('MSH.5')); // Swap sender/receiver
  ack.set('MSH.4', msg.get('MSH.6'));
  ack.set('MSH.5', msg.get('MSH.3'));
  ack.set('MSH.6', msg.get('MSH.4'));
  ack.set('MSH.7', new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14));
  ack.set('MSH.9', 'ACK');
  ack.set('MSH.10', generateMessageId());
  ack.set('MSH.11', 'P');
  ack.set('MSH.12', '2.5');

  // MSA - Message Acknowledgment
  ack.set('MSA.1', status); // AA=Accept, AE=Error, AR=Reject
  ack.set('MSA.2', msg.get('MSH.10')); // Original message control ID

  if (status !== 'AA') {
    ack.set('MSA.3', 'Error processing message');
  }

  return ack.toString();
}
\`\`\`

## Validation

\`\`\`typescript
function validateHL7Message(message: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!message.startsWith('MSH')) {
    errors.push('Message must start with MSH segment');
  }

  const msg = new HL7(message);

  if (!msg.get('MSH.9')) {
    errors.push('Missing message type (MSH.9)');
  }

  if (!msg.get('MSH.10')) {
    errors.push('Missing message control ID (MSH.10)');
  }

  const messageType = msg.get('MSH.9.1');

  if (messageType === 'ADT' && !msg.get('PID.3')) {
    errors.push('ADT messages require patient ID (PID.3)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
\`\`\`

## Best Practices
1. Always validate messages before processing
2. Send proper ACK messages (AA/AE/AR)
3. Log all messages for troubleshooting
4. Handle special characters properly (^~\\&|)
5. Use appropriate encoding (usually ASCII or UTF-8)
6. Implement retry logic for failed transmissions
7. Monitor message queues
8. Document your interface specifications
9. Test with various HL7 versions (2.3, 2.4, 2.5)
10. Handle timezone conversions properly`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
