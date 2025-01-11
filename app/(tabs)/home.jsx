import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../contants'; // Ensure correct path to colors.js
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../../firebaseConfig'; // Firebase config file path
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'expo-router'; // For navigation
import { MaterialIcons } from '@expo/vector-icons';
import Story from '../Story';

// const defaultProfilePic = 'https://api.dicebear.com/9.x/notionists/svg?seed=Brooklynn'
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsCollection = collection(db, 'posts');
      const postsQuery = query(postsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(postsQuery);

      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/Signin');
      }
    });

    fetchPosts(); // Fetch posts initially

    return () => unsubscribeAuth(); // Cleanup
  }, [router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(); // Re-fetch posts
    setRefreshing(false);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.userNameText}>{auth.currentUser?.displayName || 'Guest'}</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (<>
            <Story/>
            <FlatList
              data={posts}
              style={styles.postList}
              renderItem={({ item }) => (
                <View style={styles.postContainer}>
                {/* User info */}
                <View style={styles.userContainer}>
                <Image source={{ uri: `https://avatar.iran.liara.run/username?username=${item.userName}`}} style={styles.profilePic} />

                  <View>
                    <Text style={styles.username}>{item.userName || 'Anonymous'}</Text>
                  </View>
                </View>
              <Text style={styles.postDesc}>{item.description}</Text> 
              <Image source={{ uri: item.imageURL }} style={styles.postImage} />

              </View>
              )}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={styles.emptyText}>No posts available</Text>}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
              }
            />
          </>
          )}
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  welcomeText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userNameText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 20,
  },
  postContainer: {
    marginBottom: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 15,
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
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.text,
  },
  timestamp: {
    color: colors.secondaryText,
    fontSize: 12,
  },
  postDesc: {
    fontSize: 14,
    color: colors.text,
    marginVertical: 10,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginVertical: 10,
  },
  interactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 5,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 20,
  },
  postList:{
    marginBottom: 60,
  },
});
