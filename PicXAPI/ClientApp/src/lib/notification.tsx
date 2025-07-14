import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';

const API_BASE = '';

export function createNotificationConnection(token: string): HubConnection {
    const connection = new HubConnectionBuilder()
        .withUrl(`${API_BASE}/notificationHub`, {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();
    return connection;
}
