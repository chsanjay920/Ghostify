import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page shell">
      <div class="card page-card">
        <h1>Simple Chat</h1>
        <p>Start a room or join an existing room for real-time group chat.</p>

        <div class="button-group">
          <a routerLink="/create" class="button primary">Create Chat Room</a>
          <a routerLink="/join" class="button secondary">Join Chat Room</a>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {}
