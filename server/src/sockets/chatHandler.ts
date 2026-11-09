import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(server: any): SocketIOServer {
  ioInstance = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  ioInstance.on('connection', (socket: Socket) => {
    // Join a career room
    socket.on('join_career_room', (roomId: string) => {
      socket.join(`room_${roomId}`);
    });

    socket.on('leave_career_room', (roomId: string) => {
      socket.leave(`room_${roomId}`);
    });

    // Join Student Connect feed
    socket.on('join_student_connect', () => {
      socket.join('student_connect_channel');
    });

    socket.on('leave_student_connect', () => {
      socket.leave('student_connect_channel');
    });

    // Join Student Issue private room
    socket.on('join_issue_room', (issueId: string) => {
      socket.join(`issue_${issueId}`);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}
