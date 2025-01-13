import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../contants';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../../firebaseConfig';
import { collection, getDocs, orderBy, query, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

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
        likes: doc.data().likes || [],
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

    fetchPosts();

    return () => unsubscribeAuth();
  }, [router]);

  const handleLike = async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    const isLiked = post.likes.includes(userId);

    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== userId)
              : [...post.likes, userId]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderPost = ({ item }) => {
    const isLiked = item.likes?.includes(auth.currentUser?.uid);
    
    return (
      <View style={styles.postContainer}>
        <View style={styles.userContainer}>
          <Image 
            source={{ uri: `https://avatar.iran.liara.run/username?username=${item.userName}`}} 
            style={styles.profilePic}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.userName || 'Anonymous'}</Text>
            <Text style={styles.timestamp}>{new Date(item.createdAt?.toDate()).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <Text style={styles.postDesc}>{item.description}</Text>
        
        {item.imageURL && (
          <Image 
            source={{ uri: item.imageURL }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.interactions}>
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={() => handleLike(item.id)}
            activeOpacity={1}
          >
            <Feather 
              name={isLiked ? "heart" : "heart"} 
              size={24} 
              color={isLiked ? colors.primary : colors.text}
              style={styles.likeIcon}
            />
            <Text style={[styles.likeCount, isLiked && styles.likedCount]}>
              {item.likes?.length || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.userNameText}>{auth.currentUser?.displayName || 'Guest'}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            style={styles.postList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="inbox" size={48} color={colors.secondaryText} />
                <Text style={styles.emptyText}>No posts available</Text>
              </View>
            }
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  userNameText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500',
  },
  postList: {
    flex: 1,
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  timestamp: {
    color: '#888',
    fontSize: 13,
  },
  postDesc: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.border,
  },

  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  likeIcon: {
    marginRight: 6,
    // color: colors.text,
  },
  likeCount: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  likedCount: {
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
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
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Home;