import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CameraScreenProps {
  rgbImageData?: string;
  thermalImageData?: string;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  rgbImageData,
  thermalImageData,
}) => {
  const [selectedCamera, setSelectedCamera] = useState<'rgb' | 'thermal' | 'both'>('both');

  const renderCameraView = (
    type: 'rgb' | 'thermal',
    title: string,
    imageData?: string,
    fullScreen?: boolean
  ) => {
    const containerStyle = fullScreen ? styles.fullScreenContainer : styles.cameraContainer;
    const imageStyle = fullScreen ? styles.fullScreenImage : styles.cameraImage;
    
    return (
      <View style={containerStyle}>
        <View style={styles.cameraHeader}>
          <Ionicons 
            name={type === 'rgb' ? 'camera' : 'thermometer'} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.cameraTitle}>{title}</Text>
        </View>
        
        <View style={styles.imageWrapper}>
          {imageData ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${imageData}` }}
              style={imageStyle}
              resizeMode="cover"
            />
          ) : (
            <View style={[imageStyle, styles.noSignal]}>
              <Ionicons name="camera-outline" size={40} color="#666" />
              <Text style={styles.noSignalText}>No Signal</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cameraInfo}>
          <Text style={styles.statusText}>
            Status: {imageData ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Camera Feeds</Text>
      </View>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedCamera === 'both' && styles.activeToggle]}
          onPress={() => setSelectedCamera('both')}
        >
          <Text style={[styles.toggleText, selectedCamera === 'both' && styles.activeToggleText]}>
            Both Cameras
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedCamera === 'rgb' && styles.activeToggle]}
          onPress={() => setSelectedCamera('rgb')}
        >
          <Text style={[styles.toggleText, selectedCamera === 'rgb' && styles.activeToggleText]}>
            RGB Camera
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedCamera === 'thermal' && styles.activeToggle]}
          onPress={() => setSelectedCamera('thermal')}
        >
          <Text style={[styles.toggleText, selectedCamera === 'thermal' && styles.activeToggleText]}>
            Thermal Camera
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1 }}>
        {selectedCamera === 'both' && (
          <View style={styles.bothCamerasContainer}>
            {renderCameraView('rgb', 'RGB Camera', rgbImageData)}
            {renderCameraView('thermal', 'Thermal Camera', thermalImageData)}
          </View>
        )}

        {selectedCamera === 'rgb' && renderCameraView('rgb', 'RGB Camera Feed', rgbImageData, true)}
        {selectedCamera === 'thermal' && renderCameraView('thermal', 'Thermal Camera Feed', thermalImageData, true)}
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
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AAA',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  bothCamerasContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cameraContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    minHeight: 250,
  },
  fullScreenContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    margin: 20,
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  cameraImage: {
    width: '100%',
    height: 180,
  },
  fullScreenImage: {
    width: '100%',
    height: 300,
  },
  noSignal: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  noSignalText: {
    color: '#666',
    marginTop: 10,
    fontSize: 14,
  },
  cameraInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#AAA',
  },
}); 