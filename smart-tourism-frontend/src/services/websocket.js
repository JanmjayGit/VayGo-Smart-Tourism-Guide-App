import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

class WebSocketService {
    constructor() {
        this.client = null;
        this.subscriptions = [];
        this.connected = false;
    }

    connect(userId, onNotification) {
        if (this.connected) return;

        try {
            const socket = new SockJS(`${BASE_URL}/ws`);
            this.client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,
                onConnect: () => {
                    console.log('WebSocket connected');
                    this.connected = true;
                    this.subscribe(userId, onNotification);
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame.headers?.message);
                    this.connected = false;
                },
                onDisconnect: () => {
                    console.log('WebSocket disconnected');
                    this.connected = false;
                },
            });

            this.client.activate();
        } catch (err) {
            console.error('WebSocket connection failed:', err);
        }
    }

    subscribe(userId, callback) {
        if (!this.client || !this.connected) return;

        try {
            const subscription = this.client.subscribe(
                `/user/${userId}/notifications`,
                (message) => {
                    try {
                        const notification = JSON.parse(message.body);
                        callback(notification);
                    } catch (e) {
                        console.error('Failed to parse notification:', e);
                    }
                }
            );
            this.subscriptions.push(subscription);
        } catch (err) {
            console.error('WebSocket subscribe failed:', err);
        }
    }

    disconnect() {
        this.subscriptions.forEach((sub) => {
            try { sub.unsubscribe(); } catch (e) { /* ignore */ }
        });
        this.subscriptions = [];
        if (this.client) {
            try { this.client.deactivate(); } catch (e) { /* ignore */ }
        }
        this.connected = false;
    }

    isConnected() {
        return this.connected;
    }
}

export default new WebSocketService();
