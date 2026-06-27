import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Let's take a breath</Text>
          <Text style={styles.message}>
            Something went astray on our side, not yours.
            {'\n'}Have another go in a moment and we'll have it sorted.
          </Text>
          <Button variant="secondary" size="md" onPress={this.handleReset}>
            Try again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    backgroundColor: lightTheme.background,
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '300',
    color: lightTheme.text,
  },
  message: {
    fontSize: 14,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
