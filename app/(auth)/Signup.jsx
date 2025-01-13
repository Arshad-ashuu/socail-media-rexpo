import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { auth } from '../../firebaseConfig'; // Ensure firebase is initialized
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../../contants';

const Signup = () => {
  const [email, setEmail] = useState(''); // User's email
  const [password, setPassword] = useState(''); // User's password
  const [username, setUsername] = useState(''); // User's username (displayName)
  const [modalVisible, setModalVisible] = useState(false); // State for custom modal visibility
  const [modalMessage, setModalMessage] = useState(''); // Message for modal

  // Function to validate input fields
  const validateInput = () => {
    if (!email || !password || !username) {
      setModalMessage('Please fill out all fields.');
      setModalVisible(true);
      return false;
    }
    return true;
  };

  // Function to handle user signup
  const handleSignup = () => {
    if (!validateInput()) return;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // console.log('User', user);

        // Set the user's displayName (username) in Firebase Authentication
        updateProfile(user, {
          displayName: username,
        }).then(() => {
          // console.log('Display name set to:', username);

          setModalMessage('User registered successfully!');
          setModalVisible(true);
          setTimeout(() => router.replace('/Signin'), 1500); // Delay for redirect after showing the message
        }).catch((error) => {
          setModalMessage(error.message || 'An error occurred while setting display name.');
          setModalVisible(true);
        });

        // Clear input fields after successful signup
        setEmail('');
        setPassword('');
        setUsername('');
      })
      .catch((error) => {
        // Handle specific error codes
        if (error.code === 'auth/email-already-in-use') {
          setModalMessage('This email is already in use. Please log in or use a different email.');
        } else {
          setModalMessage(error.message || 'An error occurred during signup.');
        }
        setModalVisible(true);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.headerText}>Create Account</Text>
        
        {/* Username Input */}
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        
        {/* Email Input */}
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        
        {/* Password Input */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        
        {/* Sign Up Button */}
        <TouchableOpacity onPress={handleSignup} style={styles.signUpButton}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        
        {/* Login Redirect */}
        <TouchableOpacity onPress={() => router.replace('/Signin')} style={styles.loginRedirect}>
          <Text style={styles.linkText}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for showing messages */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <Pressable onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  formContainer: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#FF6347', // Custom button color
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginRedirect: {
    marginTop: 15,
  },
  linkText: {
    color: '#1E90FF', // Custom link color
    fontSize: 16,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#FF6347', // Custom button color for modal
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Signup;
