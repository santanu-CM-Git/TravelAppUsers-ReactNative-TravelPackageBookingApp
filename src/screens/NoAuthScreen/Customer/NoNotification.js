import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, StatusBar, BackHandler, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useFocusEffect,useNavigation } from '@react-navigation/native';
// import { notificationImg, notifyImg } from '../../utils/Images'

const NoNotification = ({ }) => {
    const navigation = useNavigation();
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
    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />  
            <CustomHeader commingFrom={'Notification'} onPress={() => navigation.goBack()} title={'Notification'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: responsiveHeight(15) }}>
                    {/* <Image source={notificationImg} style={styles.iconImage} tintColor={'#339999'} /> */}
                    <Text style={{ color: '#3A3232', fontFamily: 'Poppins-Medium', fontSize: responsiveFontSize(2), marginVertical: responsiveHeight(2) }}>No Notification Yet</Text>
                    <Text style={{ color: '#949494', fontFamily: 'Poppins-Medium', fontSize: responsiveFontSize(2), textAlign: 'center' }}>No Notification right now. notifications about your activity will show up here</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}


export default NoNotification


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrapper: {
        padding: 20,
        marginBottom: responsiveHeight(1),
        flex: 3,
    },
    iconImage: {
        height: responsiveHeight(30),
        width: responsiveWidth(30),
        resizeMode: 'contain'
    }

});