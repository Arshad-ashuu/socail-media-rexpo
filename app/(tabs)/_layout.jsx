import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather, Octicons } from "@expo/vector-icons";

const TabLayout = () => {
  return (
    <>
   
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFA001",
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarStyle: {
          backgroundColor: "#161622",
          borderTopWidth: 1,
          borderTopColor: "#232533",
          height: 70, // Increase height for better icon visibility
          paddingBottom: 10
        },
        tabBarShowLabel: false, // Set to false to hide labels, or set true to show both
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home" size={30} color={color} /> // Adjust size if needed
          )
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "post",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="pluscircleo" size={30} color={color} /> // Adjust size if needed
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={30} color={color} /> // Adjust size if needed
          )
        }}
      />
    </Tabs>
    </>
  );
};

export default TabLayout;
