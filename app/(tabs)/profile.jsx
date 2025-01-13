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
  const [modalType, setModalType] = useState(''); // To distinguish between delete and sign out modal
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserPosts(currentUser.uid); // Fetch posts for the authenticated user
      } else {
        setUser(null); // Set user to null if not authenticated
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
      setModalMessage('Error fetching posts. Please try again later.');
      setModalVisible(true);
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
      setModalMessage('Error signing out. Please try again.');
      setModalType('info');
      setModalVisible(true);
    }
  };

  const handleModalClose = (confirm) => {
    setModalVisible(false);
    if (confirm) {
      if (modalType === 'delete') {
        const postId = modalMessage.split('_')[1]; // Get postId from message
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
          <View style={{flex:1, flexDirection: 'column'}}>
          <Text style={styles.username}>{item.userName || 'Anonymous'}</Text>
          <Text style={{color:'gray'}}>{new Date(item.createdAt?.toDate()).toLocaleDateString()}</Text>
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
      <View
        style={{marginTop: 10, flexDirection: 'row', padding:8}}
      
      >
      <Feather
        name={"heart"}
        size={24}
        color={colors.text}
        style={{color: colors.text}}
      />
      <Text style={{color: colors.text, marginLeft: 8,marginTop:2}}>
        {item.likes?.length || 0}
      </Text>
      </View>
      
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: user?.displayName || defaultProfilePic }}
          style={styles.profilePicLarge}
        />

        <Text style={styles.usernameTitle}>{user?.displayName || 'Guest'}</Text>

        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postsContainer}>
        <Text style={styles.sectionTitle}>Your Posts</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={posts}
            renderItem={({ item }) => <PostItem item={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="image" size={48} color={colors.secondaryText} />
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Modal for messages */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => handleModalClose(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => handleModalClose(true)}
                style={[styles.closeButton, { backgroundColor: 'white' }]}
              >
                <Text style={[styles.closeButtonText, { color: '#000' }]}>{modalType === 'signOut' ? 'Sign Out' : 'Delete'}</Text>
              </Pressable>
            </View>
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
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profilePicLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  usernameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  signOutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  postContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    padding: 8,

  },
  postDesc: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: colors.secondaryText,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker semi-transparent overlay
  },
  modalContent: {
    backgroundColor: 'rgba(18, 18, 18, 0.95)', // Almost black with slight transparency
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  modalMessage: {
    fontSize: 16,
    color: '#F5F5F5', // Light text for contrast
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#1E90FF', // A bright blue for better visibility
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Profile;
