import React from 'react';
import {Button, ListItem, Text, Icon, Left, Body, Right } from 'native-base';
import { AppItemType } from '../../types';

export default function AppListItem(props: AppItemType){
    return (
      <ListItem icon>
        <Left>
          <Button style={{ backgroundColor: "#3AAFA9" }}>
            <Icon type={props.icontype} active name={props.iconname.toString()} />
          </Button>
        </Left>
        <Body>
          <Text>{props.label}</Text>
        </Body>
        <Right>
          <Button primary transparent onPress={() => {
            props.event(props.eventParam)
          }
          }>
            {props.button}
          </Button>
        </Right>
      </ListItem>
    );
}