# Ghostify

A minimal real-time group chat application built with Angular, Node.js, Express, and Socket.IO.

## Features

- Home page with `Create Chat Room` and `Join Chat Room`
- Create room with a generated room code
- Join room using room code and display "Room not found" on invalid codes
- Real-time chat with Socket.IO
- In-memory room and message storage
- Responsive, clean UI with plain CSS
- Simple room sharing via copy and share buttons

## Tech Stack

- Frontend: Angular
- Backend: Node.js + Express
- Real-time: Socket.IO
- Data: In-memory storage (no database required)

## Repository Structure

- `backend/` - Node.js server with Socket.IO
- `frontend/` - Angular app and UI
- `README.md` - Project documentation
- `.gitignore` - Ignored files for Git

## Installation

Install dependencies for both backend and frontend.

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running the app

Start the backend server:

```bash
cd backend
npm start
```

Start the Angular frontend:

```bash
cd frontend
npm start
```

Then open the app in your browser:

```text
http://localhost:4200
```

## Usage

- Use `Create Chat Room` to generate a new room code and start chatting immediately.
- Use `Join Chat Room` to enter an existing room code and join the conversation.
- Copy or share the room code/link directly from the chat room header.

## Environment

- Backend: create a `.env` file in the `backend/` folder to configure runtime values. Example:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:4200
```

- Frontend: environment files are under `frontend/src/environments/`. Update `backendUrl` if the backend runs on a different host or port.

## Notes

- All rooms, participants, and messages are stored in memory.
- Server restart will reset all chat rooms and message history.
- No authentication, profiles, or persistent database are included.
