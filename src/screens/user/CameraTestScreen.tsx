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
import { CameraView, CameraType, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import poseApiService, { uploadVideoForAnalysis, uploadImageForCheatCheck } from '../../services/poseApiService';
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
  const navigation = useNavigation() as CameraTestScreenNavigationProp;
  const route = useRoute() as CameraTestScreenRouteProp;
  const testId = route.params?.testId ?? (TESTS.length ? TESTS[0].id : '');

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [endCountdown, setEndCountdown] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [warningsCount, setWarningsCount] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [baselineImageUri, setBaselineImageUri] = useState<string | null>(null);
  const cheatIntervalRef = useRef<number | null>(null);
  const endCountdownIvRef = useRef<number | null>(null);
  const squatStateRef = useRef<'up' | 'down' | null>(null);
  const [overlayKeypoints, setOverlayKeypoints] = useState<Record<string, { x: number, y: number }> | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [cameraType, setCameraType] = useState<string>('back');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [cameraActivated, setCameraActivated] = useState(false);
  const poseDetectionIntervalRef = useRef<number | null>(null);
  const [recordingStarted, setRecordingStarted] = useState(false);

  const cameraRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const test = TESTS.find(t => t.id === testId);
  const recordingRef = useRef<any>(null);

  useEffect(() => {
    loadSound();
  }, []);

  useEffect(() => {
    if (cameraActivated) {
      getCameraPermissions();
    }
  }, [cameraActivated]);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../../../assets/beep.mp3'));
      setSound(sound);
    } catch (error) {
      console.warn('Failed to load beep sound:', error);
    }
  };

  const playBeep = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  const startEndCountdown = async (callback: () => void) => {
    setEndCountdown(3);
    const interval = setInterval(() => {
      setEndCountdown(prev => {
        if (prev > 1) {
          playBeep();
          return prev - 1;
        } else {
          clearInterval(interval);
          callback();
          return 0;
        }
      });
    }, 1000);
  };

  const toggleCamera = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
  };

  const acceptDisclaimer = () => {
    setShowDisclaimer(false);
    setCameraActivated(true);
  };

  // cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (cheatIntervalRef.current) {
        clearTimeout(cheatIntervalRef.current as number);
        cheatIntervalRef.current = null;
      }
      if (endCountdownIvRef.current) {
        clearInterval(endCountdownIvRef.current as number);
        endCountdownIvRef.current = null;
      }
    };
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

  const handleStartTest = async () => {
    if (!test || !hasPermission) return;

    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) {
          playBeep();
          return prev - 1;
        } else {
          clearInterval(countdownInterval);
          startTestAfterCountdown();
          return 0;
        }
      });
    }, 1000);
  };

  const startTestAfterCountdown = async () => {
    if (!test || !cameraRef.current) {
      console.warn('[CameraTest] Cannot start test: camera not ready');
      Alert.alert('Camera Not Ready', 'Please wait for the camera to initialize.');
      return;
    }

    if (typeof cameraRef.current.takePictureAsync === 'function') {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.4 });
        setBaselineImageUri(photo.uri);
        console.log('[CameraTest] Baseline image captured:', photo.uri);
      } catch (err) {
        console.warn('[CameraTest] failed to capture baseline image', err);
      }
    } else {
      console.warn('[CameraTest] Camera ref not ready for baseline capture');
    }

    setShowOverlay(false);
    setTestStarted(true);
    setTimeRemaining(test.duration);
    setCurrentStep(0);
    startCheatDetectionSnapshots();
    startPoseDetectionSnapshots();

    try {
      if (cameraRef.current.recordAsync) {
        setIsRecording(true);
        setRecordingStarted(true);
        const rec = await cameraRef.current.recordAsync({ quality: '480p', maxDuration: test.duration + 15 });
        recordingRef.current = rec?.uri;
        setIsRecording(false);
        setRecordingStarted(false);
      }
    } catch (err) {
      console.warn('[CameraTest] recording failed', err);
      setIsRecording(false);
      setRecordingStarted(false);
    }
  };

  const handleTestComplete = async () => {
    await startEndCountdown(async () => {
      if (recordingStarted) {
        try {
          if (cameraRef.current && cameraRef.current.stopRecording) {
            try { cameraRef.current.stopRecording(); } catch (e) { /* ignore */ }
          }
        } catch (e) {
          console.warn('[CameraTest] stopRecording error', e);
        }
        setIsRecording(false);
        setRecordingStarted(false);
      }
      setTestStarted(false);
      stopCheatDetectionSnapshots();
      stopPoseDetectionSnapshots();

      if (recordingRef.current) {
        setAnalyzing(true);
        try {
          const res = await uploadVideoForAnalysis(recordingRef.current);
          setAnalyzing(false);
          (navigation as any).navigate('TestReport', { testId, result: res });
        } catch (err) {
          setAnalyzing(false);
          console.warn('[CameraTest] video upload failed', err);
          Alert.alert('Upload failed', 'Failed to upload the recorded video for analysis. Please try again.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert(
          'Test Completed!',
          'Your test has been recorded and is being analyzed. Results will be available shortly.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    handleTestComplete();
  };

  const startCheatDetectionSnapshots = () => {
    if (cheatIntervalRef.current) {
      clearTimeout(cheatIntervalRef.current as number);
      cheatIntervalRef.current = null;
    }
    const takeSnapshot = () => {
      captureSnapshotForCheatDetection();
      const randomInterval = Math.random() * 10000 + 15000;
      cheatIntervalRef.current = setTimeout(takeSnapshot, randomInterval) as unknown as number;
    };
    takeSnapshot();
  };

  const stopCheatDetectionSnapshots = () => {
    if (cheatIntervalRef.current) {
      clearTimeout(cheatIntervalRef.current as number);
      cheatIntervalRef.current = null;
    }
  };

  const startPoseDetectionSnapshots = () => {
    if (poseDetectionIntervalRef.current) {
      clearInterval(poseDetectionIntervalRef.current as number);
      poseDetectionIntervalRef.current = null;
    }
    const takePoseSnapshot = async () => {
      try {
        if (!cameraRef.current) return;
        const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.4 });
        console.debug('[CameraTest] captured pose snapshot', photo.uri);
        try {
          const result = await poseApiService.uploadImageForPose(photo.uri);
          console.log('[CameraTest] Pose keypoints result:', result);
          if (result && result.keypoints) {
            processPose(result.keypoints);
          }
        } catch (err) {
          console.warn('[CameraTest] pose detection API failed', err);
        }
      } catch (err) {
        console.warn('[CameraTest] failed to capture snapshot for pose detection', err);
      }
    };
    takePoseSnapshot();
    poseDetectionIntervalRef.current = setInterval(takePoseSnapshot, 2000) as unknown as number;
  };

  const stopPoseDetectionSnapshots = () => {
    if (poseDetectionIntervalRef.current) {
      clearInterval(poseDetectionIntervalRef.current as number);
      poseDetectionIntervalRef.current = null;
    }
  };

  const captureSnapshotForCheatDetection = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.4 });
      console.debug('[CameraTest] captured cheat snapshot', photo.uri);
      try {
        const result = await uploadImageForCheatCheck(photo.uri);
        console.log('[CameraTest] Cheat check result:', result);
        if (result && result.cheat) {
          playBeep();
          setWarningsCount(w => {
            const next = w + 1;
            if (next >= 3) {
              playBeep();
              setTestStarted(false);
              setIsRecording(false);
              stopCheatDetectionSnapshots();
              try { if (cameraRef.current && cameraRef.current.stopRecording) cameraRef.current.stopRecording(); } catch (e) { }
              const disqResult = {
                id: `dq-${Date.now()}`,
                userId: 'unknown',
                testId,
                score: 0,
                metrics: { reason: 'cheating_detected' },
                videoUrl: recordingRef.current || null,
                aiConfidence: 1.0,
                timestamp: new Date(),
                isValid: false,
                feedback: 'Disqualified due to repeated cheating warnings',
              } as any;
              (navigation as any).navigate('TestReport', { testId, result: disqResult });
            }
            return next;
          });
        }
      } catch (err) {
        console.warn('[CameraTest] cheat check API failed', err);
      }
    } catch (err) {
      console.warn('[CameraTest] failed to capture snapshot for cheat detection', err);
    }
  };

  const computeAngle = (a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }) => {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };
    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
    if (magAB === 0 || magCB === 0) return 0;
    const cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
    return (Math.acos(cos) * 180) / Math.PI;
  };

  const processPose = (keypoints: Record<string, { x: number, y: number }>) => {
    try {
      setOverlayKeypoints(keypoints);
      if (!test) return;
      const leftHip = keypoints['leftHip'];
      const leftKnee = keypoints['leftKnee'];
      const leftAnkle = keypoints['leftAnkle'];
      if (leftHip && leftKnee && leftAnkle) {
        const kneeAngle = computeAngle(leftHip, leftKnee, leftAnkle);
        const downThreshold = 100;
        const upThreshold = 160;
        const prev = squatStateRef.current;
        if (kneeAngle < downThreshold && prev !== 'down') {
          squatStateRef.current = 'down';
        }
        if (kneeAngle > upThreshold && squatStateRef.current === 'down') {
          setRepCount(c => c + 1);
          squatStateRef.current = 'up';
        }
      }
    } catch (err) {
      console.warn('[CameraTest] processPose error', err);
    }
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

  if (showDisclaimer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerContent}>
            <Ionicons name="camera" size={64} color={COLORS.primary} />
            <Text style={styles.disclaimerTitle}>Camera Usage Agreement</Text>
            <Text style={styles.disclaimerText}>
              By proceeding, you agree to:
            </Text>
            <View style={styles.disclaimerPoints}>
              <Text style={styles.disclaimerPoint}>• Allow camera access for pose detection</Text>
              <Text style={styles.disclaimerPoint}>• Enable video recording during tests</Text>
              <Text style={styles.disclaimerPoint}>• Permit AI analysis of your movements</Text>
              <Text style={styles.disclaimerPoint}>• Accept automated feedback and scoring</Text>
            </View>
            <Text style={styles.disclaimerNote}>
              Your privacy is protected. No personal data is stored without consent.
            </Text>
            <View style={styles.disclaimerButtons}>
              <TouchableOpacity
                style={styles.disclaimerDeclineButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.disclaimerDeclineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.disclaimerAcceptButton}
                onPress={acceptDisclaimer}
              >
                <Text style={styles.disclaimerAcceptText}>Accept & Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          {(Ionicons as any) && <Ionicons name={'camera-off' as any} size={64} color={COLORS.error} />}
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

  const getPoseConfig = (id: string) => {
    switch (id) {
      case '2': // Pushups
        return {
          edges: [
            ['kp_5', 'kp_7'], ['kp_7', 'kp_9'], ['kp_6', 'kp_8'], ['kp_8', 'kp_10'],
            ['kp_5', 'kp_6'], ['kp_11', 'kp_12'], ['kp_11', 'kp_13'], ['kp_13', 'kp_15'],
            ['kp_12', 'kp_14'], ['kp_14', 'kp_16'],
          ],
          boneColor: styles.pushupBone,
          keypointColor: styles.pushupKeypoint,
        };
      case '4': // Balance
        return {
          edges: [
            ['kp_5', 'kp_7'], ['kp_7', 'kp_9'], ['kp_6', 'kp_8'], ['kp_8', 'kp_10'],
            ['kp_11', 'kp_13'], ['kp_13', 'kp_15'], ['kp_12', 'kp_14'], ['kp_14', 'kp_16'],
          ],
          boneColor: styles.balanceBone,
          keypointColor: styles.balanceKeypoint,
        };
      default:
        return {
          edges: [
            ['kp_11', 'kp_13'], ['kp_13', 'kp_15'], ['kp_12', 'kp_14'], ['kp_14', 'kp_16'],
            ['kp_23', 'kp_25'], ['kp_25', 'kp_27'], ['kp_24', 'kp_26'], ['kp_26', 'kp_28'],
            ['kp_11', 'kp_12'], ['kp_23', 'kp_24'],
          ],
          boneColor: styles.dynamicBone,
          keypointColor: styles.dynamicKeypoint,
        };
    }
  };

  const cameraProps: any = {
    ref: cameraRef,
    style: styles.camera,
    facing: cameraType,
    ratio: '16:9',
  };

  if (!cameraActivated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <CameraView {...cameraProps}>
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
            <TouchableOpacity
              style={styles.cameraToggle}
              onPress={toggleCamera}
            >
              <Ionicons name="camera-reverse" size={24} color={COLORS.white} />
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
                {showOverlay && (
                  <View style={styles.framingGuideContainer} pointerEvents="none">
                    {test?.category === 'fitness' || test?.category === 'strength' ? (
                      <View style={styles.framingRect} />
                    ) : (
                      <View style={styles.framingCircle} />
                    )}
                    <Text style={styles.framingLabel}>{test?.name} - Frame yourself inside the guide</Text>
                  </View>
                )}
                {countdown > 0 && (
                  <View style={styles.countdownOverlay} pointerEvents="none">
                    <Text style={styles.countdownText}>{countdown}</Text>
                    <Text style={styles.countdownLabel}>Starting</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.testContainer}>
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

                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionText}>
                    {test?.instructions[currentStep] || 'Keep going!'}
                  </Text>
                </View>

                <View style={styles.poseGuide}>
                  <View style={styles.poseFrame}>
                    <Text style={styles.poseText}>📐</Text>
                  </View>
                  <Text style={styles.poseLabel}>AI Pose Detection Active</Text>
                </View>
                {showOverlay && (
                  <View style={styles.framingGuideDuring} pointerEvents="none">
                    {test?.category === 'fitness' || test?.category === 'strength' ? (
                      <View style={styles.framingRectThin} />
                    ) : (
                      <View style={styles.framingCircleThin} />
                    )}
                  </View>
                )}
              </View>
            )}
            {endCountdown > 0 && (
              <View style={styles.countdownOverlay} pointerEvents="none">
                <Text style={styles.countdownText}>{endCountdown}</Text>
                <Text style={styles.countdownLabel}>Ending</Text>
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
          <View style={styles.aiOverlay} pointerEvents="none">
            {overlayKeypoints && (
              <View style={StyleSheet.absoluteFill}>
                {(() => {
                  if (!test) return null;
                  const { edges, boneColor, keypointColor } = getPoseConfig(test.id);

                  return (
                    <>
                      {edges.map(([a, b]) => {
                        const pa = overlayKeypoints[a];
                        const pb = overlayKeypoints[b];
                        if (!pa || !pb) return null;
                        const x1 = pa.x * screenWidth, y1 = pa.y * screenHeight;
                        const x2 = pb.x * screenWidth, y2 = pb.y * screenHeight;
                        const left = Math.min(x1, x2), top = Math.min(y1, y2);
                        const width = Math.hypot(x2 - x1, y2 - y1);
                        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                        return (
                          <View key={`${a}-${b}`} style={[boneColor, { left, top, width, transform: [{ rotate: `${angle}deg` }] }]} />
                        );
                      })}
                      {Object.entries(overlayKeypoints).map(([name, pt]) => {
                        const leftNum = pt.x * screenWidth;
                        const topNum = pt.y * screenHeight;
                        return (
                          <View key={name} style={{ position: 'absolute', left: leftNum - 5, top: topNum - 5 }}>
                            <View style={keypointColor} />
                          </View>
                        );
                      })}
                    </>
                  );
                })()}
              </View>
            )}

            <View style={styles.guideLines}>
              <View style={[styles.guideLine, styles.guideLine1]} />
              <View style={[styles.guideLine, styles.guideLine2]} />
            </View>
            <View style={styles.repBadge} pointerEvents="none">
              <Text style={{ color: COLORS.white, fontWeight: '700' }}>{repCount}</Text>
              <Text style={{ color: COLORS.white, fontSize: 12 }}>reps</Text>
            </View>
          </View>
        )}
      </CameraView>
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
  cameraToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
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
  posePoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
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
  bone: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  repBadge: {
    position: 'absolute',
    right: 16,
    top: 120,
    width: 64,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  framingGuideContainer: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  framingRect: {
    width: '70%',
    height: '50%',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  framingCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'transparent',
  },
  framingLabel: {
    marginTop: SPACING.md,
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  framingGuideDuring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  framingRectThin: {
    width: '72%',
    height: '52%',
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.9)',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  framingCircleThin: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.9)',
    backgroundColor: 'transparent',
  },
  exerciseGuideContainer: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  jumpTopLine: {
    position: 'absolute',
    top: 40,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: COLORS.accent,
  },
  jumpTargetBox: {
    width: 120,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
    position: 'absolute',
    top: 80,
    borderRadius: 6,
  },
  pushupLine: {
    width: '80%',
    height: 3,
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.md,
    opacity: 0.9,
  },
  agilityConesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  cone: {
    width: 18,
    height: 26,
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  balanceCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  genericBox: {
    width: '70%',
    height: '40%',
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    borderRadius: 12,
  },
  exerciseLabel: {
    marginTop: SPACING.md,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  countdownText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  countdownLabel: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.85)',
    marginTop: SPACING.sm,
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
  poseOutline: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  headCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  bodyLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  armLineLeft: {
    position: 'absolute',
    top: 10,
    left: -15,
    width: 15,
    height: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
  armLineRight: {
    position: 'absolute',
    top: 10,
    right: -15,
    width: 15,
    height: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '-45deg' }],
  },
  legLineLeft: {
    position: 'absolute',
    top: 45,
    left: -5,
    width: 2,
    height: 30,
    backgroundColor: COLORS.primary,
  },
  legLineRight: {
    position: 'absolute',
    top: 45,
    right: -5,
    width: 2,
    height: 30,
    backgroundColor: COLORS.primary,
  },
  armLinePushupLeft: {
    position: 'absolute',
    top: 15,
    left: -20,
    width: 20,
    height: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '90deg' }],
  },
  armLinePushupRight: {
    position: 'absolute',
    top: 15,
    right: -20,
    width: 20,
    height: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '90deg' }],
  },
  legLinePushup: {
    position: 'absolute',
    top: 45,
    left: '50%',
    transform: [{ translateX: -1 }],
    width: 2,
    height: 40,
    backgroundColor: COLORS.primary,
  },
  armLineRunLeft: {
    position: 'absolute',
    top: 10,
    left: -20,
    width: 20,
    height: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '135deg' }],
  },
  armLineRunRight: {
    position: 'absolute',
    top: 10,
    right: -20,
    width: 20,
    height: 2,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
  legLineRunLeft: {
    position: 'absolute',
    top: 45,
    left: -10,
    width: 2,
    height: 30,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '15deg' }],
  },
  legLineRunRight: {
    position: 'absolute',
    top: 45,
    right: -10,
    width: 2,
    height: 30,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '-15deg' }],
  },
  armLineBalanceLeft: {
    position: 'absolute',
    top: 10,
    left: -10,
    width: 10,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  armLineBalanceRight: {
    position: 'absolute',
    top: 10,
    right: -10,
    width: 10,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  legLineBalance: {
    position: 'absolute',
    top: 45,
    left: '50%',
    transform: [{ translateX: -1 }],
    width: 2,
    height: 20,
    backgroundColor: COLORS.primary,
  },
  disclaimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  disclaimerContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    maxWidth: '90%',
    ...SHADOWS.md,
  },
  disclaimerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  disclaimerPoints: {
    alignSelf: 'stretch',
    marginBottom: SPACING.lg,
  },
  disclaimerPoint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  disclaimerNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.xl,
  },
  disclaimerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  disclaimerDeclineButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  disclaimerDeclineText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  disclaimerAcceptButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  disclaimerAcceptText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  dynamicBone: {
    position: 'absolute',
    height: 3,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '0deg' }],
    borderRadius: 1.5,
  },
  dynamicKeypoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  balanceKeypoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  pushupKeypoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  balanceBone: {
    position: 'absolute',
    height: 3,
    backgroundColor: COLORS.secondary,
    transform: [{ rotate: '0deg' }],
    borderRadius: 1.5,
  },
  pushupBone: {
    position: 'absolute',
    height: 3,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '0deg' }],
    borderRadius: 1.5,
  },
  debugBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: SPACING.sm,
    borderRadius: 8,
    zIndex: 50,
  },
  debugTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  debugLine: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    lineHeight: 14,
  },
});

export default CameraTestScreen;