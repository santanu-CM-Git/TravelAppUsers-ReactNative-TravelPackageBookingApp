import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ActivityIndicator,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    Switch,
    Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { hambargar, userPhoto } from '../utils/Images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Logo from '../../src/assets/images/misc/logo.svg';

export default function CustomHeader({
    onPress,
    commingFrom,
    title,
    onPressProfile,
}) {
    // const { userInfo } = useContext(AuthContext)
    // console.log(userInfo?.photo)
    const navigation = useNavigation();
    const [userInfo, setuserInfo] = useState([])
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    

    useEffect(() => {
        
    }, [])
    useFocusEffect(
        React.useCallback(() => {
           
        }, [])
    )
    return (
        <>
            {commingFrom == 'Home' ?
                <>
                    <LinearGradient
                        colors={['#fff', '#fff']} // Example colors, replace with your desired gradient
                        style={styles.headerView}
                    >
                        <View style={styles.firstSection}>
                            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ width: 44, height: 44, borderRadius: 44 / 2, justifyContent: 'center', alignItems: 'center' }}>
                                {/* {userInfo?.photo ?
                                    <Image
                                        source={{ uri: userInfo?.photo }}
                                        style={styles.headerImage}
                                    /> : */}
                                <Image
                                    source={hambargar}
                                    style={styles.headerImage}
                                />
                                {/* } */}
                            </TouchableOpacity>
                            <Image
                                source={require('../assets/images/icon.png')}
                                style={{ height: responsiveHeight(3.5), width: responsiveWidth(25), resizeMode: 'contain', marginLeft: responsiveWidth(0) }}
                            />
                            {/* <Logo
                                width={responsiveWidth(30)}
                                height={responsiveHeight(3.5)}
                            //style={{transform: [{rotate: '-15deg'}]}}
                            /> */}
                        </View>
                        <View style={styles.secondSection}>
                            <TouchableOpacity onPress={() => navigation.navigate('TherapistList',{comingFrom:'search'})} style={{ marginRight: responsiveWidth(5) }}>
                                <Ionicons name="search-outline" size={28} color="#444343" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('WalletScreen')}>
                                <Ionicons name="wallet-outline" size={28} color="#444343" />
                                {/* <View style={styles.notificationdotView}>
                                    <Text style={styles.notificationdot}>{'\u2B24'}</Text>
                                </View> */}
                            </TouchableOpacity>
                        </View>

                    </LinearGradient>
                    <View style={styles.headerBottomMargin} />
                </>
                : commingFrom == 'chat' ?
                    <>
                        <View style={styles.chatPageheaderView}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="chevron-back" size={25} color="#FFF" />
                            </TouchableOpacity>
                            <Image
                                source={userPhoto}
                                style={styles.imageStyle}
                            />
                            <Text style={styles.chatPageheaderTitle}>{title}</Text>
                        </View>
                        <View style={styles.headerBottomMargin} />
                    </>
                    :
                    <>
                        <View style={styles.innerPageheaderView}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="chevron-back" size={25} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.innerPageheaderTitle}>{title}</Text>
                        </View>
                        <View style={styles.headerBottomMargin} />
                    </>
            }
        </>
    )
}

const styles = StyleSheet.create({
    headerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal:10,
        backgroundColor: '#377172',
        marginTop: -responsiveHeight(1),
        //paddingRight: responsiveWidth(10)
    },
    innerPageheaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    chatPageheaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#4B47FF'
    },
    innerPageheaderTitle: {
        color: '#2F2F2F',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 10
    },
    chatPageheaderTitle: {
        color: '#FFF',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 10
    },
    firstSection: {
        flexDirection: 'row',
        alignItems: 'center',
        //width: responsiveWidth(60),
        //backgroundColor: 'red'
    },
    secondSection: {
        flexDirection: 'row',
        //width: responsiveWidth(20),
        //backgroundColor: 'red'
    },
    headerImage: {
        width: 28,
        height: 28,
    },
    firstText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 10,
        color: '#FFFFFF'
    },
    secondText: {
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 10,
        color: '#F4F4F4'
    },
    notificationdotView: {
        position: 'absolute',
        top: -2,
        right: 0
    },
    notificationdot: {
        color: '#EB0000',
        fontSize: 12
    },
    headerBottomMargin: {
        borderBottomColor: '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        ...Platform.select({
            android: {
              elevation: 5, // Only for Android
            },
            ios: {
              shadowColor: '#000', // Only for iOS
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
            },
          }),
    },
    imageStyle: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        marginLeft: 5
    },
    switchStyle: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
    }
})