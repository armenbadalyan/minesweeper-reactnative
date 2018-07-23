import { NetInfo } from 'react-native';

export function connectivityAvailable() {
    return NetInfo.isConnected.fetch();
}