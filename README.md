# Group Travel

A comprehensive React Native mobile application for group travel booking and management. The app allows users to browse travel packages, book trips, chat with travel agents, manage bookings, and handle payments seamlessly.

## Features

- 🎫 **Travel Package Management**
  - Browse and search travel packages
  - View package details with images and descriptions
  - Filter packages by location, price, and other criteria
  - Top locations and popular destinations
  - Wishlist functionality

- 👥 **User Management**
  - Customer and Agent authentication
  - User profiles and personal information
  - OTP-based verification
  - Password reset functionality

- 💬 **Real-time Communication**
  - Chat with travel agents
  - File and document sharing
  - Push notifications
  - Video/audio calling integration (Agora)

- 📅 **Booking System**
  - Package booking flow
  - Booking summary and details
  - Upcoming and completed bookings
  - Booking cancellation and refunds

- 💳 **Payment Integration**
  - Razorpay payment gateway
  - Wallet functionality
  - Transaction history
  - Payment success/failure handling

- 🔔 **Notifications**
  - Firebase Cloud Messaging (FCM)
  - Push notifications for bookings, messages, and updates
  - Notification history

- ⭐ **Reviews & Ratings**
  - Rate and review packages
  - View package ratings

- 🗺️ **Location Services**
  - Nearby tour planners
  - Location-based search
  - Travel agency details

- 📄 **Additional Features**
  - Quotes system for custom packages
  - Privacy policy and terms of use
  - Customer support
  - Offline support

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **React Native CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **CocoaPods** (for iOS dependencies)
- **Java Development Kit (JDK)** 11 or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd group_tour
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Post-install setup**
   ```bash
   # Apply patches (runs automatically via postinstall script)
   npm run postinstall
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
API_URL=your_api_url_here
GOOGLE_MAP_KEY=your_google_maps_api_key
```

### Firebase Setup

1. **Android:**
   - Place your `google-services.json` file in `android/app/`

2. **iOS:**
   - Place your `GoogleService-Info.plist` file in `ios/GroupTravel/`

### Additional Setup

- Configure Razorpay keys in your backend API
- Set up Agora credentials for video/audio calling (if needed)
- Configure push notification certificates (iOS) and FCM (Android)

## Running the App

### Start Metro Bundler

```bash
npm start
# or
yarn start
```

### Run on Android

```bash
npm run android
# or
yarn android
```

### Run on iOS

```bash
npm run ios
# or
yarn ios
```

## Project Structure

```
group_tour/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/
│   ├── assets/             # Images, fonts, and other assets
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context providers
│   ├── model/              # Data models
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── AuthScreen/     # Authentication screens
│   │   └── NoAuthScreen/   # Main app screens
│   ├── store/              # Redux store configuration
│   └── utils/              # Utility functions and helpers
├── App.js                  # Root component
├── index.js                # Entry point
└── package.json            # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator/device
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run clean` - Clean Android build
- `npm run clean:all` - Clean build and reinstall dependencies

## Tech Stack

### Core
- **React Native** 0.80.1
- **React** 19.1.0
- **Redux Toolkit** - State management
- **React Navigation** - Navigation

### Firebase Services
- **@react-native-firebase/app** - Firebase core
- **@react-native-firebase/firestore** - Firestore database
- **@react-native-firebase/messaging** - Push notifications
- **@react-native-firebase/storage** - File storage
- **@react-native-firebase/analytics** - Analytics

### UI & UX
- **react-native-vector-icons** - Icon library
- **react-native-modal** - Modal components
- **react-native-calendars** - Calendar component
- **react-native-snap-carousel** - Carousel/slider
- **react-native-gifted-chat** - Chat UI
- **react-native-star-rating-widget** - Rating component

### Communication
- **agora-rn-uikit** - Video/audio calling
- **react-native-gifted-chat** - Chat interface

### Payment
- **react-native-razorpay** - Payment gateway

### Utilities
- **axios** - HTTP client
- **moment-timezone** - Date/time handling
- **@react-native-async-storage/async-storage** - Local storage
- **react-native-permissions** - Permission handling
- **react-native-geolocation-service** - Location services

## Important Notes

### Package Updates

Some packages have been updated or replaced:
- `@react-native-document-picker` (new) vs `react-native-document-picker` (old)
- `@react-native-clipboard/clipboard` (new) vs `@react-native-community/clipboard` (old)
- `react-native-star-rating-widget` (new) vs `react-native-star-rating` (old)

### Patches

This project uses `patch-package` to apply custom patches to certain packages. Patches are located in the `patches/` directory and are automatically applied during installation.

### Assets

Run the following command if you add new assets:
```bash
npx react-native-asset
```

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues:**
   ```bash
   npm start -- --reset-cache
   ```

2. **Android build issues:**
   ```bash
   npm run clean
   cd android && ./gradlew clean
   ```

3. **iOS build issues:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

4. **Node modules issues:**
   ```bash
   rm -rf node_modules
   npm install
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly on both iOS and Android
4. Submit a pull request

## License

@CodersMind Pvt Ltd

