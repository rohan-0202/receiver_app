import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VitalSigns, PatientInfo, VitalSignHistory } from '../types';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

interface HealthDiagnosticsScreenProps {
  vitalSigns: VitalSigns;
  patientInfo: PatientInfo;
  rgbImageData?: string;
  chipImage?: string;
}

export const HealthDiagnosticsScreen: React.FC<HealthDiagnosticsScreenProps> = ({
  vitalSigns,
  patientInfo,
  rgbImageData,
  chipImage,
}) => {
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const [respRateHistory, setRespRateHistory] = useState<number[]>([]);
  const [tempHistory, setTempHistory] = useState<number[]>([]);

  useEffect(() => {
    // Update history arrays when new vital signs arrive
    const hr = typeof vitalSigns.heartrate === 'number' ? vitalSigns.heartrate : 0;
    const rr = typeof vitalSigns.resprate === 'number' ? vitalSigns.resprate : 0;
    const temp = typeof vitalSigns.temp === 'number' ? vitalSigns.temp : 0;

    setHeartRateHistory(prev => [...prev.slice(-20), hr]);
    setRespRateHistory(prev => [...prev.slice(-20), rr]);
    setTempHistory(prev => [...prev.slice(-20), temp]);
  }, [vitalSigns]);

  const renderVitalChart = (
    title: string,
    value: number | string,
    history: number[],
    color: string,
    icon: string,
    maxValue: number,
    unit: string
  ) => {
    const numValue = typeof value === 'number' ? value : 0;
    
    return (
      <View style={styles.vitalContainer}>
        <View style={styles.vitalHeader}>
          <Ionicons name={icon as any} size={24} color={color} />
          <Text style={[styles.vitalTitle, { color }]}>{title}</Text>
        </View>
        
        <View style={styles.chartArea}>
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            {Array.from({ length: 7 }, (_, i) => {
              const labelValue = Math.round((maxValue / 6) * (6 - i));
              return (
                <Text key={i} style={styles.yAxisLabel}>
                  {labelValue} —
                </Text>
              );
            })}
          </View>
          
          {/* Chart bars */}
          <View style={styles.chartBars}>
            {history.slice(-20).map((val, index) => {
              const barHeight = Math.max(2, (val / maxValue) * 140);
              return (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: barHeight,
                        backgroundColor: color,
                        opacity: index === history.length - 1 ? 1 : 0.7,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Current value indicator */}
        <View style={styles.currentValue}>
          <View style={[styles.valueIndicator, { backgroundColor: color }]} />
          <Text style={[styles.currentValueText, { color }]}>
            {value === 'N/A' ? 'N/A' : `${value} ${unit}`}
          </Text>
        </View>
      </View>
    );
  };

  const renderCameraFeed = () => {
    return (
      <View style={styles.cameraContainer}>
        {rgbImageData ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${rgbImageData}` }}
            style={styles.cameraImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noCameraFeed}>
            <Ionicons name="camera-outline" size={40} color="#666" />
            <Text style={styles.noCameraText}>No Camera Feed</Text>
          </View>
        )}
      </View>
    );
  };

  const renderPatientInfo = () => {
    return (
      <View style={styles.patientInfoContainer}>
        <View style={styles.patientRow}>
          <Text style={styles.patientLabel}>Patient:</Text>
          <Text style={styles.patientValue}>
            {patientInfo.isSearching ? 'looking for patient...' : patientInfo.name}
          </Text>
        </View>
        
        <View style={styles.patientRow}>
          <Text style={styles.patientLabel}>Location:</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.patientValue}>{patientInfo.location}</Text>
            <Text style={styles.patientValue}>{patientInfo.facility}</Text>
            <Text style={styles.patientValue}>{patientInfo.city}</Text>
          </View>
        </View>
        
        {/* Signum Technologies Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SIGNUM</Text>
          <Text style={styles.logoSubtext}>TECHNOLOGIES</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Diagnostics</Text>
      </View>
      
      <View style={styles.mainContent}>
        {/* Camera Feed Area */}
        <View style={styles.leftPanel}>
          {renderCameraFeed()}
        </View>
        
        {/* Vital Signs Charts */}
        <View style={styles.rightPanel}>
          {renderVitalChart(
            'Heart Rate',
            vitalSigns.heartrate,
            heartRateHistory,
            '#00FF00',
            'heart',
            180,
            'BPM'
          )}
          
          {renderVitalChart(
            'Respiratory Rate',
            vitalSigns.resprate,
            respRateHistory,
            '#FFFF00',
            'fitness',
            40,
            'RPM'
          )}
          
          {renderVitalChart(
            'Temperature',
            vitalSigns.temp,
            tempHistory,
            '#00FFFF',
            'thermometer',
            120,
            '°F'
          )}
        </View>
      </View>
      
      {/* Patient Information */}
      {renderPatientInfo()}
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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  leftPanel: {
    flex: 1,
    marginRight: 20,
  },
  rightPanel: {
    flex: 1,
    justifyContent: 'space-around',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  noCameraFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCameraText: {
    color: '#666',
    marginTop: 10,
    fontSize: 14,
  },
  vitalContainer: {
    height: 180,
    marginBottom: 20,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vitalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    paddingRight: 8,
    height: 140,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#888',
    textAlign: 'right',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    paddingLeft: 5,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 1,
  },
  chartBar: {
    width: 8,
    minHeight: 2,
    borderRadius: 1,
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  valueIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  currentValueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientInfoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientRow: {
    flex: 1,
  },
  patientLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  locationInfo: {
    marginTop: 4,
  },
  logoContainer: {
    alignItems: 'flex-end',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#007AFF',
    letterSpacing: 1,
  },
}); 