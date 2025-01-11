import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

const stories = [
  { id: '1', image: 'https://placekitten.com/100/100', user: 'User1' },
  { id: '2', image: 'https://placekitten.com/101/100', user: 'User2' },
  { id: '3', image: 'https://placekitten.com/102/100', user: 'User3' },
  
  
];
const Story = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.storyItem}>
            <Image source={{ uri: item.image }} style={styles.storyImage} />
            <Text style={styles.storyUser}>{item.user}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,

  },
  storyImage: {
    backgroundColor: '#fff',

    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ff8501',
  },
  storyUser: {
    marginTop: 5,
    fontSize: 12,
    color: '#fff',
  },
});

export default Story;
