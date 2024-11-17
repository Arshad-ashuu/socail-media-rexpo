import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, Card, IconButton } from 'react-native-paper';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { auth, db } from '../../firebaseConfig'; // Replace with your Firebase config file path
import { collection, addDoc } from 'firebase/firestore';
import { colors } from '../../contants';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/djhqjeifo/image/upload';
const UPLOAD_PRESET = 'expo-project';

const Post = () => {
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (!result.didCancel) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const uploadToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const submitPost = async () => {
    if (!description.trim() || !imageUri) {
      Alert.alert('Error', 'Please add a description and select an image.');
      return;
    }

    setLoading(true);
    try {
      const imageURL = await uploadToCloudinary(imageUri);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently logged in.');
      }

      const postData = {
        userId: currentUser.uid,
        description,
        imageURL,
        userName: currentUser.displayName,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'posts'), postData);

      Alert.alert('Success', 'Your post has been uploaded.');
      setDescription('');
      setImageUri(null);
    } catch (error) {
      console.error('Post submission failed:', error);
      Alert.alert('Error', 'Failed to upload post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Create a New Post</Text>
<KeyboardAvoidingView>

      <TextInput
        placeholder="Write a description"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor={'#fff'}
        style={styles.input}
      />

      <Card style={styles.imageCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No image selected</Text>
            <IconButton icon="image-plus" size={30} onPress={pickImage} />
          </View>
        )}
      </Card>
      <Button mode="contained" onPress={pickImage} style={styles.pickImageButton} icon="image">
        Choose Image
      </Button>

      <Button
        mode="contained"
        onPress={submitPost}
        style={styles.submitButton}
        icon="send"
        loading={loading}
      >
        {loading ? 'Posting...' : 'Post'}
      </Button>
</KeyboardAvoidingView>

    </SafeAreaView>
  );
};


export default Post;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color:'#fff',
    backgroundColor: colors.cardBackground,
    borderColor: colors.gold,
  },
  imageCard: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    elevation: 3,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
  },
  pickImageButton: {
    marginBottom: 16,
    backgroundColor: '#6c63ff',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
});

