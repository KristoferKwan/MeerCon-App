import {createContext} from 'react';
import {DeviceType} from '../types'
import { BleManager } from 'react-native-ble-plx';



type DeviceContextType = {
  device: DeviceType;
  setDevice: (device: DeviceType) => void;
  manager: BleManager;
} | null

export const DeviceContext = createContext<DeviceContextType>(null)