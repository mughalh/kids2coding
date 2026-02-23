import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ViewProps,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  style?: any;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  style,
  ...props
}) => {
  const Container = safeArea ? SafeAreaView : View;
  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  useEffect(() => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      try {
        document.activeElement.blur();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <Container style={[styles.container, style]} {...props}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent={false}
      />
      {content}
    </Container>
  );
};

// Blur any focused element on mount (web) to avoid aria-hidden focus conflicts
// when navigating or hiding overlays. This helps prevent the browser warning
// "Blocked aria-hidden on an element because its descendant retained focus.".

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
  },
});