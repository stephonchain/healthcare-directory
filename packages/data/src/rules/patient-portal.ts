export const patientPortalRules = [
  {
    tags: ["Patient Portal", "Healthcare", "Web", "React", "Next.js"],
    title: "Patient Portal Development",
    libs: ["next", "react", "supabase", "tailwindcss"],
    slug: "patient-portal-development",
    content: `You are a patient portal development expert helping build secure, user-friendly patient-facing healthcare applications.

## Patient Portal Core Features

1. **Medical Records Access** - View health history, test results
2. **Appointment Management** - Schedule, reschedule, cancel
3. **Messaging** - Secure communication with providers
4. **Prescription Refills** - Request medication refills
5. **Billing & Payments** - View statements, make payments
6. **Health Tracking** - Log vitals, symptoms
7. **Family Access** - Proxy access for dependents
8. **Educational Resources** - Condition-specific information

## Architecture (Next.js + Supabase)

\`\`\`typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types
export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  mrn: string; // Medical Record Number
  phone: string;
  email: string;
  address: any;
  insurance: any;
  emergency_contact: any;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string;
  appointment_time: string;
  type: 'in-person' | 'telehealth';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
}

export interface LabResult {
  id: string;
  patient_id: string;
  test_name: string;
  test_date: string;
  result_value: string;
  unit: string;
  reference_range: string;
  status: 'normal' | 'abnormal' | 'critical';
  ordering_provider: string;
  comments?: string;
}

export interface Message {
  id: string;
  patient_id: string;
  provider_id: string;
  subject: string;
  content: string;
  sent_at: string;
  read: boolean;
  sender_type: 'patient' | 'provider';
}
\`\`\`

## Authentication & Authorization

\`\`\`typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: \`\${window.location.origin}/auth/callback\`,
      },
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Log access for HIPAA audit
    await logAccess(data.user.id, 'login');

    return data;
  };

  const signOut = async () => {
    await logAccess(user?.id, 'logout');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: \`\${window.location.origin}/auth/reset-password\`,
    });

    if (error) throw error;
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}

async function logAccess(userId: string | undefined, action: string) {
  if (!userId) return;

  await supabase.from('audit_log').insert({
    user_id: userId,
    action,
    timestamp: new Date().toISOString(),
    ip_address: await fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => d.ip),
  });
}
\`\`\`

## Medical Records View

\`\`\`typescript
// pages/medical-records.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { LabResult } from '@/lib/supabase';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'abnormal'>('all');

  useEffect(() => {
    if (user) {
      fetchLabResults();
    }
  }, [user, filter]);

  async function fetchLabResults() {
    setLoading(true);

    let query = supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', user?.id)
      .order('test_date', { ascending: false });

    if (filter === 'abnormal') {
      query = query.in('status', ['abnormal', 'critical']);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lab results:', error);
    } else {
      setLabResults(data || []);

      // Audit log: PHI access
      await supabase.from('audit_log').insert({
        user_id: user?.id,
        action: 'view_lab_results',
        resource_type: 'lab_results',
        resource_count: data?.length || 0,
        timestamp: new Date().toISOString(),
      });
    }

    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>

      <div className="mb-4">
        <button
          onClick={() => setFilter('all')}
          className={\`px-4 py-2 mr-2 \${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }\`}
        >
          All Results
        </button>
        <button
          onClick={() => setFilter('abnormal')}
          className={\`px-4 py-2 \${
            filter === 'abnormal' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }\`}
        >
          Abnormal Only
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {labResults.map((result) => (
            <LabResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}

function LabResultCard({ result }: { result: LabResult }) {
  const statusColors = {
    normal: 'bg-green-100 text-green-800',
    abnormal: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{result.test_name}</h3>
          <p className="text-gray-600 text-sm">
            {new Date(result.test_date).toLocaleDateString()}
          </p>
        </div>
        <span
          className={\`px-3 py-1 rounded-full text-sm font-medium \${
            statusColors[result.status]
          }\`}
        >
          {result.status.toUpperCase()}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Result</p>
          <p className="font-semibold">
            {result.result_value} {result.unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Reference Range</p>
          <p className="font-semibold">{result.reference_range}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Ordered By</p>
          <p className="font-semibold">{result.ordering_provider}</p>
        </div>
      </div>

      {result.comments && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">{result.comments}</p>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Appointment Scheduling

\`\`\`typescript
// components/AppointmentScheduler.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function AppointmentScheduler() {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'telehealth'>('in-person');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  async function fetchAvailableSlots(providerId: string, date: string) {
    // Get provider's schedule
    const { data: schedule } = await supabase
      .from('provider_schedule')
      .select('*')
      .eq('provider_id', providerId)
      .eq('date', date)
      .single();

    // Get existing appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('provider_id', providerId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');

    const bookedTimes = appointments?.map(a => a.appointment_time) || [];

    // Generate available slots (30-min intervals)
    const slots: string[] = [];
    const start = new Date(\`\${date}T\${schedule?.start_time}\`);
    const end = new Date(\`\${date}T\${schedule?.end_time}\`);

    while (start < end) {
      const timeString = start.toTimeString().slice(0, 5);
      if (!bookedTimes.includes(timeString)) {
        slots.push(timeString);
      }
      start.setMinutes(start.getMinutes() + 30);
    }

    setAvailableSlots(slots);
  }

  async function scheduleAppointment() {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user?.id,
        provider_id: selectedProvider,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        type: appointmentType,
        status: 'scheduled',
        reason,
      })
      .select()
      .single();

    if (error) {
      alert('Error scheduling appointment: ' + error.message);
    } else {
      // Send confirmation email
      await sendAppointmentConfirmation(data);

      alert('Appointment scheduled successfully!');
    }
  }

  async function sendAppointmentConfirmation(appointment: any) {
    // Integrate with email service (SendGrid, etc.)
    await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user?.email,
        appointment,
      }),
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Schedule Appointment</h2>

      <div className="space-y-4">
        {/* Provider selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Provider
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a provider...</option>
            {/* Populate from database */}
          </select>
        </div>

        {/* Appointment type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Appointment Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="in-person"
                checked={appointmentType === 'in-person'}
                onChange={(e) => setAppointmentType(e.target.value as any)}
                className="mr-2"
              />
              In-Person
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="telehealth"
                checked={appointmentType === 'telehealth'}
                onChange={(e) => setAppointmentType(e.target.value as any)}
                className="mr-2"
              />
              Telehealth
            </label>
          </div>
        </div>

        {/* Date selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (selectedProvider) {
                fetchAvailableSlots(selectedProvider, e.target.value);
              }
            }}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Time selection */}
        {availableSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={\`p-2 border rounded \${
                    selectedTime === slot
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-gray-50'
                  }\`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Reason for Visit
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Briefly describe the reason for your visit..."
          />
        </div>

        <button
          onClick={scheduleAppointment}
          disabled={!selectedProvider || !selectedDate || !selectedTime || !reason}
          className="w-full bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          Schedule Appointment
        </button>
      </div>
    </div>
  );
}
\`\`\`

## Secure Messaging

\`\`\`typescript
// pages/messages.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/lib/supabase';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: \`patient_id=eq.\${user?.id}\`,
        },
        (payload) => {
          setMessages((prev) => [payload.new as Message, ...prev]);

          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('New Message', {
              body: 'You have a new message from your provider',
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select(\`
        *,
        provider:providers(first_name, last_name, specialty)
      \`)
      .eq('patient_id', user?.id)
      .order('sent_at', { ascending: false });

    setMessages(data || []);
  }

  async function sendReply() {
    if (!selectedMessage || !replyText.trim()) return;

    const { error } = await supabase.from('messages').insert({
      patient_id: user?.id,
      provider_id: selectedMessage.provider_id,
      subject: \`RE: \${selectedMessage.subject}\`,
      content: replyText,
      sender_type: 'patient',
    });

    if (!error) {
      setReplyText('');
      fetchMessages();
    }
  }

  async function markAsRead(messageId: string) {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
  }

  return (
    <div className="flex h-screen">
      {/* Message list */}
      <div className="w-1/3 border-r overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => {
              setSelectedMessage(msg);
              if (!msg.read) markAsRead(msg.id);
            }}
            className={\`p-4 border-b cursor-pointer hover:bg-gray-50 \${
              !msg.read ? 'bg-blue-50' : ''
            }\`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{msg.subject}</p>
                <p className="text-sm text-gray-600">
                  {msg.sender_type === 'provider' ? 'From' : 'To'}: Provider
                </p>
              </div>
              {!msg.read && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  New
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(msg.sent_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Message detail */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
              <p className="text-gray-600 text-sm mt-1">
                {new Date(selectedMessage.sent_at).toLocaleString()}
              </p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>

            <div className="p-6 border-t">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="w-full p-3 border rounded"
                rows={4}
              />
              <button
                onClick={sendReply}
                className="mt-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Send Reply
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a message to view
          </div>
        )}
      </div>
    </div>
  );
}
\`\`\`

## Best Practices

1. **Security** - Encrypt all PHI, use HTTPS, implement MFA
2. **Accessibility** - WCAG 2.1 AA compliance for all users
3. **Mobile-first** - Most patients access portals via mobile
4. **Clear Communication** - Use plain language, avoid medical jargon
5. **Privacy** - Clear privacy policy, consent management
6. **Audit Logging** - Log all PHI access for HIPAA compliance
7. **Performance** - Fast load times, optimize images
8. **Notifications** - Email/SMS for appointments, test results
9. **Help & Support** - Easy access to help, FAQs
10. **Integration** - Sync with EHR systems`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
