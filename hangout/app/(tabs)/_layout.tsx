import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/types';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconName;
  activeIcon: IoniconName;
}

const TABS: TabConfig[] = [
  { name: 'index',   title: 'Nearby',  icon: 'people-outline',      activeIcon: 'people' },
  { name: 'map',     title: 'Map',     icon: 'map-outline',          activeIcon: 'map' },
  { name: 'inbox',   title: 'Inbox',   icon: 'chatbubbles-outline',  activeIcon: 'chatbubbles' },
  { name: 'crews',   title: 'Crews',   icon: 'layers-outline',       activeIcon: 'layers' },
  { name: 'host',    title: 'Host',    icon: 'star-outline',         activeIcon: 'star' },
  { name: 'points',  title: 'Points',  icon: 'flash-outline',        activeIcon: 'flash' },
  { name: 'profile', title: 'Profile', icon: 'person-outline',       activeIcon: 'person' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
