import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from '../../firebaseConfig.js';
import { colors } from '../../contants';

const Signin = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleSignin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredentials) => {
                const user = userCredentials.user;
                // console.log(user);
                setModalMessage('User logged in successfully!');
                setModalVisible(true);
                setTimeout(() => router.replace("/home"), 1500); // Redirect after a short delay
            })
            .catch((error) => {
                console.log("Signin failed", error);
                setModalMessage("Invalid email or password");
                setModalVisible(true);
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Login</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    placeholder="Email"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                />
                <TouchableOpacity onPress={handleSignin} style={styles.signInButton}>
                    <Text style={styles.buttonText}>Sign in</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/Signup')} style={styles.signupLink}>
                    <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
    header: {
        marginTop: 50,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
    },
    formContainer: {
        marginTop: 40,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    signInButton: {
        backgroundColor: '#FF6347', // Your custom button color
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signupLink: {
        marginTop: 15,
        alignItems: 'center',
    },
    linkText: {
        color: '#1E90FF', // Custom link color
        fontSize: 16,
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

export default Signin;
