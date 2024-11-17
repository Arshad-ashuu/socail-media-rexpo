import { View, Text } from 'react-native';
import React from 'react';
import { Stack, Slot } from 'expo-router';

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ title: 'index',headerShown: false }} 
        
      />
      <Stack.Screen 
        name="(tabs)"
        options={{ headerShown: false }} // Hides header for tabs layout
      />
      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false }}
      />
      {/* <Slot /> Required for nested navigation */}
    </Stack>
  );
};

export default RootLayout;
