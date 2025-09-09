import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../types';
import Button from '../../components/common/Button';
import { TESTS, COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

type CameraTestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CameraTest'>;
type CameraTestScreenRouteProp = RouteProp<RootStackParamList, 'CameraTest'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CameraTestScreen: React.FC = () => {
  const navigation = useNavigation<CameraTestScreenNavigationProp>();
  const route = useRoute<CameraTestScreenRouteProp>();
  const testId = route.params?.testId ?? (TESTS.length ? TESTS[0].id : '');
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  
  const cameraRef = useRef<Camera>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const test = TESTS.find(t => t.id === testId);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (testStarted && timeRemaining === 0) {
      handleTestComplete();
    }
  }, [testStarted, timeRemaining]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleStartTest = () => {
    if (!test) return;
    
    setTestStarted(true);
    setTimeRemaining(test.duration);
    setCurrentStep(0);
    setShowOverlay(false);
  };

  const handleTestComplete = async () => {
    setIsRecording(false);
    setTestStarted(false);
    
    // Simulate processing
    Alert.alert(
      'Test Completed!',
      'Your test has been recorded and is being analyzed. Results will be available shortly.',
      [
        {
          text: 'View Results',
          onPress: () => navigation.navigate('UserDashboard'),
        },
      ]
    );
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    handleTestComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleOverlay = () => {
    Animated.timing(fadeAnim, {
      toValue: showOverlay ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowOverlay(!showOverlay);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="camera-off" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Camera Access Required</Text>
          <Text style={styles.errorText}>
            Please enable camera access in your device settings to use this feature.
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}
        ratio="16:9"
      >
        {/* Overlay Controls */}
        <Animated.View
          style={[
            styles.overlay,
            { opacity: fadeAnim }
          ]}
        >
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={styles.testInfo}>
              <Text style={styles.testName}>{test?.name}</Text>
              <Text style={styles.testDuration}>{test?.duration}s</Text>
            </View>
            
            <TouchableOpacity
              style={styles.overlayToggle}
              onPress={toggleOverlay}
            >
              <Ionicons name="eye" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Center Content */}
          <View style={styles.centerContent}>
            {!testStarted ? (
              <View style={styles.startContainer}>
                <View style={styles.startIcon}>
                  <Ionicons name="play-circle" size={80} color={COLORS.white} />
                </View>
                <Text style={styles.startTitle}>Ready to Start?</Text>
                <Text style={styles.startSubtitle}>
                  Make sure you're in a well-lit area with enough space
                </Text>
                <Button
                  title="Start Test"
                  onPress={handleStartTest}
                  style={styles.startButton}
                />
              </View>
            ) : (
              <View style={styles.testContainer}>
                {/* Timer */}
                <View style={styles.timerContainer}>
                  <Animated.View
                    style={[
                      styles.timerCircle,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                  </Animated.View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionText}>
                    {test?.instructions[currentStep] || 'Keep going!'}
                  </Text>
                </View>

                {/* Pose Guide */}
                <View style={styles.poseGuide}>
                  <View style={styles.poseFrame}>
                    <Text style={styles.poseText}>📐</Text>
                  </View>
                  <Text style={styles.poseLabel}>AI Pose Detection Active</Text>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {testStarted && (
              <View style={styles.recordingControls}>
                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordingButton
                  ]}
                  onPress={isRecording ? handleStopRecording : () => setIsRecording(true)}
                >
                  <View style={[
                    styles.recordIcon,
                    isRecording && styles.recordingIcon
                  ]} />
                </TouchableOpacity>
                
                <View style={styles.recordingInfo}>
                  <View style={[
                    styles.recordingIndicator,
                    isRecording && styles.recordingActive
                  ]} />
                  <Text style={styles.recordingText}>
                    {isRecording ? 'Recording...' : 'Tap to Record'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* AI Overlay Elements */}
        {testStarted && (
          <View style={styles.aiOverlay}>
            {/* Pose Detection Points */}
            <View style={styles.posePoints}>
              <View style={[styles.posePoint, styles.posePoint1]} />
              <View style={[styles.posePoint, styles.posePoint2]} />
              <View style={[styles.posePoint, styles.posePoint3]} />
              <View style={[styles.posePoint, styles.posePoint4]} />
            </View>
            
            {/* Movement Guide Lines */}
            <View style={styles.guideLines}>
              <View style={[styles.guideLine, styles.guideLine1]} />
              <View style={[styles.guideLine, styles.guideLine2]} />
            </View>
          </View>
        )}
      </Camera>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testInfo: {
    alignItems: 'center',
  },
  testName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  testDuration: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  overlayToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  startContainer: {
    alignItems: 'center',
  },
  startIcon: {
    marginBottom: SPACING.xl,
  },
  startTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  startSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  startButton: {
    minWidth: 200,
  },
  testContainer: {
    alignItems: 'center',
    width: '100%',
  },
  timerContainer: {
    marginBottom: SPACING.xl,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  timerText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    maxWidth: '90%',
  },
  instructionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '500',
  },
  poseGuide: {
    alignItems: 'center',
  },
  poseFrame: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  poseText: {
    fontSize: 24,
  },
  poseLabel: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomControls: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  recordingButton: {
    backgroundColor: COLORS.error,
  },
  recordIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
  },
  recordingIcon: {
    borderRadius: 8,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: SPACING.sm,
  },
  recordingActive: {
    backgroundColor: COLORS.error,
  },
  recordingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '500',
  },
  aiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  posePoints: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  posePoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  posePoint1: {
    top: 0,
    left: 0,
  },
  posePoint2: {
    top: 50,
    left: -25,
  },
  posePoint3: {
    top: 50,
    left: 25,
  },
  posePoint4: {
    top: 100,
    left: 0,
  },
  guideLines: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  guideLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.7,
  },
  guideLine1: {
    top: 25,
    left: -30,
    width: 60,
  },
  guideLine2: {
    top: 75,
    left: -30,
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  errorButton: {
    minWidth: 150,
  },
});

export default CameraTestScreen;