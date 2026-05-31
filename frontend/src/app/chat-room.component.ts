import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page shell chat-page">
      <div class="card chat-card" *ngIf="chat.roomData(); else emptyState">
        <div class="chat-header">
          <div>
            <p class="room-label">Room</p>
            <h2>{{ chat.roomData()?.name }}</h2>
            <div class="room-info-row">
              <span class="room-code">Code: {{ chat.roomData()?.code }}</span>
              <button class="button secondary tiny" type="button" (click)="copyRoomCode()">
                Copy Code
              </button>
              <button class="button secondary tiny" type="button" (click)="shareRoomLink()">
                Share
              </button>
            </div>
            <div *ngIf="copyStatus" class="copy-status">{{ copyStatus }}</div>
          </div>
          <button class="button secondary small" type="button" (click)="leaveRoom()">
            Leave Room
          </button>
        </div>

        <div class="chat-body">
          <section class="participants card small-card">
            <h3>Participants</h3>
            <ul>
              <li *ngFor="let participant of chat.roomData()?.participants">
                {{ participant.userName }}
              </li>
            </ul>
          </section>

          <section class="messages card message-panel">
            <div #messageList class="message-list">
              <ng-container *ngFor="let message of chat.messages()">
                <div
                  class="message-row"
                  [class.mine]="isMine(message)"
                  [class.system]="isSystem(message)"
                >
                  <div *ngIf="isSystem(message)" class="system-message">
                    {{ message.text }}
                  </div>

                  <div *ngIf="!isSystem(message)" class="message-bubble">
                    <span class="message-sender">{{ message.sender }}</span>
                    <p>{{ message.text }}</p>
                    <span class="message-time">{{ message.time | date:'shortTime' }}</span>
                  </div>
                </div>
              </ng-container>
            </div>

            <form class="message-form" (ngSubmit)="send()">
              <input
                type="text"
                name="message"
                [(ngModel)]="messageText"
                placeholder="Type a message"
                autocomplete="off"
              />
              <button class="button primary" type="submit">Send</button>
            </form>
          </section>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="card page-card">
          <h2>Room not ready</h2>
          <p>Please create a room or join a room first.</p>
          <button class="button primary" type="button" (click)="goHome()">Go Home</button>
        </div>
      </ng-template>
    </div>
  `
})
export class ChatRoomComponent implements AfterViewChecked {
  @ViewChild('messageList') messageList!: ElementRef<HTMLElement>;
  messageText = '';
  copyStatus = '';

  constructor(public chat: ChatService, private router: Router) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  send() {
    const messageText = this.messageText.trim();
    if (!messageText) {
      return;
    }

    const pending = this.messageText;
    this.messageText = '';

    this.chat.sendMessage(messageText, (success) => {
      if (!success) {
        this.messageText = pending;
      }
    });
  }

  leaveRoom() {
    this.chat.leaveRoom(() => {
      this.router.navigate(['/']);
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  async copyRoomCode() {
    const room = this.chat.roomData();
    if (!room) {
      return;
    }

    try {
      await navigator.clipboard.writeText(room.code);
      this.copyStatus = 'Room code copied!';
    } catch {
      this.copyStatus = 'Unable to copy room code.';
    }

    this.clearCopyStatus();
  }

  async shareRoomLink() {
    const room = this.chat.roomData();
    if (!room) {
      return;
    }

    const shareUrl = window.location.href;
    const shareText = `Join my chat room (${room.name}) with code ${room.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: room.name,
          text: shareText,
          url: shareUrl
        });
        this.copyStatus = 'Share dialog opened.';
      } catch {
        this.copyStatus = 'Share canceled.';
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        this.copyStatus = 'Room link copied!';
      } catch {
        this.copyStatus = 'Unable to copy link.';
      }
    }

    this.clearCopyStatus();
  }

  clearCopyStatus() {
    setTimeout(() => {
      this.copyStatus = '';
    }, 2000);
  }

  isSystem(message: { sender: string }) {
    return message.sender === 'System';
  }

  isMine(message: { sender: string }) {
    return !this.isSystem(message) && message.sender === this.chat.currentUserName();
  }

  private scrollToBottom() {
    if (!this.messageList) {
      return;
    }

    const element = this.messageList.nativeElement;
    element.scrollTop = element.scrollHeight;
  }
}
