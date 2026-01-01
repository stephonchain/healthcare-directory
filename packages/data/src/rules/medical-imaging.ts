export const medicalImagingRules = [
  {
    tags: ["DICOM", "Medical Imaging", "Healthcare", "Radiology"],
    title: "DICOM Medical Imaging Processing",
    libs: ["dicom-parser", "cornerstone-core", "dcmjs"],
    slug: "dicom-imaging",
    content: `You are a medical imaging expert helping work with DICOM (Digital Imaging and Communications in Medicine) files.

## DICOM Overview

DICOM is the standard format for medical imaging data including:
- **CT**: Computed Tomography
- **MRI**: Magnetic Resonance Imaging
- **X-Ray**: Radiography
- **Ultrasound**: Sonography
- **PET**: Positron Emission Tomography

### DICOM File Structure
- **Header**: File meta information (128-byte preamble + "DICM" prefix)
- **Data Elements**: Tags containing patient info, study details, image data
- **Pixel Data**: Actual image bytes (compressed or uncompressed)

## Reading DICOM Files (JavaScript/TypeScript)

\`\`\`typescript
import * as dicomParser from 'dicom-parser';
import * as fs from 'fs';

function parseDICOMFile(filePath: string) {
  const dicomFile = fs.readFileSync(filePath);
  const dataSet = dicomParser.parseDicom(dicomFile);

  return {
    // Patient Information
    patientName: dataSet.string('x00100010'),
    patientID: dataSet.string('x00100020'),
    patientBirthDate: dataSet.string('x00100030'),
    patientSex: dataSet.string('x00100040'),

    // Study Information
    studyDate: dataSet.string('x00080020'),
    studyTime: dataSet.string('x00080030'),
    studyDescription: dataSet.string('x00081030'),
    studyInstanceUID: dataSet.string('x0020000d'),

    // Series Information
    modality: dataSet.string('x00080060'),
    seriesNumber: dataSet.string('x00200011'),
    seriesDescription: dataSet.string('x0008103e'),

    // Image Information
    instanceNumber: dataSet.string('x00200013'),
    rows: dataSet.uint16('x00280010'),
    columns: dataSet.uint16('x00280011'),
    bitsAllocated: dataSet.uint16('x00280100'),
    pixelSpacing: dataSet.string('x00280030'),

    // Pixel Data
    pixelDataElement: dataSet.elements.x7fe00010
  };
}

// Usage
const dicomData = parseDICOMFile('./scan.dcm');
console.log('Patient:', dicomData.patientName);
console.log('Modality:', dicomData.modality);
console.log('Image size:', \`\${dicomData.columns}x\${dicomData.rows}\`);
\`\`\`

## Common DICOM Tags

\`\`\`typescript
const DICOM_TAGS = {
  // Patient Module
  PATIENT_NAME: 'x00100010',
  PATIENT_ID: 'x00100020',
  PATIENT_BIRTH_DATE: 'x00100030',
  PATIENT_SEX: 'x00100040',

  // Study Module
  STUDY_INSTANCE_UID: 'x0020000d',
  STUDY_DATE: 'x00080020',
  STUDY_TIME: 'x00080030',
  ACCESSION_NUMBER: 'x00080050',
  STUDY_DESCRIPTION: 'x00081030',

  // Series Module
  MODALITY: 'x00080060',
  SERIES_INSTANCE_UID: 'x0020000e',
  SERIES_NUMBER: 'x00200011',
  SERIES_DESCRIPTION: 'x0008103e',

  // Image Module
  INSTANCE_NUMBER: 'x00200013',
  IMAGE_POSITION: 'x00200032',
  IMAGE_ORIENTATION: 'x00200037',
  SLICE_THICKNESS: 'x00180050',

  // Image Pixel Module
  ROWS: 'x00280010',
  COLUMNS: 'x00280011',
  BITS_ALLOCATED: 'x00280100',
  BITS_STORED: 'x00280101',
  PIXEL_REPRESENTATION: 'x00280103',
  PIXEL_DATA: 'x7fe00010',
  PIXEL_SPACING: 'x00280030',

  // Window Level
  WINDOW_CENTER: 'x00281050',
  WINDOW_WIDTH: 'x00281051'
};
\`\`\`

## Displaying DICOM Images (Cornerstone.js)

\`\`\`typescript
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

// Initialize
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

async function displayDICOM(elementId: string, imageId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Enable the element
  cornerstone.enable(element);

  // Load and display the image
  const image = await cornerstone.loadImage(imageId);
  cornerstone.displayImage(element, image);

  // Apply default viewport settings
  const viewport = cornerstone.getDefaultViewportForImage(element, image);
  cornerstone.setViewport(element, viewport);
}

// Usage
displayDICOM('dicomImage', 'wadouri:./scan.dcm');
\`\`\`

## Image Manipulation

\`\`\`typescript
// Window/Level adjustment
function adjustWindowLevel(elementId: string, windowWidth: number, windowCenter: number) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const viewport = cornerstone.getViewport(element);
  viewport.voi.windowWidth = windowWidth;
  viewport.voi.windowCenter = windowCenter;
  cornerstone.setViewport(element, viewport);
}

// Zoom
function zoom(elementId: string, scale: number) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const viewport = cornerstone.getViewport(element);
  viewport.scale = scale;
  cornerstone.setViewport(element, viewport);
}

// Pan
function pan(elementId: string, x: number, y: number) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const viewport = cornerstone.getViewport(element);
  viewport.translation.x = x;
  viewport.translation.y = y;
  cornerstone.setViewport(element, viewport);
}

// Invert colors
function invert(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const viewport = cornerstone.getViewport(element);
  viewport.invert = !viewport.invert;
  cornerstone.setViewport(element, viewport);
}
\`\`\`

## DICOM Web (DICOMweb) API

\`\`\`typescript
import axios from 'axios';

class DICOMwebClient {
  constructor(private baseUrl: string, private token: string) {}

  // QIDO-RS: Query
  async searchStudies(params: {
    patientID?: string;
    studyDate?: string;
    modality?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params.patientID) queryParams.append('PatientID', params.patientID);
    if (params.studyDate) queryParams.append('StudyDate', params.studyDate);
    if (params.modality) queryParams.append('Modality', params.modality);

    const response = await axios.get(
      \`\${this.baseUrl}/studies?\${queryParams.toString()}\`,
      {
        headers: {
          'Authorization': \`Bearer \${this.token}\`,
          'Accept': 'application/dicom+json'
        }
      }
    );

    return response.data;
  }

  // WADO-RS: Retrieve
  async retrieveStudy(studyInstanceUID: string) {
    const response = await axios.get(
      \`\${this.baseUrl}/studies/\${studyInstanceUID}\`,
      {
        headers: {
          'Authorization': \`Bearer \${this.token}\`,
          'Accept': 'multipart/related; type=application/dicom'
        },
        responseType: 'arraybuffer'
      }
    );

    return response.data;
  }

  // STOW-RS: Store
  async storeInstance(dicomFile: Buffer, studyInstanceUID: string) {
    const formData = new FormData();
    formData.append('file', new Blob([dicomFile]), 'instance.dcm');

    const response = await axios.post(
      \`\${this.baseUrl}/studies/\${studyInstanceUID}\`,
      formData,
      {
        headers: {
          'Authorization': \`Bearer \${this.token}\`,
          'Content-Type': 'multipart/related; type=application/dicom'
        }
      }
    );

    return response.data;
  }
}

// Usage
const client = new DICOMwebClient('https://pacs.hospital.com/dicomweb', authToken);

const studies = await client.searchStudies({
  patientID: '123456',
  modality: 'CT'
});

console.log('Found studies:', studies.length);
\`\`\`

## Anonymization

\`\`\`typescript
import * as dicomParser from 'dicom-parser';
import * as dcmjs from 'dcmjs';

function anonymizeDICOM(dicomBuffer: Buffer): Buffer {
  const dataSet = dicomParser.parseDicom(new Uint8Array(dicomBuffer));

  // Tags to remove for de-identification
  const tagsToRemove = [
    'x00100010', // Patient Name
    'x00100020', // Patient ID
    'x00100030', // Patient Birth Date
    'x00100032', // Patient Birth Time
    'x00101000', // Other Patient IDs
    'x00101001', // Other Patient Names
    'x00102160', // Ethnic Group
    'x00102180', // Occupation
    'x001021a0', // Smoking Status
    'x00104000', // Patient Comments
  ];

  // Create anonymized dataset
  const anonymized = { ...dataSet };

  tagsToRemove.forEach(tag => {
    if (anonymized.elements[tag]) {
      delete anonymized.elements[tag];
    }
  });

  // Replace identifiable data with generic values
  anonymized.string('x00100010', 'ANONYMOUS');
  anonymized.string('x00100020', 'ANON_' + Date.now());
  anonymized.string('x00100030', '19000101');

  return Buffer.from(anonymized.byteArray);
}
\`\`\`

## React Component Example

\`\`\`typescript
import React, { useEffect, useRef, useState } from 'react';
import * as cornerstone from 'cornerstone-core';

interface DICOMViewerProps {
  imageId: string;
}

export function DICOMViewer({ imageId }: DICOMViewerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [windowLevel, setWindowLevel] = useState({ width: 400, center: 40 });
  const [zoom, setZoom] = useState(1.0);

  useEffect(() => {
    if (!elementRef.current) return;

    cornerstone.enable(elementRef.current);

    cornerstone.loadImage(imageId).then(image => {
      cornerstone.displayImage(elementRef.current!, image);
    });

    return () => {
      if (elementRef.current) {
        cornerstone.disable(elementRef.current);
      }
    };
  }, [imageId]);

  useEffect(() => {
    if (!elementRef.current) return;

    const viewport = cornerstone.getViewport(elementRef.current);
    viewport.voi.windowWidth = windowLevel.width;
    viewport.voi.windowCenter = windowLevel.center;
    viewport.scale = zoom;
    cornerstone.setViewport(elementRef.current, viewport);
  }, [windowLevel, zoom]);

  return (
    <div className="dicom-viewer">
      <div ref={elementRef} className="dicom-canvas" />

      <div className="controls">
        <div>
          <label>Window Width:</label>
          <input
            type="range"
            min="1"
            max="4000"
            value={windowLevel.width}
            onChange={e => setWindowLevel(prev => ({
              ...prev,
              width: Number(e.target.value)
            }))}
          />
        </div>

        <div>
          <label>Window Center:</label>
          <input
            type="range"
            min="-1000"
            max="1000"
            value={windowLevel.center}
            onChange={e => setWindowLevel(prev => ({
              ...prev,
              center: Number(e.target.value)
            }))}
          />
        </div>

        <div>
          <label>Zoom:</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
\`\`\`

## Best Practices
1. Always de-identify PHI when necessary
2. Use HTTPS for DICOM transmission
3. Validate DICOM conformance
4. Handle large files efficiently (streaming)
5. Implement proper error handling
6. Cache images for performance
7. Use web workers for processing
8. Implement proper access controls
9. Log all image access for auditing
10. Test with various modalities and vendors`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
