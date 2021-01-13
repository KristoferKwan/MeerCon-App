import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import {Icon} from 'native-base';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import Devices from '../screens/DeviceConnect';
import { BottomTabParamList, DevicesParamList } from '../types';


const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Devices"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="Devices"
        component={DevicesNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-code" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string }) {
  return <Icon style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const DevicesStack = createStackNavigator<DevicesParamList>();

function DevicesNavigator() {
  return (
    <DevicesStack.Navigator>
      <DevicesStack.Screen
        name="DevicesScreen"
        component={Devices}
        options={{ headerTitle: 'Devices Connect' }}
      />
    </DevicesStack.Navigator>
  );
}

