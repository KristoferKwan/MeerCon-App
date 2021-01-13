import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, {useState} from 'react';
import { ColorSchemeName } from 'react-native';

import NotFoundScreen from '../screens/NotFoundScreen';
import { RootStackParamList, DeviceType } from '../types';
import DevicesConnect from '../screens/DeviceConnect';
import AvailableWifi from '../screens/AvailableWifi';
import Devices from '../screens/Devices';
import BottomTabNavigator from './BottomTabNavigator';
import { DeviceContext } from '../context/DeviceContext';
import { Device, BleManager } from 'react-native-ble-plx';


// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const [device, setDevice] = useState<DeviceType>(null)
  const [manager, setManager] = useState(() => new BleManager())
  const setSelectedDevice = (device: DeviceType) => {
    setDevice(device)
  }

  return (
    <DeviceContext.Provider
      value={
        {
          device: device,
          manager: manager,
          setDevice: setSelectedDevice 
        }
      }>
      <NavigationContainer
        theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </NavigationContainer>
    </DeviceContext.Provider>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="DevicesConnect" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DevicesConnect" component={DevicesConnect} />
      <Stack.Screen name="Devices" component={Devices} />
      <Stack.Screen name="AvailableWifi" component={AvailableWifi} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
