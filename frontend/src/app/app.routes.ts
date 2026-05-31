import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { CreateRoomComponent } from './create-room.component';
import { JoinRoomComponent } from './join-room.component';
import { ChatRoomComponent } from './chat-room.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'create',
    component: CreateRoomComponent
  },
  {
    path: 'join',
    component: JoinRoomComponent
  },
  {
    path: 'chat/:code',
    component: ChatRoomComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
