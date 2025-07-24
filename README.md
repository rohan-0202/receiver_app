# Health Monitor Mobile App

A React Native mobile application for iOS and Android that receives and displays health monitoring data from the **rosie_app publisher service**. This is the mobile version of the desktop `rosie_receiver` application with a **medical-grade dark UI** that matches the desktop interface.

## 🏗️ **System Architecture**

```
📱 Mobile App     }  Both connect to the same
🖥️ Desktop App   }  rosie_app Publisher on Port 27182
                  ⬇️
        🔧 rosie_app (Hardware Publisher Service)
        ├── Real RGB & Thermal Cameras
        ├── Computer Vision Processing
        ├── Vital Signs Extraction from Video
        ├── Face Recognition & Patient ID
        └── Socket.IO Server (Port 27182)
```

**✅ IMPORTANT:** Both receiver apps connect to the **same rosie_app publisher service**!

- **rosie_app**: Hardware publisher service with real cameras and CV processing (Port 27182)
- **Desktop App**: `rosie_receiver` connects to rosie_app 
- **Mobile App**: This app also connects directly to rosie_app

## 🚀 **Auto-Discovery Features**

The mobile app automatically discovers the **rosie_app publisher service**:

1. **🔍 Network Scan**: Automatically searches your local network for rosie_app
2. **📱 No Manual Setup**: Works without knowing the exact IP address  
3. **🔄 Fallback Support**: Falls back to manual IP if auto-discovery fails
4. **📋 Real-time Logs**: Shows discovery progress in the System Diagnostics tab

## Features

🏥 **Health Diagnostics Dashboard**
- **Dark medical theme** matching the desktop application
- **Real-time vital signs charts** with medical icons (heart, lungs, thermometer)
- **Color-coded displays**: Green (normal), Yellow (warning), Red (critical)
- **Live camera feed** integration with RGB camera support
- **Patient information display** with location and facility details
- **Professional medical aesthetic** with Signum Technologies branding

📊 **Vital Signs Monitoring**
- **Heart Rate**: Real-time BPM with historical chart visualization
- **Respiratory Rate**: Real-time RPM with trend analysis
- **Temperature**: Real-time °F with color-coded health indicators
- **Medical Icons**: Heart, fitness (lungs), thermometer for each vital sign
- **Y-axis scales**: Proper medical ranges (HR: 0-180, RR: 0-40, Temp: 80-120°F)

