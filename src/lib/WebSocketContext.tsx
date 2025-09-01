// app/lib/WebSocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { LogEntry } from './types/logs';
import { ServerStatus } from './types/dashboard';
import { Token } from './types/token';

interface WebSocketData {
    logs: LogEntry[];
    serverStatus: ServerStatus | null;
    activeTokens: Token[];
}

interface WebSocketContextType {
    data: WebSocketData;
    socket: Socket | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<WebSocketData>({
        logs: [],
        serverStatus: null,
        activeTokens: [],
    });
    const [socket, setSocket] = useState<Socket | null>(null);
    useEffect(() => {
        // اتصال به WebSocket با namespace /trading
        const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelayMax: 10000,
        });
        setSocket(socket)
        socketInstance.on('connect', () => {
            console.log('Connected to WebSocket server');
            // درخواست داده‌های اولیه
            socketInstance.emit('subscribe-logs');
            socketInstance.emit('subscribe-status');
            socketInstance.emit('subscribe-tokens');
        });

        // گوش دادن به eventهای logs
        socketInstance.on('logs', (newLogs: LogEntry[]) => {
            setData((prev) => ({ ...prev, logs:newLogs }));
        });

        // گوش دادن به eventهای server-status
        socketInstance.on('server-status', (serverStatus) => {
            setData((prev) => ({ ...prev, serverStatus }));
        });

        // گوش دادن به eventهای active-tokens
        socketInstance.on('active-tokens', (activeTokens) => {
            
            setData((prev) => ({ ...prev, activeTokens }));
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        // cleanup موقع unmount
        return () => {
            socketInstance.disconnect();
            setSocket(null);
            console.log('Disconnected from WebSocket');
        };
    }, [socket]);

    return (
        <WebSocketContext.Provider value={{ data, socket }}>
            {children}
        </WebSocketContext.Provider>
    );
}

// هوک برای دسترسی به Context
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}