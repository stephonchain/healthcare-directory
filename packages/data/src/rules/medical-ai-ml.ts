export const medicalAiMlRules = [
  {
    tags: ["AI", "Machine Learning", "Healthcare", "Deep Learning", "Medical AI"],
    title: "Medical AI and Machine Learning Development",
    libs: ["tensorflow", "pytorch", "scikit-learn", "openai", "langchain"],
    slug: "medical-ai-ml",
    content: `You are a medical AI/ML expert helping build AI-powered healthcare applications.

## Medical AI Use Cases

1. **Diagnostic Support** - Image analysis, symptom checkers
2. **Predictive Analytics** - Risk scoring, readmission prediction
3. **Clinical Documentation** - AI scribes, automated coding
4. **Drug Discovery** - Molecule generation, clinical trial matching
5. **Personalized Medicine** - Treatment recommendations
6. **Administrative** - Scheduling optimization, resource allocation

## Medical Image Analysis (Deep Learning)

\`\`\`python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

class ChestXRayClassifier:
    """
    Classify chest X-rays for pneumonia detection
    """

    def __init__(self, model_path=None):
        if model_path:
            self.model = keras.models.load_model(model_path)
        else:
            self.model = self.build_model()

    def build_model(self):
        """Build CNN for chest X-ray classification"""
        model = keras.Sequential([
            # Input: 224x224x3 images
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),

            layers.Flatten(),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.5),

            # Binary classification: normal vs pneumonia
            layers.Dense(1, activation='sigmoid')
        ])

        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy', 'AUC', 'Precision', 'Recall']
        )

        return model

    def train(self, train_data, validation_data, epochs=20):
        """Train the model"""
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=5,
                restore_best_weights=True
            ),
            keras.callbacks.ModelCheckpoint(
                'best_model.h5',
                monitor='val_auc',
                save_best_only=True
            )
        ]

        history = self.model.fit(
            train_data,
            validation_data=validation_data,
            epochs=epochs,
            callbacks=callbacks
        )

        return history

    def predict(self, image):
        """Predict on a single image"""
        # Preprocess
        img = tf.image.resize(image, (224, 224))
        img = img / 255.0  # Normalize
        img = tf.expand_dims(img, 0)  # Add batch dimension

        # Predict
        prediction = self.model.predict(img)[0][0]

        return {
            'probability': float(prediction),
            'classification': 'Pneumonia' if prediction > 0.5 else 'Normal',
            'confidence': float(abs(prediction - 0.5) * 2)  # 0-1 scale
        }

    def explain_prediction(self, image):
        """Generate Grad-CAM heatmap for explainability"""
        # Implement Grad-CAM for visual explanation
        # Shows which parts of X-ray influenced the decision
        pass

# Usage
classifier = ChestXRayClassifier()

# Train
history = classifier.train(train_dataset, val_dataset, epochs=20)

# Predict
xray_image = load_xray('patient_xray.jpg')
result = classifier.predict(xray_image)

print(f"Classification: {result['classification']}")
print(f"Confidence: {result['confidence']:.2%}")
\`\`\`

## Clinical NLP for Documentation

\`\`\`typescript
import OpenAI from 'openai';

class ClinicalNLP {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async extractClinicalEntities(text: string) {
    /**
     * Extract medical entities from clinical notes:
     * - Medications
     * - Conditions/Diagnoses
     * - Procedures
     * - Lab results
     * - Symptoms
     */
    const prompt = \`
Extract medical entities from this clinical note:

"\${text}"

Return JSON with:
- medications: [{name, dosage, frequency}]
- conditions: [string]
- procedures: [string]
- symptoms: [string]
- lab_results: [{test, value, unit}]
\`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a medical NLP system. Extract structured data from clinical notes.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  async generateClinicalSummary(notes: string[]) {
    /**
     * Generate concise clinical summary from multiple notes
     */
    const prompt = \`
Summarize the following clinical notes into a concise summary:

\${notes.map((n, i) => \`Note \${i + 1}:\\n\${n}\`).join('\\n\\n')}

Include:
1. Chief complaint
2. Relevant history
3. Key findings
4. Current treatment plan
5. Follow-up needed
\`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a medical documentation assistant. Create accurate, concise clinical summaries.'
        },
        { role: 'user', content: prompt }
      ]
    });

    return response.choices[0].message.content;
  }

  async generateICD10Codes(diagnosis: string) {
    /**
     * Suggest ICD-10 codes for diagnosis
     */
    const prompt = \`
Suggest appropriate ICD-10 codes for: "\${diagnosis}"

Return JSON array of:
- code: ICD-10 code
- description: Full description
- specificity: how specific this code is (low/medium/high)
\`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a medical coding assistant. Suggest accurate ICD-10 codes.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }
}

// Usage
const nlp = new ClinicalNLP(process.env.OPENAI_API_KEY!);

const clinicalNote = \`
Patient presents with chest pain radiating to left arm, onset 2 hours ago.
PMH: Hypertension, Type 2 Diabetes. Current meds: Metformin 1000mg BID, Lisinopril 10mg daily.
Vitals: BP 160/95, HR 102, RR 18, O2 sat 97% on RA.
EKG shows ST elevation in leads II, III, aVF.
Troponin elevated at 1.2 ng/mL.
Assessment: Acute inferior STEMI. Plan: Activate cath lab, start heparin, ASA, clopidogrel.
\`;

const entities = await nlp.extractClinicalEntities(clinicalNote);
console.log('Extracted entities:', entities);

const codes = await nlp.generateICD10Codes('Acute inferior STEMI');
console.log('ICD-10 codes:', codes);
\`\`\`

## Predictive Risk Scoring

\`\`\`python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

class ReadmissionRiskModel:
    """
    Predict 30-day hospital readmission risk
    """

    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.feature_names = []

    def prepare_features(self, patient_data):
        """
        Engineer features for readmission prediction
        """
        features = pd.DataFrame()

        # Demographics
        features['age'] = patient_data['age']
        features['is_male'] = (patient_data['gender'] == 'M').astype(int)

        # Clinical
        features['num_comorbidities'] = patient_data['comorbidities'].apply(len)
        features['has_diabetes'] = patient_data['comorbidities'].apply(
            lambda x: 'diabetes' in x.lower()
        ).astype(int)
        features['has_chf'] = patient_data['comorbidities'].apply(
            lambda x: 'heart failure' in x.lower()
        ).astype(int)

        # Utilization
        features['prior_admissions_1yr'] = patient_data['prior_admissions_1yr']
        features['length_of_stay'] = patient_data['length_of_stay']
        features['num_medications'] = patient_data['medications'].apply(len)

        # Labs
        features['hba1c'] = patient_data['hba1c'].fillna(patient_data['hba1c'].median())
        features['creatinine'] = patient_data['creatinine'].fillna(
            patient_data['creatinine'].median()
        )

        # Social determinants
        features['lives_alone'] = patient_data['lives_alone'].astype(int)
        features['has_transportation'] = patient_data['has_transportation'].astype(int)

        self.feature_names = features.columns.tolist()

        return features

    def train(self, patient_data, outcomes):
        """Train the readmission risk model"""
        X = self.prepare_features(patient_data)
        y = outcomes

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        y_prob = self.model.predict_proba(X_test)[:, 1]

        auc = roc_auc_score(y_test, y_prob)

        print(f"Model AUC: {auc:.3f}")
        print("\\nClassification Report:")
        print(classification_report(y_test, y_pred))

        # Feature importance
        importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)

        print("\\nTop 5 Important Features:")
        print(importance.head())

        return {
            'auc': auc,
            'feature_importance': importance
        }

    def predict_risk(self, patient_data):
        """Predict readmission risk for a single patient"""
        X = self.prepare_features(pd.DataFrame([patient_data]))
        probability = self.model.predict_proba(X)[0][1]

        # Risk stratification
        if probability >= 0.7:
            risk_category = 'High'
            interventions = [
                'Schedule follow-up within 7 days',
                'Home health visit',
                'Medication reconciliation call',
                'Care coordinator assignment'
            ]
        elif probability >= 0.4:
            risk_category = 'Medium'
            interventions = [
                'Schedule follow-up within 14 days',
                'Medication reconciliation call'
            ]
        else:
            risk_category = 'Low'
            interventions = ['Standard follow-up within 30 days']

        return {
            'probability': float(probability),
            'risk_category': risk_category,
            'recommended_interventions': interventions
        }

# Usage
model = ReadmissionRiskModel()

# Train
metrics = model.train(historical_patient_data, readmission_outcomes)

# Predict for new patient
patient = {
    'age': 72,
    'gender': 'M',
    'comorbidities': ['Diabetes', 'Heart Failure', 'CKD'],
    'prior_admissions_1yr': 3,
    'length_of_stay': 7,
    'medications': ['Metformin', 'Furosemide', 'Lisinopril', 'Warfarin'],
    'hba1c': 8.5,
    'creatinine': 2.1,
    'lives_alone': True,
    'has_transportation': False
}

risk = model.predict_risk(patient)
print(f"Readmission Risk: {risk['probability']:.1%}")
print(f"Category: {risk['risk_category']}")
print("Interventions:", risk['recommended_interventions'])
\`\`\`

## Clinical Trial Matching with RAG

\`\`\`typescript
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RetrievalQAChain } from 'langchain/chains';

class ClinicalTrialMatcher {
  private vectorStore: HNSWLib;
  private qaChain: RetrievalQAChain;

  async initialize(trialsData: any[]) {
    // Create embeddings of clinical trial descriptions
    const docs = trialsData.map(trial => ({
      pageContent: \`
        Study: \${trial.title}
        Condition: \${trial.condition}
        Phase: \${trial.phase}
        Inclusion Criteria: \${trial.inclusion_criteria.join(', ')}
        Exclusion Criteria: \${trial.exclusion_criteria.join(', ')}
        Location: \${trial.locations.join(', ')}
      \`,
      metadata: trial
    }));

    // Create vector store
    this.vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );

    // Create QA chain
    this.qaChain = RetrievalQAChain.fromLLM(
      new ChatOpenAI({ modelName: 'gpt-4' }),
      this.vectorStore.asRetriever()
    );
  }

  async matchPatient(patientProfile: {
    age: number;
    gender: string;
    diagnosis: string;
    stage: string;
    priorTreatments: string[];
    comorbidities: string[];
    location: string;
  }) {
    const query = \`
Find clinical trials suitable for:
- Age: \${patientProfile.age}
- Gender: \${patientProfile.gender}
- Diagnosis: \${patientProfile.diagnosis} (Stage \${patientProfile.stage})
- Prior treatments: \${patientProfile.priorTreatments.join(', ')}
- Comorbidities: \${patientProfile.comorbidities.join(', ')}
- Location: \${patientProfile.location}

List matching trials and explain why they match.
\`;

    const result = await this.qaChain.call({ query });

    return result.text;
  }
}

// Usage
const matcher = new ClinicalTrialMatcher();
await matcher.initialize(clinicalTrialsDatabase);

const matches = await matcher.matchPatient({
  age: 58,
  gender: 'F',
  diagnosis: 'Breast Cancer',
  stage: 'II',
  priorTreatments: ['Lumpectomy', 'Radiation'],
  comorbidities: ['Type 2 Diabetes'],
  location: 'New York, NY'
});

console.log('Matching Trials:', matches);
\`\`\`

## Regulatory Considerations

### FDA Regulations for AI/ML Medical Devices

**Software as a Medical Device (SaMD) Classification:**

- **Class I**: Low risk (e.g., medication reminder apps)
- **Class II**: Moderate risk (e.g., diagnostic support tools) - Requires 510(k)
- **Class III**: High risk (e.g., autonomous diagnostic systems) - Requires PMA

**AI/ML-Specific Guidance:**
- Algorithm Change Protocol (ACP) required
- Real-world performance monitoring
- Predetermined change control plan

### Validation Requirements

\`\`\`python
def validate_clinical_model(model, test_data, test_labels):
    """
    Comprehensive validation for clinical ML models
    """
    from sklearn.metrics import (
        accuracy_score,
        precision_score,
        recall_score,
        f1_score,
        roc_auc_score,
        confusion_matrix
    )

    predictions = model.predict(test_data)
    probabilities = model.predict_proba(test_data)[:, 1]

    metrics = {
        'accuracy': accuracy_score(test_labels, predictions),
        'precision': precision_score(test_labels, predictions),
        'recall': recall_score(test_labels, predictions),
        'f1': f1_score(test_labels, predictions),
        'auc': roc_auc_score(test_labels, probabilities),
        'specificity': specificity_score(test_labels, predictions),
        'npv': negative_predictive_value(test_labels, predictions),
        'ppv': positive_predictive_value(test_labels, predictions)
    }

    # Clinical thresholds
    assert metrics['sensitivity'] >= 0.95, "Sensitivity too low for clinical use"
    assert metrics['specificity'] >= 0.90, "Specificity too low"

    # Subgroup analysis (check for bias)
    subgroups = ['age_group', 'gender', 'ethnicity']
    for subgroup in subgroups:
        analyze_subgroup_performance(model, test_data, test_labels, subgroup)

    return metrics
\`\`\`

## Best Practices

1. **Clinical Validation** - Test with real clinicians in real settings
2. **Bias Mitigation** - Check performance across demographics
3. **Explainability** - Use SHAP, LIME for model interpretation
4. **Continuous Monitoring** - Track real-world performance
5. **Version Control** - Track model versions and training data
6. **Documentation** - Maintain comprehensive model cards
7. **Privacy** - De-identify training data, differential privacy
8. **Regulatory Compliance** - Follow FDA, CE Mark requirements
9. **Clinical Integration** - Fit into existing workflows
10. **Human Oversight** - Never fully autonomous for critical decisions`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
