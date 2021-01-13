import React from 'react';
import { Text } from 'native-base';
import { DeviceItemType } from '../../types';
import AppListItem from './AppListItem';

export default function DeviceConnectItem(props: DeviceItemType){
  
  const connectButton = (
    <Text>Connect</Text>
  )
  
  return (
    <AppListItem label={props.deviceName} eventParam={props.device} event={props.connect} iconname="video-camera" icontype="FontAwesome" button={connectButton}/>
    );
}