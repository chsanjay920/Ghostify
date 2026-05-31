import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page shell">
      <div class="card form-card">
        <h2>Join Room</h2>

        <form (ngSubmit)="submit()">
          <label>
            Your Name
            <input
              name="userName"
              [(ngModel)]="userName"
              required
              placeholder="Enter your name"
            />
          </label>

          <label>
            Room Code
            <input
              name="roomCode"
              [(ngModel)]="roomCode"
              required
              placeholder="Enter room code"
            />
          </label>

          <button class="button primary" type="submit" [disabled]="!userName.trim() || !roomCode.trim()">
            Join Room
          </button>

          <div *ngIf="chat.errorMessage()" class="error-message">
            {{ chat.errorMessage() }}
          </div>
        </form>
      </div>
    </div>
  `
})
export class JoinRoomComponent {
  userName = '';
  roomCode = '';

  constructor(public chat: ChatService, private router: Router) {}

  submit() {
    const name = this.userName.trim();
    const code = this.roomCode.trim().toUpperCase();
    if (!name || !code) {
      return;
    }

    this.chat.joinRoom(name, code, (room) => {
      this.router.navigate(['chat', room.code]);
    });
  }
}
