import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router'; // For navigation
import { colors } from '../../contants';

const defaultProfilePic = 'https://placekitten.com/200/200';

const Profile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null); // To store user data
  const [posts, setPosts] = useState([]); // To store user's posts
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();

  // Fetch user data when the component mounts
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserPosts(currentUser.uid);
    }
  }, []);

  // Fetch the posts of the logged-in user
  const fetchUserPosts = async (userId) => {
    try {
      const postsCollection = collection(db, 'posts');
      const userPostsQuery = query(postsCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(userPostsQuery);

      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(userPosts);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching user posts:', error);
      setModalMessage('Error fetching posts. Please try again later.');
      setModalVisible(true);
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out');
        router.replace('/Signin'); // Navigate to Signin screen after sign out
      })
      .catch((error) => {
        console.log('Sign out error:', error);
        setModalMessage('Error: There was an issue signing out. Please try again.');
        setModalVisible(true);
      });
  };

  const PostItem = ({ item }) => (
    <View style={styles.postContainer}>
      {/* User info */}
      <View style={styles.userContainer}>
        <Image source={{ uri: item.userProfilePic || defaultProfilePic }} style={styles.profilePic} />
        <View>
          <Text style={styles.username}>{item.userName || 'Anonymous'}</Text>

        </View>
      </View>

      {/* Post description */}
      {item.description && <Text style={styles.postDesc}>{item.description}</Text>}

      {/* Post image */}
      {item.imageURL && <Image source={{ uri: item.imageURL }} style={styles.postImage} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        {/* Profile Picture */}
        {user && user.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.profilePic} />
        ) : (
          <Image source={{ uri: 'https://avatar.iran.liara.run/public/19' }} style={styles.profilePicuser} />
        )}

        {/* Username */}
        <Text style={styles.username}>{user ? user.displayName : 'Guest'}</Text>

        {/* Sign Out Button */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* User's Posts */}
      <View style={styles.postsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6347" />
        ) : posts.length > 0 ? (
          <FlatList
            data={posts}
            renderItem={({ item }) => <PostItem item={item} />}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>No posts available</Text>}
          />
        ) : (
          <Text style={styles.emptyText}>No posts available.</Text>
        )}
      </View>

      {/* Modal for success/error messages */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
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

  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    padding: 10,
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: '#ff6347', // Tomato color for sign out button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postsContainer: {
    marginTop: 30,
  },
  postContainer: {
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  profilePicuser: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 10,
  },
  postDesc: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalMessage: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
