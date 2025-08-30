'use client';
// app/lib/websocketActions.ts

import { Socket } from 'socket.io-client';

// توابع emit برای WebSocket
export function subscribeToLogs(socket: Socket) {
 socket.emit('subscribe-logs');
}

export function subscribeToStatus(socket: Socket) {
 socket.emit('subscribe-status');
}

export function subscribeToTokens(socket: Socket) {
 socket.emit('subscribe-tokens');
}

export function pingServer(socket: Socket) {
 socket.emit('ping');
}