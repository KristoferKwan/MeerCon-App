import React from 'react';
import {Text } from 'native-base';
import AppListItem from './AppListItem';

type AvailableWifiItemType = {
  ssid: String;
  connect: (wifiname: String) => any;
}


export default function AvailableWifiItem(props: AvailableWifiItemType){
  const connectButton = (
    <Text>Connect</Text>
  )
  
  return (
    <AppListItem label={props.ssid} event={props.connect} eventParam={props.ssid} iconname="wifi" icontype="FontAwesome" button={connectButton}/>
    );
}