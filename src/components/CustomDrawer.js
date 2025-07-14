import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  Switch
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_URL } from '@env'
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { userPhoto } from '../utils/Images';

const CustomDrawer = props => {
  const { logout } = useContext(AuthContext);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const [userInfo, setuserInfo] = useState([])
  const navigation = useNavigation();

  const fetchProfileDetails = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      //console.log(usertoken, 'usertoken')
      axios.post(`${API_URL}/patient/profile`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.data;
          //console.log(userInfo, 'user data from contact informmation')
          setuserInfo(userInfo)
        })
        .catch(e => {
          console.log(`Profile error ${e}`)
        });
    });
  }
  useFocusEffect(
    React.useCallback(() => {
      //fetchProfileDetails()
    }, [])
  )
  useEffect(() => {
    //fetchProfileDetails()
  }, [])
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: '#FFF' }}>
        <View style={{ backgroundColor: '#FFF', height: responsiveHeight(20), marginLeft: responsiveWidth(5), justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {userInfo?.profile_pic ?
              <Image
                source={{ uri: userInfo?.profile_pic + '?' + new Date() }}
                style={{ height: 60, width: 60, borderRadius: 40, marginBottom: 10, marginTop: 10, marginRight: 20 }}
              />
              :
              <Image
                source={userPhoto}
                style={{ height: 60, width: 60, borderRadius: 40, marginBottom: 10, marginTop: 10, marginRight: 20 }}
              />
            }
            <View style={{ flexDirection: 'column', marginLeft: 10,width: responsiveWidth(40)}}>
              <Text
                style={{
                  color: '#3A3232',
                  fontSize: 18,
                  fontFamily: 'Outfit-Medium',
                  marginBottom: 5,
                }}>
                {userInfo.name}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
                <Text
                  style={{
                    color: '#949494',
                    fontFamily: 'Roboto-Regular',
                    marginRight: 5,
                  }}>
                  Update Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* <View style={{ backgroundColor: '#FFFFFF', height: responsiveHeight(6), width: responsiveWidth(61), borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10,borderColor:'#E0E0E0',borderWidth:1 }}>
              <Text style={{ fontSize: 15, fontFamily: 'Outfit-Bold', marginLeft: 5, }}>Duty Status </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#339999' }}
                thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View> */}
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 10 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#ccc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => { logout() }} style={{ paddingVertical: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="exit-outline" size={22} color={'#000'} />
            <Text style={{ fontSize: 15, fontFamily: 'Poppins-Medium', marginLeft: 5, color: '#2D2D2D' }}>Sign Out</Text>
          </View>
        </TouchableOpacity>
        <View style={{ paddingVertical: 5 }}>
          <Text style={{ fontSize: responsiveFontSize(1.8), fontFamily: 'Outfit-Medium', color: '#949494' }}>Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

export default CustomDrawer;
