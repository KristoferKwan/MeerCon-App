import { Device } from "react-native-ble-plx";

export type RootStackParamList = {
  DevicesConnect: undefined;
  Devices: undefined;
  AvailableWifi: undefined;
  Root: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  Devices: undefined;
};

export type DevicesParamList = {
  DevicesScreen: undefined;
};

export type DeviceItemType = {
  device: Device;
  deviceName: String | null | string;
  connect: (device: Device) => any;
}

export type DeviceType = Device | null

export type AppItemType = {
  label: String | string | null;
  eventParam: any;
  event: (eventParam: any) => any;
  iconname: String;
  icontype: "AntDesign" | "Entypo" | "EvilIcons" | "Feather" | "FontAwesome" | "FontAwesome5" | "Foundation" | "Ionicons" | "MaterialCommunityIcons" | "MaterialIcons" | "Octicons" | "SimpleLineIcons" | "Zocial" | undefined;
  button: any;
}