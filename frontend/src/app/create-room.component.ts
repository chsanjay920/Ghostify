import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page shell">
      <div class="card form-card">
        <h2>Create Room</h2>

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
            Room Name (optional)
            <input
              name="roomName"
              [(ngModel)]="roomName"
              placeholder="Optional room name"
            />
          </label>

          <button class="button primary" type="submit" [disabled]="!userName.trim()">
            Create Room
          </button>

          <div *ngIf="chat.errorMessage()" class="error-message">
            {{ chat.errorMessage() }}
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateRoomComponent {
  userName = '';
  roomName = '';

  constructor(public chat: ChatService, private router: Router) {}

  submit() {
    const name = this.userName.trim();
    if (!name) {
      return;
    }

    this.chat.createRoom(name, this.roomName.trim(), (room) => {
      this.router.navigate(['chat', room.code]);
    });
  }
}
