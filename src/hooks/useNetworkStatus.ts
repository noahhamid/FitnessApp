/**
 * Wire to @react-native-community/netinfo when you add it.
 */
export function useNetworkStatus() {
  return { isConnected: true as boolean | null, isInternetReachable: true as boolean | null };
}
