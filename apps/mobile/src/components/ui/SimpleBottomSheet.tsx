import React, { useImperativeHandle, forwardRef, useState, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { lightTheme } from '@/theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SimpleBottomSheetRef {
  expand: () => void;
  close: () => void;
}

interface SimpleBottomSheetProps {
  snapPoint?: string; // e.g. '75%'
  children: React.ReactNode;
  onClose?: () => void;
  scrollable?: boolean;
}

export const SimpleBottomSheet = forwardRef<SimpleBottomSheetRef, SimpleBottomSheetProps>(
  ({ snapPoint = '75%', children, onClose, scrollable = false }, ref) => {
    const [visible, setVisible] = useState(false);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    const sheetHeight = (parseFloat(snapPoint) / 100) * SCREEN_HEIGHT;

    const open = useCallback(() => {
      setVisible(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 200,
      }).start();
    }, [translateY]);

    const close = useCallback(() => {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onClose?.();
      });
    }, [translateY, onClose]);

    useImperativeHandle(ref, () => ({ expand: open, close }), [open, close]);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) {
            translateY.setValue(g.dy);
          }
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 100 || g.vy > 0.5) {
            close();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 25,
              stiffness: 200,
            }).start();
          }
        },
      })
    ).current;

    if (!visible) return null;

    const content = scrollable ? (
      <ScrollView
        style={{ maxHeight: sheetHeight - 40 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={{ maxHeight: sheetHeight - 40 }}>{children}</View>
    );

    return (
      <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={close}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.sheet,
              { height: sheetHeight, transform: [{ translateY }] },
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <View {...panResponder.panHandlers} style={styles.handleArea}>
                <View style={styles.handle} />
              </View>
              {content}
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: lightTheme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: lightTheme.border,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
