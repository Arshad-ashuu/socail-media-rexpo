import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { colors } from '../../contants';
import { Feather } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';

const defaultProfilePic = 'https://avatar.iran.liara.run/public/19';

const Profile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserPosts(currentUser.uid);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

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
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId) => {
    setModalMessage('Are you sure you want to delete this post? This action cannot be undone.');
    setModalType('delete');
    setModalVisible(true);
  };

  const confirmDelete = (postId) => {
    try {
      setDeleting(true);
      deleteDoc(doc(db, 'posts', postId));
      setPosts(posts.filter(post => post.id !== postId));
      setModalMessage('Post deleted successfully');
      setModalType('info');
      setModalVisible(true);
    } catch (error) {
      console.error('Error deleting post:', error);
      setModalMessage('Error deleting post. Please try again.');
      setModalType('info');
      setModalVisible(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = () => {
    setModalMessage('Are you sure you want to sign out?');
    setModalType('signOut');
    setModalVisible(true);
  };

  const confirmSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/Signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleModalClose = (confirm) => {
    setModalVisible(false);
    if (confirm) {
      if (modalType === 'delete') {
        const postId = modalMessage.split('_')[1];
        confirmDelete(postId);
      } else if (modalType === 'signOut') {
        confirmSignOut();
      }
    }
  };

  const PostItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userContainer}>
          <Image
            source={{ uri: `https://avatar.iran.liara.run/username?username=${item.userName}` || defaultProfilePic }}
            style={styles.postProfilePic}
          />
          <View>
            <Text style={styles.username}>{item.userName || 'Anonymous'}</Text>
            <Text style={styles.timestamp}>{new Date(item.createdAt?.toDate()).toLocaleDateString()}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeletePost(item.id)}
          style={styles.deleteButton}
          disabled={deleting}
        >
          <Feather name="trash-2" size={20} color={'red'} />
        </TouchableOpacity>
      </View>

      {item.description && (
        <Text style={styles.postDesc}>{item.description}</Text>
      )}

      {item.imageURL && (
        <Image
          source={{ uri: item.imageURL }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
    </View>
  );

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: user?.photoURL || defaultProfilePic }}
            style={styles.profilePicLarge}
          />
          <Text style={styles.usernameTitle}>{user?.displayName || 'Guest'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'No email provided'}</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
    
        <View style={styles.postsContainer}>
          <Text style={styles.sectionTitle}>Your Posts</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <FlatList
              data={posts}
              renderItem={({ item }) => <PostItem item={item} />}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No posts to display</Text>
                </View>
              }
            />
          )}
        </View>
    
        {/* Modal for confirmation */}
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <Pressable
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => handleModalClose(true)}
              >
                <Text style={styles.modalButtonText}>
                  {modalType === 'delete' ? 'Delete' : modalType === 'signOut' ? 'Sign Out' : 'OK'}
                </Text>
              </Pressable>
              {modalType !== 'info' && (
                <Pressable
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => handleModalClose(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
    
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Dark background
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'black',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profilePicLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#444',
    marginBottom: 10,
  },
  usernameTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#BBBBBB',
    marginBottom: 15,
  },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  postContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  username: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  deleteButton: {
    padding: 5,
  },
  postDesc: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#BBBBBB',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
  modalConfirmButton: {
    backgroundColor: '#D32F2F',
  },
  modalCancelButton: {
    backgroundColor: '#444',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default Profile;
