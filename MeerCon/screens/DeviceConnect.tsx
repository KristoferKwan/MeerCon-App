import React, {useEffect, useState, useContext} from 'react';
import { Container, Header, Content, Spinner, View, H2} from 'native-base';
import {StyleSheet} from 'react-native'
import DeviceConnectItem from '../components/ListItem/DeviceConnectItem'
import { BleManager, Device } from 'react-native-ble-plx';
import { DeviceContext } from '../context/DeviceContext';

const styles = StyleSheet.create({
  title: {
    color: "#3AAFA9",
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10 
  }
})

type DeviceListType = {
  devices: Device[];
  connect: (device: Device) => any;
}

function DevicesList({ devices, connect }:DeviceListType) {
  return (
    <View>
    {
      devices.map(device => (
        <DeviceConnectItem key={device.localName?.toString()} device={device} deviceName={device.localName} connect={connect}/>
      ))
    }
    </View> 
  )
}

export default function DevicesConnect({ navigation }:any){
  const [info, setInfo] = useState("")
  const [error, setError] = useState("")
  const [devices, setDevices] = useState<Device[]>([])
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false);
  const bluetoothContext = useContext(DeviceContext)
  const maxTime:Number = 30

  useEffect(() => {
    scanAndConnect()
  }, [])

  useEffect(() => {
    let interval:any = null
    if(isActive) {
      interval = setInterval(tick, 1000);
    } else if (!isActive && seconds !== 0){
      clearInterval(interval)
    }
    return function cleanup() {
      clearInterval(interval)
    }
  })

  useEffect(() => {
    console.log(info)
  }, [info])

  const tick = () => {
    setSeconds(seconds + 1)
    // console.log(seconds)
  }

  const scanAndConnect = () => {
    setIsActive(true)
    setInfo("Scanning...")
    console.log("Scanning...")
    bluetoothContext?.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setError(error.message);
        console.log("error")
        console.log(JSON.stringify(error))
        bluetoothContext?.manager.stopDeviceScan()
        setIsActive(false)
        return
      }
      if(seconds > maxTime){
        console.log(seconds)
        alert("time is up")
        bluetoothContext?.manager.stopDeviceScan()
      }

      if (device && device.name && device.localName && device.localName.search("MeerConCam") != -1) {
        setInfo("Connecting to MeerConCam device")
        bluetoothContext?.manager.stopDeviceScan()
        setDevices([...devices, device])
      }
    });
  }

  const connect = (device: Device) => {
    device.connect()
    .then((device) => {
      setInfo("Discovering services and characteristics")
      return device.discoverAllServicesAndCharacteristics()
    }).then((device) => {
      setInfo("Listening...")
      bluetoothContext?.setDevice(device)
      navigation.navigate('AvailableWifi')
      return device
    }, (error) => {
      setError(error)
      console.error(error)
    })
  }   
  return (
      <Container>
        <Header>
        </Header>
        <Content>
          <H2 style={styles.title}>Choose Device</H2>
          {devices.length == 0 ? <Spinner color="gray"/> : 
            <DevicesList devices={devices} connect={connect}/>
          }
        </Content>
      </Container>
    );
  }