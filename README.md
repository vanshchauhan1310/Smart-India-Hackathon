# Sports Talent Assessment App

A comprehensive AI-powered mobile platform for democratizing sports talent assessment, built with React Native and Expo.

## 🚀 Features

### Core Features
- **AI-Guided Video Recording**: Real-time pose estimation overlay guiding posture and form during recording
- **Object Detection**: Identify test elements (cones, markers) automatically
- **Real-time Feedback**: Correct movements with instant AI feedback
- **On-Device Video Analysis**: Auto-segmentation of fitness tests with performance metric extraction
- **Action Recognition**: Sequential pose data analysis for valid/invalid rep detection
- **Cheat Detection**: Metadata checks, splicing, and motion range validation
- **Secure Result Packaging**: Encrypted data upload via REST API when online

### User Portal
- **Language Selection**: Support for 10+ Indian languages with native UI
- **Onboarding Flow**: Complete user registration with unique ID generation
- **Test Selection**: Choose from various fitness assessments with detailed instructions
- **Camera Test Interface**: AI-guided recording with real-time pose detection
- **Leaderboard**: National rankings with filtering by sport and test type
- **Profile Management**: Comprehensive user profile with performance tracking
- **AI Assistant**: Integrated chatbot for training tips and support

### Admin/Scouter Portal
- **Dashboard**: Comprehensive analytics and system overview
- **User Management**: View and manage all platform users
- **Test Management**: Configure and manage assessment tests
- **Analytics**: Performance insights and data analysis
- **Settings**: System configuration and preferences

### Advanced Features
- **Role-based Access Control**: Seamless switching between user and admin views
- **Multilingual Support**: IndicBART, IndicBERT integration for Indian languages
- **Modern UI/UX**: Billion-dollar product quality design with responsive layouts
- **State Management**: React Context for efficient app state management
- **Secure Authentication**: JWT-based authentication with role management

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **State Management**: React Context API
- **UI Components**: Custom design system with modern components
- **Camera**: Expo Camera with AI overlay capabilities
- **Storage**: AsyncStorage for local data persistence
- **Styling**: StyleSheet with responsive design principles

## 📱 Screenshots

### User Portal
- Language Selection with 10+ Indian languages
- Modern onboarding flow with step-by-step guidance
- AI-guided test recording with pose detection overlay
- Interactive leaderboard with national rankings
- Comprehensive profile management

### Admin Portal
- Analytics dashboard with real-time metrics
- User management with detailed profiles
- Test configuration and management
- System monitoring and status indicators

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SportsTalentApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For Web
   npm run web
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, Card, etc.)
│   ├── forms/          # Form-specific components
│   └── modals/         # Modal components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── user/          # User portal screens
│   ├── admin/         # Admin portal screens
│   └── shared/        # Shared screens
├── navigation/         # Navigation configuration
├── context/           # React Context for state management
├── types/             # TypeScript type definitions
├── constants/         # App constants and configuration
├── utils/             # Utility functions
└── assets/            # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #EC4899 (Pink)
- **Accent**: #F59E0B (Amber)
- **Success**: #10B981 (Emerald)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)

### Typography
- **Font Sizes**: 12px to 32px with consistent scaling
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Spacing
- **Base Unit**: 4px
- **Scale**: 4px, 8px, 16px, 24px, 32px, 48px

### Components
- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Inputs**: Text, Email, Password, Multiline with validation
- **Cards**: Elevated cards with consistent shadows
- **Modals**: Slide-up and overlay modals
- **Navigation**: Tab and drawer navigation

## 🔐 Authentication & Security

- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access**: User, Admin, and Scouter roles
- **Data Encryption**: Secure data transmission and storage
- **Privacy Protection**: GDPR-compliant data handling

## 🌐 Multilingual Support

### Supported Languages
- English (en)
- Hindi (hi)
- Bengali (bn)
- Telugu (te)
- Marathi (mr)
- Tamil (ta)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)

### Implementation
- Native language UI with proper RTL support
- IndicBART and IndicBERT integration for AI responses
- IndicNLP Library for script and language processing

## 📊 Performance Features

### AI Capabilities
- **Real-time Pose Estimation**: Live pose detection during recording
- **Object Detection**: Automatic identification of test equipment
- **Performance Analysis**: Automated metric extraction
- **Cheat Detection**: Advanced validation algorithms
- **Action Recognition**: Movement pattern analysis

### Analytics
- **Performance Tracking**: Individual and comparative analytics
- **Progress Monitoring**: Historical performance trends
- **Benchmarking**: National standard comparisons
- **Predictive Analytics**: Performance forecasting

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
# For Android
expo build:android

# For iOS
expo build:ios
```

### App Store Deployment
1. Configure app.json with proper bundle identifiers
2. Build production version
3. Submit to respective app stores

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

### Planned Features
- **Injury Prediction**: Biomechanical data analysis for injury prevention
- **Wearable Integration**: Heart rate and fatigue monitoring
- **Predictive Analytics**: Opponent analysis and strategy suggestions
- **Advanced AI**: Enhanced pose detection and performance analysis
- **Social Features**: Community challenges and team competitions

### Technical Improvements
- **Offline Support**: Enhanced offline functionality
- **Performance Optimization**: Faster video processing
- **Advanced Analytics**: Machine learning insights
- **API Integration**: Third-party service integrations

---

**Built with ❤️ for the future of sports talent assessment**