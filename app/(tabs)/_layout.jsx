import { Dimensions } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather, Octicons } from "@expo/vector-icons";
import { colors } from "../../contants";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarStyle: {
          backgroundColor: "#161622",
          borderTopColor: "#232533",
          borderTopWidth: 0,
          height: 68, // Adjust height to fit the icons properly
          paddingBottom: 0, // Ensure no extra padding at the bottom
          paddingTop: 8, // Remove extra padding at the top
        //  borderRadius: 15, // Rounded edges for modern UI
         // marginHorizontal: 10, // Margin to give space on the sides
         // position: "absolute", // Floating tab bar effect
         // bottom: 10, // Position it above the screen's bottom edge
          alignSelf: "center",
          width: "100%", // Width is 90% of the screen for centered layout
          justifyContent: "center", // Center content vertically
          alignItems: "center", // Center content horizontally
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8, // Elevation for shadow effect
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Octicons
              name="home"
              size={focused ? 26 : 24} // Slightly larger size for active icon
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "post",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AntDesign
              name="pluscircleo"
              size={focused ? 26 : 24} // Adjust active/inactive icon size
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="user"
              size={focused ? 26 : 24} // Adjust active/inactive icon size
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
