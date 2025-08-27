import React, { useContext, useState, useEffect,useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    StyleSheet,
    Dimensions,
    Alert,
    Linking,
    BackHandler
} from 'react-native';

import { AuthContext } from '../../../context/AuthContext';

import { useDispatch, useSelector } from 'react-redux';
import { emailIcon, facebookIcon, instagramIcon, linkedinIcon, whatsappIcon, youtubeIcon } from '../../../utils/Images';
import Loader from '../../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../../components/CustomHeader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const instaURL = 'https://www.instagram.com/myjoie.app/';

const facebookURL = 'https://www.facebook.com/profile.php?id=61564987316705';

const linkedinURL = 'https://www.linkedin.com/company/myjoie'

export default function CustomerSupport({  }) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { userInfo } = useContext(AuthContext)

    const [activeSections, setActiveSections] = useState([]);
    const [collapsed, setCollapsed] = useState(true);
    const [getFaq, setFaq] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [getAllData, setAllData] = useState([])

    const openLink = async (url) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', `Unable to open URL: ${url}`);
        }
    };

    if (isLoading) {
        return (
            <Loader />
        )
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

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Support'} title={'Support'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <ScrollView style={styles.wrapper}>
                {/* <Text style={styles.header}>Talk to us</Text> */}
                <Text style={{ color: '#746868', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7), lineHeight: responsiveHeight(2.5) }}>You can contact us for more support on the  </Text>
                <Text style={{ color: '#FF455C', fontFamily: 'Poppins-Medium', fontSize: responsiveFontSize(2), lineHeight: responsiveHeight(2.5) }}>nevaeh.simmons@example.com</Text>
                {/* <View style={{ flexDirection: 'row', marginTop: responsiveHeight(4), }}>
                    <View style={{ width: responsiveWidth(20), }}>
                        <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#EFFBF7', justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={whatsappIcon}
                                style={{ height: 20, width: 20, resizeMode: 'contain', }}
                            />
                        </View>
                    </View>
                    <View style={{ width: responsiveWidth(70), }}>
                        <Text style={{ color: '#746868', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>ZERO Wait Time</Text>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(1.7), lineHeight: responsiveHeight(2.5) }}>Connect on Whatsapp</Text>
                        <Text style={{ color: '#746868', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>Our customer team is dedicated to helping you out</Text>
                    </View>
                </View> */}
                {/* <View style={{ borderBottomColor: '#E3E3E3', borderBottomWidth: 1, marginHorizontal: 10, marginTop: responsiveHeight(4) }} />
                <View style={{ flexDirection: 'row', marginTop: responsiveHeight(2), }}>
                    <View style={{ width: responsiveWidth(20), }}>
                        <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#FFFAEC', justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={emailIcon}
                                style={{ height: 20, width: 20, resizeMode: 'contain', }}
                            />
                        </View>
                    </View>
                    <View style={{ width: responsiveWidth(70), }}>
                        <Text style={{ color: '#746868', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>Get in touch with us</Text>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(1.7), lineHeight: responsiveHeight(2.5) }}>corporate@myjoie.app</Text>
                        <Text style={{ color: '#746868', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>We value your feedback</Text>
                    </View>
                </View> */}


            </ScrollView>

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: responsiveHeight(1)
    },
    wrapper: {
        padding: 20,
        //paddingBottom: responsiveHeight(2)
    },
    header: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },

});