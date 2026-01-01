export const telemedicineRules = [
  {
    tags: ["Telemedicine", "WebRTC", "Healthcare", "Video"],
    title: "Telemedicine Platform Development",
    libs: ["webrtc", "socket.io", "twilio-video", "daily-js"],
    slug: "telemedicine-development",
    content: `You are a telemedicine platform expert helping build HIPAA-compliant video consultation systems.

## Telemedicine Platform Requirements

### Core Features
1. **Video Conferencing**: High-quality, low-latency video/audio
2. **Screen Sharing**: Share medical images, reports
3. **Chat**: Text messaging during consultation
4. **Recording**: Session recording for medical records
5. **Waiting Room**: Virtual waiting area
6. **E-Prescribing**: Digital prescription generation
7. **Payment Integration**: Billing and insurance claims

### Compliance Requirements
- HIPAA compliance for all PHI
- End-to-end encryption for video/audio
- Secure authentication and authorization
- Audit logging of all sessions
- Data retention policies
- Business Associate Agreements with vendors

## WebRTC Implementation (React + Socket.io)

\`\`\`typescript
// useVideoCall.ts
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface VideoCallHook {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

export function useVideoCall(roomId: string): VideoCallHook {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io('https://your-signaling-server.com', {
      auth: { token: getAuthToken() }
    });

    socket.current.on('offer', handleOffer);
    socket.current.on('answer', handleAnswer);
    socket.current.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.current?.disconnect();
      endCall();
    };
  }, []);

  const startCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);

      // Create peer connection
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
            urls: 'turn:your-turn-server.com:3478',
            username: 'username',
            credential: 'password'
          }
        ]
      });

      // Add local tracks
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current?.emit('ice-candidate', {
            roomId,
            candidate: event.candidate
          });
        }
      };

      // Create and send offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.current?.emit('offer', {
        roomId,
        offer: peerConnection.current.localDescription
      });

    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  };

  const handleOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
    if (!peerConnection.current) return;

    await peerConnection.current.setRemoteDescription(data.offer);
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.current?.emit('answer', {
      roomId,
      answer: peerConnection.current.localDescription
    });
  };

  const handleAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
    if (!peerConnection.current) return;
    await peerConnection.current.setRemoteDescription(data.answer);
  };

  const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
    if (!peerConnection.current) return;
    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
  };

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    setLocalStream(null);
    setRemoteStream(null);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
  };

  const toggleAudio = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
  };

  return {
    localStream,
    remoteStream,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio
  };
}
\`\`\`

## Video Call Component

\`\`\`typescript
// VideoCall.tsx
import React, { useRef, useEffect } from 'react';
import { useVideoCall } from './useVideoCall';

interface VideoCallProps {
  appointmentId: string;
  patientId: string;
  providerId: string;
}

export function VideoCall({ appointmentId, patientId, providerId }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
    localStream,
    remoteStream,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio
  } = useVideoCall(appointmentId);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="video-call-container">
      <div className="video-grid">
        <div className="remote-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="local-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="controls">
        <button onClick={toggleVideo} className="control-btn">
          Toggle Video
        </button>
        <button onClick={toggleAudio} className="control-btn">
          Toggle Audio
        </button>
        <button onClick={startCall} className="control-btn start">
          Start Call
        </button>
        <button onClick={endCall} className="control-btn end">
          End Call
        </button>
      </div>
    </div>
  );
}
\`\`\`

## Backend Signaling Server (Node.js)

\`\`\`typescript
// server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.data.user.id);

  socket.on('join-room', async (roomId: string) => {
    // Verify user has access to this room
    const hasAccess = await verifyRoomAccess(socket.data.user.id, roomId);
    if (!hasAccess) {
      socket.emit('error', 'Unauthorized access to room');
      return;
    }

    socket.join(roomId);

    // Log session start for HIPAA compliance
    await auditLog({
      userId: socket.data.user.id,
      action: 'JOIN_TELEHEALTH_SESSION',
      roomId,
      timestamp: new Date(),
      ipAddress: socket.handshake.address
    });

    socket.to(roomId).emit('user-connected', socket.data.user.id);
  });

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer });
  });

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  socket.on('disconnect', async () => {
    await auditLog({
      userId: socket.data.user.id,
      action: 'LEAVE_TELEHEALTH_SESSION',
      timestamp: new Date()
    });
  });
});

httpServer.listen(3000, () => {
  console.log('Signaling server running on port 3000');
});
\`\`\`

## Using Twilio Video (Managed Service)

\`\`\`typescript
import Twilio from 'twilio-video';

export async function connectToRoom(roomName: string, token: string) {
  try {
    const room = await Twilio.connect(token, {
      name: roomName,
      audio: true,
      video: { width: 1280, height: 720 }
    });

    console.log(\`Connected to Room: \${room.name}\`);

    // Handle participants
    room.participants.forEach(participantConnected);
    room.on('participantConnected', participantConnected);
    room.on('participantDisconnected', participantDisconnected);

    return room;
  } catch (error) {
    console.error('Unable to connect to Room:', error);
    throw error;
  }
}

function participantConnected(participant: Twilio.Participant) {
  console.log(\`Participant "\${participant.identity}" connected\`);

  participant.tracks.forEach(publication => {
    if (publication.isSubscribed) {
      const track = publication.track;
      document.getElementById('remote-media')?.appendChild(track.attach());
    }
  });

  participant.on('trackSubscribed', track => {
    document.getElementById('remote-media')?.appendChild(track.attach());
  });
}

function participantDisconnected(participant: Twilio.Participant) {
  console.log(\`Participant "\${participant.identity}" disconnected\`);
}
\`\`\`

## Security Best Practices

### Encryption
- Use DTLS-SRTP for WebRTC encryption
- TLS 1.3 for signaling
- End-to-end encryption for sensitive data

### Authentication
- JWT tokens with short expiration
- Multi-factor authentication
- Role-based access control

### Network Security
- Use TURN servers over TLS
- Implement rate limiting
- DDoS protection

### Recording & Storage
- Encrypt recordings at rest
- Secure cloud storage (AWS S3 with encryption)
- Retention policies per HIPAA requirements
- Access controls for recordings

## Performance Optimization

\`\`\`typescript
// Adaptive bitrate
const sender = peerConnection
  .getSenders()
  .find(s => s.track?.kind === 'video');

if (sender) {
  const parameters = sender.getParameters();
  parameters.encodings[0].maxBitrate = 500000; // 500 kbps
  await sender.setParameters(parameters);
}

// Network quality monitoring
peerConnection.getStats().then(stats => {
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
      console.log('Packets lost:', report.packetsLost);
      console.log('Jitter:', report.jitter);
    }
  });
});
\`\`\`

## Checklist
- [ ] HIPAA-compliant infrastructure
- [ ] End-to-end encryption enabled
- [ ] BAA signed with video service provider
- [ ] Audit logging implemented
- [ ] Session recording with consent
- [ ] Network quality monitoring
- [ ] Fallback for poor connections
- [ ] Screen sharing capability
- [ ] Chat functionality
- [ ] Virtual waiting room
- [ ] Emergency disconnect handling`,
    author: {
      name: "Healthcare Directory",
      url: "https://github.com/stephonchain/healthcare-directory",
      avatar: ""
    }
  }
];
