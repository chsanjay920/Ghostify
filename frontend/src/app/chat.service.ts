import { Injectable, NgZone, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';

export interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

export interface RoomInfo {
  code: string;
  name: string;
  participants: Array<{ userName: string }>;
  messages: ChatMessage[];
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  currentUserName = signal('');
  roomData = signal<RoomInfo | null>(null);
  messages = signal<ChatMessage[]>([]);
  errorMessage = signal<string | null>(null);
  connected = signal(false);

  constructor(private zone: NgZone) {
    // Determine backend URL:
    // - Prefer explicit environment.backendUrl when set and not pointing at localhost in production
    // - If running on a non-localhost host and the env URL points to localhost, fall back to current origin
    let backendUrl = environment.backendUrl || '';
    try {
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        const isLocalHost = host === 'localhost' || host === '127.0.0.1';
        const envIsLocal = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');

        if (!isLocalHost && envIsLocal) {
          // Deployed frontend should connect to same origin by default
          backendUrl = `${window.location.protocol}//${window.location.host}`;
        }
      }
    } catch (e) {
      // ignore and use backendUrl from environment
    }

    this.socket = io(backendUrl, {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      this.zone.run(() => this.connected.set(true));
    });

    this.socket.on('disconnect', () => {
      this.zone.run(() => this.connected.set(false));
    });

    this.socket.on('room-data', (room: RoomInfo) => {
      this.zone.run(() => {
        this.roomData.set(room);
        this.messages.set(room.messages || []);
        this.errorMessage.set(null);
      });
    });

    this.socket.on('new-message', (message: ChatMessage) => {
      this.zone.run(() => {
        this.messages.update((list) => [...list, message]);
      });
    });

    this.socket.on('room-error', (message: string) => {
      this.zone.run(() => {
        this.errorMessage.set(message);
      });
    });
  }

  private setRoomState(room: RoomInfo, userName: string) {
    this.currentUserName.set(userName);
    this.roomData.set(room);
    this.messages.set(room.messages || []);
    this.errorMessage.set(null);
  }

  clearError() {
    this.errorMessage.set(null);
  }

  createRoom(userName: string, roomName: string, callback?: (room: RoomInfo) => void) {
    this.clearError();
    this.socket.emit(
      'create-room',
      { userName, roomName },
      (response: { error?: string; room?: RoomInfo }) => {
        this.zone.run(() => {
          if (response.error) {
            this.errorMessage.set(response.error);
            return;
          }

          if (response.room) {
            this.setRoomState(response.room, userName);
            callback?.(response.room);
          }
        });
      }
    );
  }

  joinRoom(userName: string, roomCode: string, callback?: (room: RoomInfo) => void) {
    this.clearError();
    this.socket.emit(
      'join-room',
      { userName, roomCode },
      (response: { error?: string; room?: RoomInfo }) => {
        this.zone.run(() => {
          if (response.error) {
            this.errorMessage.set(response.error);
            return;
          }

          if (response.room) {
            this.setRoomState(response.room, userName);
            callback?.(response.room);
          }
        });
      }
    );
  }

  sendMessage(text: string, callback?: (success: boolean) => void) {
    const room = this.roomData();
    if (!room) {
      this.errorMessage.set('No room is selected.');
      callback?.(false);
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      callback?.(false);
      return;
    }

    this.socket.emit(
      'send-message',
      { roomCode: room.code, text: trimmed },
      (response: { error?: string }) => {
        this.zone.run(() => {
          if (response?.error) {
            this.errorMessage.set(response.error);
            callback?.(false);
            return;
          }

          callback?.(true);
        });
      }
    );
  }

  leaveRoom(callback?: () => void) {
    const room = this.roomData();
    if (!room) {
      callback?.();
      return;
    }

    this.socket.emit('leave-room', { roomCode: room.code }, () => {
      this.roomData.set(null);
      this.messages.set([]);
      this.currentUserName.set('');
      this.errorMessage.set(null);
      callback?.();
    });
  }
}
