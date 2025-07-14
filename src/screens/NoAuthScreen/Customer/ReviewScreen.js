import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, filterImg, likefillImg, mappinImg, phoneColor, plusIconstickyImg, productImg, starImg, timeImg, tourImg, uncheckedImg, userImg } from '../../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating-widget';
import InputField from '../../../components/InputField';
import CustomButton from '../../../components/CustomButton';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import CheckBox from '@react-native-community/checkbox';
import SelectMultiple from 'react-native-select-multiple'
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { AuthContext } from '../../../context/AuthContext';


const ReviewScreen = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [starCount, setStarCount] = useState(5)
    const [address, setaddress] = useState('');
    const [addressError, setaddressError] = useState('')

    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
               navigation.goBack()
               return true
              };
          
              const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction,
              );
          
              return () => backHandler.remove();
        }, [navigation])
    );
    const submitForm = () => {
        if (address == '') {
            Toast.show({
                type: 'error',
                text1: '',
                text2: "Please write some review.",
                position: 'top',
                topOffset: Platform.OS == 'ios' ? 55 : 20
            });
        } else {
            const option = {
                "agent_id": route?.params?.agentId,
                "message": address,
                "star": starCount
            }
            setIsLoading(true)
            AsyncStorage.getItem('userToken', (err, usertoken) => {
                axios.post(`${API_URL}/customer/review-submit`, option, {
                    headers: {
                        Accept: 'application/json',
                        "Authorization": `Bearer ${usertoken}`,
                    },
                })
                    .then(res => {
                        //console.log(res.data)
                        if (res.data.response == true) {
                            setIsLoading(false)
                            Toast.show({
                                type: 'success',
                                text1: '',
                                text2: "Review uploaded successfully.",
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
                            navigation.navigate('Home')
                        } else {
                            //console.log('not okk')
                            setIsLoading(false)
                            Alert.alert('Oops..', "Something went wrong.", [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                { text: 'OK', onPress: () => console.log('OK Pressed') },
                            ]);
                        }
                    })
                    .catch(e => {
                        setIsLoading(false)
                        console.log(`user register error ${e}`)
                        console.log(e.response)
                        Alert.alert('Oops..', e.response?.data?.message, [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    });
            });
        }

    }

    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
               navigation.goBack()
               return true
              };
          
              const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction,
              );
          
              return () => backHandler.remove();
        }, [navigation])
    );

    if (isLoading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Review'} onPress={() => navigation.goBack()} title={'Review'} />
            <ScrollView showsHorizontalScrollIndicator={false}>
                <View style={{ marginBottom: responsiveHeight(5), alignSelf: 'center', marginTop: responsiveHeight(2) }}>
                    <Text style={{ fontSize: responsiveFontSize(2), color: '#1B2234', fontFamily: 'Poppins-SemiBold', textAlign: 'center', marginTop: responsiveHeight(2) }}>How do you like our service ?</Text>
                    <View style={{ alignSelf: 'center', width: responsiveWidth(50), marginTop: responsiveHeight(2) }}>
                        <StarRating
                            disabled={false}
                            maxStars={5}
                            rating={starCount}
                            selectedStar={(rating) => setStarCount(rating)}
                            fullStarColor={'#FFCB45'}
                            starSize={30}
                            starStyle={{ marginHorizontal: responsiveWidth(1) }}
                        />
                    </View>
                    <View style={{ marginTop: responsiveHeight(1) }}>
                        <InputField
                            label={'Enter your review...'}
                            keyboardType="default"
                            value={address}
                            helperText={addressError}
                            inputType={'address'}
                            inputFieldType={'address'}
                            onChangeText={(text) => {
                                setaddress(text)
                            }}
                        />
                    </View>
                    <View style={styles.buttonwrapper}>
                        <CustomButton label={"Submit Review"}
                            onPress={() => submitForm()}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    )
}

export default ReviewScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 10,
        marginHorizontal: 15,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    timeimage: {
        width: 15,
        height: 15,
        resizeMode: 'contain'
    },
    detailsContainer: {
        marginLeft: 10,
        flex: 1,
    },
    title: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
        color: '#000000',
    },
    dateContainer: {
        backgroundColor: '#e6f4ea',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        flexDirection: 'row',
        position: "absolute",
        top: 5,
        right: 5
    },
    dateText: {
        color: '#009955',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
    },
    duration: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#555',
    },
    statsContainer: {
        flexDirection: 'row',
        //justifyContent: 'space-between',
        marginTop: 5,
    },
    statsText: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#FF455C',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    stickyimage: {
        height: responsiveHeight(8),
        width: responsiveWidth(40),
        //resizeMode:'contain'
    }
});
