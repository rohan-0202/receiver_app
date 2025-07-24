import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { HealthDiagnosticsScreen } from './src/screens/HealthDiagnosticsScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { DiagnosticsScreen } from './src/screens/DiagnosticsScreen';
import { SocketService } from './src/services/SocketService';
import { VitalSigns, SystemInfo, LogMessage, PatientInfo } from './src/types';

const Tab = createBottomTabNavigator();

export default function App() {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    heartrate: 'N/A',
    resprate: 'N/A',
    temp: 'N/A',
  });

  const [chipImage, setChipImage] = useState<string>();
  const [rgbImageData, setRGBImageData] = useState<string>();
  const [thermalImageData, setThermalImageData] = useState<string>();
  
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    fps: 0,
    connectionStatus: 'Inactive',
    connectedIP: '',
    logs: [],
  });

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    location: 'Health Pod 005',
    facility: 'American Legion Post #175',
    city: 'Severna Park, MD',
    isSearching: true,
  });

  const socketServiceRef = useRef<SocketService | null>(null);

  // Default publisher IP - will try to auto-discover first
  const DEFAULT_PUBLISHER_IP = '10.0.0.32';

  useEffect(() => {
    // Try to automatically discover the publisher first
    initializeWithDiscovery();
    
    // Cleanup on unmount
    return () => {
      if (socketServiceRef.current) {
        socketServiceRef.current.disconnect();
      }
    };
  }, []);

  const initializeWithDiscovery = async () => {
    addLog('info', 'Searching for publisher device...');
    
    try {
      // First try automatic discovery
      const discoveredIP = await SocketService.discoverPublisher();
      
      if (discoveredIP) {
        addLog('info', `Publisher auto-discovered at ${discoveredIP}`);
        initializeSocketService(discoveredIP);
      } else {
        // Fallback to default IP
        addLog('warning', `Auto-discovery failed, trying default IP: ${DEFAULT_PUBLISHER_IP}`);
        initializeSocketService(DEFAULT_PUBLISHER_IP);
      }
    } catch (error) {
      addLog('error', `Discovery error: ${error instanceof Error ? error.message : String(error)}`);
      // Fallback to default IP
      initializeSocketService(DEFAULT_PUBLISHER_IP);
    }
  };

  const initializeSocketService = (publisherIP: string) => {
    if (socketServiceRef.current) {
      socketServiceRef.current.disconnect();
    }

    socketServiceRef.current = new SocketService(publisherIP);

    // Set up callback handlers
    socketServiceRef.current.setOnVitalSignsUpdate((vitals, image) => {
      setVitalSigns(vitals);
      setChipImage(image);
      addLog('info', `Vital signs updated: HR=${vitals.heartrate}, RR=${vitals.resprate}, Temp=${vitals.temp}`);
      
      // Simulate patient found when we get data
      if (vitals.heartrate !== 'N/A' && patientInfo.isSearching) {
        setPatientInfo(prev => ({
          ...prev,
          name: 'Patient Detected',
          isSearching: false,
        }));
      }
    });

    socketServiceRef.current.setOnRGBImageUpdate((imageData) => {
      setRGBImageData(imageData);
    });

    socketServiceRef.current.setOnThermalImageUpdate((imageData) => {
      setThermalImageData(imageData);
    });

    socketServiceRef.current.setOnFPSUpdate((fps) => {
      setSystemInfo(prev => ({ ...prev, fps }));
    });

    socketServiceRef.current.setOnConnectionStatusChange((status, ip) => {
      setSystemInfo(prev => ({ 
        ...prev, 
        connectionStatus: status, 
        connectedIP: ip 
      }));
      
      const message = status === 'Active' 
        ? `Connected to publisher at ${ip}`
        : `Disconnected from publisher`;
      
      addLog(status === 'Active' ? 'info' : 'warning', message);

      // Reset patient search when disconnected
      if (status === 'Inactive') {
        setPatientInfo(prev => ({
          ...prev,
          name: '',
          isSearching: true,
        }));
      }
    });

    // Attempt to connect
    socketServiceRef.current.connect().catch((error) => {
      console.error('Failed to connect to publisher:', error);
      addLog('error', `Failed to connect to publisher at ${publisherIP}: ${error.message}`);
    });
  };

  const addLog = (type: 'info' | 'warning' | 'error', message: string) => {
    const newLog: LogMessage = {
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };

    setSystemInfo(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-49), newLog], // Keep last 50 logs
    }));
  };

  const handleConnectionChange = (newIP: string) => {
    addLog('info', `Attempting to connect to new publisher: ${newIP}`);
    initializeSocketService(newIP);
  };

  const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (routeName) {
      case 'HealthDiagnostics':
        iconName = focused ? 'medical' : 'medical-outline';
        break;
      case 'Cameras':
        iconName = focused ? 'camera' : 'camera-outline';
        break;
      case 'Diagnostics':
        iconName = focused ? 'settings' : 'settings-outline';
        break;
      default:
        iconName = 'help-outline';
    }

    return <Ionicons name={iconName} size={size} color={color} />;
  };

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) =>
              getTabBarIcon(route.name, focused, color, size),
            tabBarActiveTintColor: '#00FF00',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: {
              backgroundColor: '#000000',
              borderTopWidth: 1,
              borderTopColor: '#333',
              height: 90,
              paddingBottom: 10,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="HealthDiagnostics" 
            options={{ title: 'Health Monitor' }}
          >
            {() => (
              <HealthDiagnosticsScreen 
                vitalSigns={vitalSigns} 
                patientInfo={patientInfo}
                rgbImageData={rgbImageData}
                chipImage={chipImage}
              />
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Cameras" 
            options={{ title: 'Camera Feeds' }}
          >
            {() => (
              <CameraScreen 
                rgbImageData={rgbImageData}
                thermalImageData={thermalImageData}
              />
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Diagnostics" 
            options={{ title: 'System Info' }}
          >
            {() => (
              <DiagnosticsScreen 
                systemInfo={systemInfo}
                onConnectionChange={handleConnectionChange}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
} 