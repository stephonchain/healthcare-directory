export const healthcareMobileAppsRules = [
  {
    tags: ["Mobile", "React Native", "Healthcare", "iOS", "Android", "HIPAA"],
    title: "Healthcare Mobile App Development",
    libs: ["react-native", "expo", "react-native-health", "firebase"],
    slug: "healthcare-mobile-apps",
    content: `You are a healthcare mobile app development expert helping build HIPAA-compliant mobile health applications.

## Healthcare Mobile App Categories

1. **Patient Portals** - View records, schedule appointments
2. **Telemedicine** - Virtual consultations
3. **Remote Patient Monitoring** - Chronic disease management
4. **Medication Adherence** - Reminders, tracking
5. **Health & Wellness** - Fitness, nutrition, mental health
6. **Clinical Tools** - Medical calculators, reference guides
7. **EHR Mobile Access** - Provider-facing apps

## Security Requirements for Healthcare Apps

### HIPAA Compliance Checklist

\`\`\`typescript
// Security configuration
const securityConfig = {
  // 1. Data Encryption
  encryption: {
    atRest: 'AES-256',
    inTransit: 'TLS 1.3',
    database: 'SQLCipher', // Encrypted SQLite
  },

  // 2. Authentication
  authentication: {
    method: 'biometric-or-pin',
    sessionTimeout: 15, // minutes
    mfaRequired: true,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },

  // 3. Data Storage
  storage: {
    sensitiveData: 'secure-storage', // Keychain/Keystore
    cache: 'encrypted',
    logs: 'no-phi', // Never log PHI
  },

  // 4. Network Security
  network: {
    certificatePinning: true,
    allowHttp: false,
    vpnDetection: true,
  },

  // 5. App Security
  app: {
    jailbreakDetection: true,
    rootDetection: true,
    screenshotPrevention: true,
    clipboardAccess: 'restricted',
    backgroundDataClearing: true,
  },
};
\`\`\`

## React Native Healthcare App Setup

\`\`\`typescript
// App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import JailMonkey from 'jail-monkey';
import * as SecureStore from 'expo-secure-store';
import { enableScreens } from 'react-native-screens';

enableScreens();

export default function App() {
  useEffect(() => {
    // Security checks on app launch
    checkDeviceSecurity();
    setupInactivityTimer();
    disableScreenshots();
  }, []);

  const checkDeviceSecurity = async () => {
    // Check for jailbreak/root
    if (JailMonkey.isJailBroken()) {
      Alert.alert(
        'Security Warning',
        'This device appears to be jailbroken/rooted. The app cannot run on compromised devices.',
        [{ text: 'Exit', onPress: () => BackHandler.exitApp() }]
      );
      return;
    }

    // Check for debugging
    if (__DEV__) {
      console.warn('Running in development mode');
    }
  };

  const setupInactivityTimer = () => {
    let timeout: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Log out user after 15 minutes of inactivity
        logout();
      }, 15 * 60 * 1000);
    };

    // Listen for user activity
    const events = ['touchStart', 'scroll', 'keyPress'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();
  };

  const disableScreenshots = () => {
    if (Platform.OS === 'android') {
      // Android: Use native module to set FLAG_SECURE
      NativeModules.ScreenshotPrevent.forbid();
    } else if (Platform.OS === 'ios') {
      // iOS: Blur screen when app goes to background
      AppState.addEventListener('change', (state) => {
        if (state === 'background' || state === 'inactive') {
          // Show blur overlay
          setShowBlur(true);
        } else {
          setShowBlur(false);
        }
      });
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}
\`\`\`

## Secure Data Storage

\`\`\`typescript
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

class SecureStorage {
  // Store sensitive data
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    } catch (error) {
      console.error('Error storing secure item:', error);
      throw error;
    }
  }

  // Retrieve sensitive data
  async getSecureItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }

  // Delete sensitive data
  async deleteSecureItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  // Encrypt PHI before storage
  async encryptPHI(data: string, key: string): Promise<string> {
    const encrypted = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + key
    );
    return encrypted;
  }
}

// Usage
const storage = new SecureStorage();

// Store auth token
await storage.setSecureItem('auth_token', token);

// Store patient data (encrypted)
const patientData = JSON.stringify(patient);
const encrypted = await storage.encryptPHI(patientData, encryptionKey);
await storage.setSecureItem('patient_data', encrypted);
\`\`\`

## Biometric Authentication

\`\`\`typescript
import * as LocalAuthentication from 'expo-local-authentication';

class BiometricAuth {
  async isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  async authenticate(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access patient data',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false, // Allow PIN fallback
        biometricsSecurityLevel: 'strong', // Face ID, fingerprint only
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  async getSupportedTypes(): Promise<string[]> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Unknown';
      }
    });
  }
}

// Usage in login screen
const LoginScreen = () => {
  const biometric = new BiometricAuth();

  const handleLogin = async () => {
    const hasBiometric = await biometric.isBiometricAvailable();

    if (hasBiometric) {
      const authenticated = await biometric.authenticate();

      if (authenticated) {
        // Load saved credentials
        const token = await storage.getSecureItem('auth_token');
        // Proceed with login
      }
    } else {
      // Fall back to username/password
      showPasswordLogin();
    }
  };

  return (
    <View>
      <Button title="Login with Biometrics" onPress={handleLogin} />
    </View>
  );
};
\`\`\`

## Accessing Health Data (iOS/Android)

\`\`\`typescript
import AppleHealthKit, {
  HealthKitPermissions,
} from 'react-native-health';
import GoogleFit, { Scopes } from 'react-native-google-fit';

class HealthDataManager {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return this.requestAppleHealthPermissions();
    } else {
      return this.requestGoogleFitPermissions();
    }
  }

  private async requestAppleHealthPermissions(): Promise<boolean> {
    const permissions: HealthKitPermissions = {
      permissions: {
        read: [
          'Height',
          'Weight',
          'StepCount',
          'HeartRate',
          'BloodPressureSystolic',
          'BloodPressureDiastolic',
          'BloodGlucose',
        ],
        write: ['Weight', 'StepCount'],
      },
    };

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (error) => {
        resolve(!error);
      });
    });
  }

  private async requestGoogleFitPermissions(): Promise<boolean> {
    const options = {
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_BODY_READ,
        Scopes.FITNESS_LOCATION_READ,
      ],
    };

    try {
      await GoogleFit.authorize(options);
      return true;
    } catch (error) {
      console.error('Google Fit authorization error:', error);
      return false;
    }
  }

  async getSteps(startDate: Date, endDate: Date): Promise<number> {
    if (Platform.OS === 'ios') {
      return new Promise((resolve) => {
        AppleHealthKit.getStepCount(
          { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
          (error, results) => {
            resolve(results?.value || 0);
          }
        );
      });
    } else {
      const res = await GoogleFit.getDailyStepCountSamples({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return res[0]?.steps[0]?.value || 0;
    }
  }

  async getHeartRate(): Promise<number[]> {
    if (Platform.OS === 'ios') {
      return new Promise((resolve) => {
        AppleHealthKit.getHeartRateSamples(
          {
            startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            limit: 100,
          },
          (error, results) => {
            resolve(results?.map(r => r.value) || []);
          }
        );
      });
    } else {
      const res = await GoogleFit.getHeartRateSamples({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      return res.map(r => r.value);
    }
  }
}
\`\`\`

## Offline-First Architecture

\`\`\`typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineManager {
  private syncQueue: any[] = [];

  async saveOffline(key: string, data: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(data));

    // Add to sync queue
    this.syncQueue.push({
      key,
      data,
      timestamp: Date.now(),
    });
  }

  async syncWhenOnline(): Promise<void> {
    const state = await NetInfo.fetch();

    if (state.isConnected) {
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue.shift();

        try {
          // Sync to server
          await this.uploadToServer(item.data);

          // Remove from local storage
          await AsyncStorage.removeItem(item.key);
        } catch (error) {
          // Put back in queue if failed
          this.syncQueue.unshift(item);
          break;
        }
      }
    }
  }

  private async uploadToServer(data: any): Promise<void> {
    // Implement server upload
    await fetch('https://api.example.com/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  setupAutoSync(): void {
    // Listen for network changes
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.syncWhenOnline();
      }
    });
  }
}
\`\`\`

## Push Notifications for Healthcare

\`\`\`typescript
import * as Notifications from 'expo-notifications';

class HealthNotifications {
  async setupNotifications(): Promise<void> {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Notification permissions required for medication reminders');
      return;
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  async scheduleMedicationReminder(
    medicationName: string,
    times: Date[]
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const time of times) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medication Reminder',
          body: \`Time to take \${medicationName}\`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { medicationName },
        },
        trigger: {
          hour: time.getHours(),
          minute: time.getMinutes(),
          repeats: true,
        },
      });

      notificationIds.push(id);
    }

    return notificationIds;
  }

  async scheduleAppointmentReminder(
    appointmentDate: Date,
    providerName: string
  ): Promise<void> {
    // 24 hours before
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Appointment Tomorrow',
        body: \`You have an appointment with \${providerName}\`,
      },
      trigger: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000),
    });

    // 1 hour before
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Appointment Soon',
        body: \`Your appointment with \${providerName} is in 1 hour\`,
      },
      trigger: new Date(appointmentDate.getTime() - 60 * 60 * 1000),
    });
  }
}
\`\`\`

## Best Practices

1. **Security First** - Implement all HIPAA security controls
2. **Offline Support** - Healthcare apps must work without internet
3. **Performance** - Fast load times, smooth animations
4. **Accessibility** - WCAG 2.1 AA compliance minimum
5. **Battery Efficient** - Minimize background activity
6. **Data Minimization** - Only collect necessary PHI
7. **Audit Logging** - Log all PHI access
8. **Regular Updates** - Security patches, OS compatibility
9. **Error Handling** - Graceful failures, clear error messages
10. **User Testing** - Test with real healthcare providers/patients

## App Store Requirements

### iOS App Store
- Medical Device Classification (if applicable)
- Privacy Policy prominently displayed
- HIPAA compliance documentation
- Clear description of health data usage

### Google Play Store
- Medical Device compliance (if applicable)
- Data Safety section completed
- Privacy policy link
- Sensitive permissions justification`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
