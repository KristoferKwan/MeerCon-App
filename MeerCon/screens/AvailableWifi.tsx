import React, {useEffect, useState, useContext} from 'react';
import { Container, Header, Content, Spinner, View, H2, Form, Item, Input, Button, Body, Text, Right, StyleProvider, Left, Title, Icon, Label, Subtitle } from 'native-base';
import {StyleSheet } from 'react-native'
import AvailableWifiItem from '../components/ListItem/AvailableWifiItem'
import { Base64 } from 'react-native-ble-plx';
import {DeviceContext} from '../context/DeviceContext'
import Modal from 'react-native-modal';
import getTheme from '../native-base-theme/components';
import material from '../native-base-theme/variables/material';
import base64 from 'react-native-base64';

const styles = StyleSheet.create({
  container: {
    width: "100%",
    margin: 0
  },
  title: {
    color: "#3AAFA9",
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10 
  },
  form: {
    backgroundColor: "#f7f7f7",
    paddingTop: 30
  },
  formHeader: {
    backgroundColor: "#FFF",
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#7E7E7E",
  },
  modal: {
    width: "100%",
    margin: 0,
    marginTop: 20
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 15
  },
  input: {
    backgroundColor: "#FFF"
  }
})

type AvailableWifiListType = {
  wifiList: String[];
  connect: (wifiname: String) => any;
}

type WifiFormType = {
  isModalVisible: boolean;
  toggleModal: () => void;
  pw: String;
  changePw: (e:String) => void;
  connect: () => void; 
}

function WifiForm(props:WifiFormType){
  return (
    <Modal style={styles.modal} avoidKeyboard={false} swipeDirection="up" coverScreen={true} hasBackdrop={true} isVisible={props.isModalVisible}> 
    <Container style={styles.container}>
      <Header>
        <Button transparent onPress={() => props.toggleModal()}>
        <Icon type="MaterialIcons" active name="arrow-back"/>
        </Button>
        <Body>
          <Title style={styles.modalTitle}>
            Enter Password
          </Title>
        </Body>
        <Button transparent onPress={() => props.connect()}> 
          <Text>Connect</Text>
        </Button>
      </Header>
      <Content style={styles.form}>
        <Form>
        <Item regular last style={styles.input}>
          <Label>Password</Label>
          <Input secureTextEntry={true} onChangeText={(text) => props.changePw(text)} value={props.pw.toString()}/>
        </Item>
        </Form>
        <Text style={{color: "#2B7A77"}}>Please enter the password for the selected Wifi</Text>
      </Content>
      </Container>
    </Modal>
  );
}

function AvailableWifiList({ wifiList, connect }:AvailableWifiListType) {
  return (
  <View>
  {
    wifiList.map(wifi => (
    <AvailableWifiItem key={wifi.toString()} ssid={wifi} connect={connect}/>
    ))
  }
  </View> 
  )
}

export default function AvailableWifi(){
  const [wifiList, setWifiList] = useState<String[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [wifi, setWifi] = useState<String | null>(null);
  const [pw, setpw] = useState<String>("");
  const [info, setInfo] = useState<any>("");
  const [error, setError] = useState<String>("");
  const serviceUUID = "d2884631-92ad-4aa1-b362-7e1329f7d990"
  const getWifiListUUID = "322e774f-c909-49c4-bd7b-48a4003a967f"
  const changeWifiUUID = "4116f8d2-9f66-4f58-a53d-fc7440e7c14e"

  useEffect(() => {
    console.log(info)
  }, [info])

  useEffect(() => {
    console.log(error)
  }, [error])

  const bluetoothContext = useContext(DeviceContext)

  const getAvailableWifi = async () => {
    if(bluetoothContext){
      const device = bluetoothContext.device
      let characteristic:any;
      if(device){
        characteristic = await device.readCharacteristicForService(serviceUUID, getWifiListUUID)
        const readWifi = JSON.parse(base64.decode(characteristic.value))
        setInfo(readWifi)
        setWifiList(readWifi)
      }
    }
  }

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const changePw = (e:String) => {
    setpw(e)
    console.log(pw)
  } 

  useEffect(() => {
    getAvailableWifi()
  }, [])

  const connect = (wifiname: String) => {
    setWifi(wifiname)
    toggleModal()
  }
  
  const wifiConnect = async () => {
    if(bluetoothContext){
      const device = bluetoothContext.device
      let characteristic:any;
      if(device){
        const cmd:Base64 = base64.encode(wifi + " " + pw)
        await device.writeCharacteristicWithResponseForService(serviceUUID, changeWifiUUID, cmd)
        characteristic = await device.readCharacteristicForService(serviceUUID, changeWifiUUID)
        const res:any = JSON.parse(base64.decode(characteristic.value))
        setInfo(res)
        if(res.status === 400){
          alert(res.message)
        } 
      }
    }
    toggleModal()
  }
  
  return (
    <StyleProvider style={getTheme(material as any)}>
      <Container>
        <Header>
        </Header>
        <Content>
          <WifiForm isModalVisible={isModalVisible} toggleModal={toggleModal} pw={pw} changePw={changePw} connect={wifiConnect}/>
          <H2 style={styles.title}>Choose Available Wifi</H2>
          {wifiList.length == 0 ? <Spinner color="gray"/> : 
            <AvailableWifiList wifiList={wifiList} connect={connect} />
          }
        </Content>
      </Container>
    </StyleProvider>
    );
  }