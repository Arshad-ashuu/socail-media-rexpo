import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { auth } from '../firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { colors } from '../contants';

const index = () => {

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/home'); // Redirect if user is logged in
      }
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../assets/logo3.png')} 
        resizeMode="cover"
        style={{ width: 400, height: 500, marginBottom: -30 }}
        />
        <Text style={styles.headerText}>Welcome to Explore</Text>
        <Text style={styles.subText}>Discover the world around you</Text>
        
        <TouchableOpacity 
          onPress={() => router.replace('/Signup')} 
          style={styles.button}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Dark background
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff', // Light text for header
    marginBottom: 10,
  },
  subText: {
    fontSize: 18,
    color: '#bbb', // Lighter text for subheader
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary, // Custom button color
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default index;
