import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/AppStore';

export default function Index() {
  const { state } = useAppStore();

  if (!state.isOnboarded) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Redirect href={'/onboarding' as any} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Redirect href={'/(tabs)/dashboard' as any} />;
}
