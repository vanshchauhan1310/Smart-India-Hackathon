import { StyleSheet } from 'react-native';
import { COLORS } from './';

export const getPoseConfig = (testId: string) => {
  switch (testId) {
    case '2': // Pushups
      return {
        edges: [
          ['kp_5', 'kp_7'],
          ['kp_7', 'kp_9'],
          ['kp_6', 'kp_8'],
          ['kp_8', 'kp_10'],
          ['kp_5', 'kp_6'],
          ['kp_11', 'kp_12'],
          ['kp_11', 'kp_13'],
          ['kp_13', 'kp_15'],
          ['kp_12', 'kp_14'],
          ['kp_14', 'kp_16'],
        ],
        boneColor: styles.pushupBone,
        keypointColor: styles.pushupKeypoint,
      };
    case '4': // Balance
      return {
        edges: [
          ['kp_5', 'kp_7'],
          ['kp_7', 'kp_9'],
          ['kp_6', 'kp_8'],
          ['kp_8', 'kp_10'],
          ['kp_11', 'kp_13'],
          ['kp_13', 'kp_15'],
        ],
        boneColor: styles.balanceBone,
        keypointColor: styles.balanceKeypoint,
      };
    default:
      return {
        edges: [
            ['kp_11','kp_13'],
            ['kp_13','kp_15'],
            ['kp_12','kp_14'],
            ['kp_14','kp_16'],
            ['kp_23','kp_25'],
            ['kp_25','kp_27'],
            ['kp_24','kp_26'],
            ['kp_26','kp_28'],
            ['kp_11','kp_12'],
            ['kp_23','kp_24'],
        ],
        boneColor: styles.dynamicBone,
        keypointColor: styles.dynamicKeypoint,
      };
  }
};

const styles = StyleSheet.create({
  pushupBone: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  pushupKeypoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  balanceBone: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  balanceKeypoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
  },
  dynamicBone: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  dynamicKeypoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
});