📹 **Camera Feeds**
- Live RGB camera feed (matches desktop's left panel)
- Live thermal camera feed support
- Toggle between individual cameras or dual view
- Real-time image streaming with "No Signal" indicators

🔧 **System Diagnostics**  
- **Auto-discovery logs** showing publisher search progress
- Connection status monitoring with colored indicators
- Frame rate (FPS) tracking with performance bars
- System logs with color-coded message types
- Publisher IP management with runtime connection changes
- Dark theme UI matching medical device aesthetics

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- **A running rosie_app service** (hardware publisher with real cameras on Port 27182)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **No manual IP setup needed!** 
   
   The app will automatically discover your rosie_app service. If needed, you can manually set the IP in the System Diagnostics tab.

## Running the App

### Development Mode

```bash
# Start the Expo development server
npm start

# Or run on specific platforms
npm run ios     # iOS simulator
npm run android # Android emulator/device
npm run web     # Web browser
```

### Using Expo Go App

1. Install Expo Go on your mobile device from the App Store or Google Play
2. Run `npm start` to start the development server
3. Scan the QR code with your device's camera (iOS) or Expo Go app (Android)

## 🔌 **Connection Setup**

### ✅ **Automatic (Recommended)**
The app will automatically find your rosie_app service:

1. **Start rosie_app** on your hardware system:
   ```bash
   cd rosie_app
   make stream
   ```
2. **Start the mobile app**
3. **Check System Diagnostics tab** for discovery progress
4. **rosie_app found!** - Connection should establish automatically

### 🔧 **Manual (If Auto-Discovery Fails)**
If automatic discovery doesn't work:

1. **Find your rosie_app IP address**
2. **Go to System Diagnostics tab** in the mobile app
3. **Tap "Change Connection"** 
4. **Enter the rosie_app IP address**
5. **Tap "Connect"**

### 🏠 **Network Requirements**
- Mobile device and rosie_app must be on the **same network**
- rosie_app must be running on **Port 27182** (default)
- No firewall blocking connections between devices

## App Structure

The mobile app features **3 main screens** accessible via bottom tab navigation:

### 1. 🏥 Health Monitor (Main Screen)
- **Exact replica** of desktop interface layout
- **Side-by-side layout**: Camera feed (left) + Vital signs (right)
- **Real-time charts** with medical color coding
- **Patient information** panel at bottom
- **Dark medical theme** throughout

### 2. 📹 Camera Feeds
- **Dedicated camera management** 
- **Toggle views**: Both cameras, RGB only, or Thermal only
- **Full-screen camera modes**
- **Connection status indicators**

### 3. ⚙️ System Diagnostics  
- **Auto-discovery status** and progress logs
- **Connection management** with IP address changes
- **Performance monitoring** with FPS tracking
- **System logs** with color-coded entries
- **Medical device styling**

## Medical UI Color Scheme

The app uses the same color palette as your desktop application:

- **Heart Rate**: `#00FF00` (Bright Green)
- **Respiratory Rate**: `#FFFF00` (Bright Yellow) 
- **Temperature**: `#00FFFF` (Bright Cyan)
- **Background**: `#000000` (Pure Black)
- **Cards/Panels**: `#111111` (Dark Gray)
- **Text**: `#FFFFFF` (White) for headers, `#AAA` for secondary
- **Active Status**: `#00FF00` (Green)
- **Inactive Status**: `#FF3B30` (Red)

## Data Flow

1. **rosie_app** (hardware service) processes real camera feeds and extracts vital signs
2. **rosie_app** streams data via Socket.IO on Port 27182
3. **Desktop App** connects to rosie_app and displays data
4. **Mobile App** also connects to the same rosie_app service
5. **Both apps** receive identical real-time data streams:
   - Vital signs data (`add_chip`/`update_chip` events) with face recognition
   - RGB camera frames (`update_feed` events) 
   - Thermal camera frames (`thermal_image` events)
   - Performance metrics (`frame_rate` events)

## Troubleshooting

### Connection Issues

#### 🔍 **"Searching for publisher device..." (Auto-Discovery)**
- **Wait 30-60 seconds** for network scan to complete
- **Check System Diagnostics logs** for discovery progress
- **Ensure rosie_app is running** and connected to same network
- **Try manual connection** if auto-discovery fails

#### ❌ **"Connection Error: websocket error"**
- **rosie_app not running**: Make sure rosie_app is started with `make stream`
- **Wrong network**: Ensure mobile device and rosie_app are on same Wi-Fi network  
- **Firewall blocking**: Check that Port 27182 is not blocked
- **Try manual IP**: Use the "Change Connection" button in System Diagnostics

#### 🔄 **"Auto-discovery failed, trying default IP"**
- **Normal behavior**: App will try the last known working IP
- **Check logs**: Look at System Diagnostics for specific error messages
- **Manual override**: Use "Change Connection" to set correct IP

### Starting rosie_app

Make sure to start the rosie_app service first:

```bash
cd rosie_app
make stream
```

This will start the hardware publisher service that both the desktop and mobile apps connect to.

### UI Issues

- The app requires **landscape orientation** for optimal viewing (like the desktop)
- Ensure your device supports the dark theme display
- Charts may take a few seconds to populate with initial data

### Performance Issues

- Reduce image quality on the publisher if frame rates are low
- Ensure strong Wi-Fi connection
- Close other apps that might be using network resources

## Building for Production

### iOS (requires macOS)
```bash
npx eas build --platform ios
```

### Android
```bash
npx eas build --platform android
```

## Compatibility

- **iOS:** 13.0+
- **Android:** API level 21+ (Android 5.0+)
- **Expo SDK:** 53.0.0
- **Orientation:** Works in both portrait and landscape (landscape recommended)
- **Network:** Requires same Wi-Fi network as publisher device

## Medical Device Integration

This mobile app is designed to complement your existing health monitoring setup:

- **Direct publisher connection** - connects to the same hardware as desktop app
- **Independent operation** - works without running the desktop app
- **Seamless data continuity** - receives identical data streams
- **Professional medical interface** suitable for clinical environments  
- **Real-time monitoring** capabilities for mobile health scenarios
- **HIPAA-conscious design** (ensure proper data handling in your implementation)

## Contributing

This mobile app mirrors the functionality and design of the desktop `rosie_receiver` application. When adding features:

1. Maintain compatibility with the existing Socket.IO protocol
2. Follow the established medical UI color scheme and styling
3. Ensure cross-platform compatibility (iOS/Android)
4. Update TypeScript types as needed
5. Test with actual publisher hardware when possible
6. Remember both apps connect to publisher, not to each other

## License

Same license as the parent `rosie_receiver` project. 