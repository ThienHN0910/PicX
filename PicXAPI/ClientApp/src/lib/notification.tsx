import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function createNotificationConnection(token: string): HubConnection {
    const connection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/notificationHub`, {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();
    return connection;
}
