import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SystemInfo, LogMessage } from '../types';

interface DiagnosticsScreenProps {
  systemInfo: SystemInfo;
  onConnectionChange?: (newIP: string) => void;
}

export const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = ({
  systemInfo,
  onConnectionChange,
}) => {
  const [newIP, setNewIP] = useState('');
  const [showIPInput, setShowIPInput] = useState(false);

  const validateIP = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleConnectionChange = () => {
    if (validateIP(newIP)) {
      onConnectionChange?.(newIP);
      setShowIPInput(false);
      setNewIP('');
    } else {
      Alert.alert('Invalid IP Address', 'Please enter a valid IP address format');
    }
  };

  const getStatusColor = (status: 'Active' | 'Inactive'): string => {
    return status === 'Active' ? '#00FF00' : '#FF3B30';
  };

  const getFPSColor = (fps: number): string => {
    if (fps >= 25) return '#00FF00';
    if (fps >= 15) return '#FFFF00';
    return '#FF3B30';
  };

  const renderLogItem = (log: LogMessage, index: number) => {
    const logColor = log.type === 'error' ? '#FF3B30' : 
                    log.type === 'warning' ? '#FFFF00' : '#00FFFF';
    
    return (
      <View key={index} style={styles.logItem}>
        <View style={styles.logHeader}>
          <Text style={[styles.logType, { color: logColor }]}>
            {log.type.toUpperCase()}
          </Text>
          <Text style={styles.logTimestamp}>{log.timestamp}</Text>
        </View>
        <Text style={styles.logMessage}>{log.message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Diagnostics</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Connection Status */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="wifi" size={20} color="#FFFFFF" />
            <Text style={styles.cardTitle}>Connection Status</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(systemInfo.connectionStatus) }]}>
              {systemInfo.connectionStatus === 'Active' ? '🟢 Connected' : '🔴 Disconnected'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Publisher IP:</Text>
            <Text style={styles.statusValue}>{systemInfo.connectedIP || 'N/A'}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.changeConnectionButton}
            onPress={() => setShowIPInput(!showIPInput)}
          >
            <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
            <Text style={styles.changeConnectionText}>Change Connection</Text>
          </TouchableOpacity>
          
          {showIPInput && (
            <View style={styles.ipInputContainer}>
              <TextInput
                style={styles.ipInput}
                placeholder="Enter new IP address"
                placeholderTextColor="#666"
                value={newIP}
                onChangeText={setNewIP}
                keyboardType="numeric"
              />
              <View style={styles.ipButtonsContainer}>
                <TouchableOpacity
                  style={[styles.ipButton, styles.cancelButton]}
                  onPress={() => {
                    setShowIPInput(false);
                    setNewIP('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ipButton, styles.connectButton]}
                  onPress={handleConnectionChange}
                >
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Performance Metrics */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer" size={20} color="#FFFFFF" />
            <Text style={styles.cardTitle}>Performance</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Frame Rate:</Text>
            <Text style={[styles.statusValue, { color: getFPSColor(systemInfo.fps) }]}>
              {systemInfo.fps.toFixed(1)} FPS
            </Text>
          </View>
          
          <View style={styles.fpsIndicator}>
            <View style={styles.fpsBarBackground}>
              <View 
                style={[
                  styles.fpsBar, 
                  { 
                    width: `${Math.min((systemInfo.fps / 30) * 100, 100)}%`,
                    backgroundColor: getFPSColor(systemInfo.fps)
                  }
                ]} 
              />
            </View>
          </View>
          
          <Text style={styles.fpsDescription}>
            Target: 30 FPS | Good: ≥25 FPS | Fair: 15-24 FPS | Poor: &lt;15 FPS
          </Text>
        </View>

        {/* System Logs */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color="#FFFFFF" />
            <Text style={styles.cardTitle}>System Logs</Text>
            <Text style={styles.logsCount}>({systemInfo.logs.length})</Text>
          </View>
          
          <ScrollView style={styles.logsContainer} nestedScrollEnabled>
            {systemInfo.logs.length > 0 ? (
              systemInfo.logs.slice(-10).reverse().map(renderLogItem)
            ) : (
              <View style={styles.noLogsContainer}>
                <Text style={styles.noLogsText}>No log entries available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  logsCount: {
    fontSize: 12,
    color: '#AAA',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#AAA',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
  },
  changeConnectionButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  changeConnectionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  ipInputContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 6,
  },
  ipInput: {
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  ipButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ipButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  connectButton: {
    backgroundColor: '#00FF00',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  connectButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  fpsIndicator: {
    marginTop: 8,
    marginBottom: 12,
  },
  fpsBarBackground: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fpsBar: {
    height: '100%',
    borderRadius: 3,
  },
  fpsDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  logsContainer: {
    maxHeight: 200,
  },
  logItem: {
    backgroundColor: '#222',
    borderRadius: 4,
    padding: 10,
    marginBottom: 6,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logType: {
    fontSize: 10,
    fontWeight: '600',
  },
  logTimestamp: {
    fontSize: 10,
    color: '#666',
  },
  logMessage: {
    fontSize: 12,
    color: '#DDD',
    lineHeight: 16,
  },
  noLogsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noLogsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 