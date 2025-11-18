import React, { useContext, useMemo, useState, useEffect, memo, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    RefreshControl,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    StyleSheet,
    Alert,
    Dimensions,
    Pressable,
    BackHandler,
    Platform,
    TextInput,
    ImageBackground,
    StatusBar
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../../context/AuthContext';
import { getProducts } from '../../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../../store/cartSlice';
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, productImg, travelImg, likefillImg, mappinImg, starImg } from '../../../utils/Images';
import Loader from '../../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../../components/CustomHeader';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating-widget';
import SwitchSelector from "react-native-switch-selector";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function TopLocationScreen({ }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { logout } = useContext(AuthContext);
    // const { userInfo } = useContext(AuthContext)
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [locationList, setLocationList] = useState([])
    const [userInfo, setUserInfo] = useState([]);
    const [activeTab2, setActiveTab2] = useState('New Packages')
    const [activeButtonNo, setActiveButtonNo] = useState(0)

    const fetchProfileDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log(usertoken, 'usertoken')
            axios.post(`${API_URL}/customer/profile-details`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let userInfo = res.data.data;
                    console.log(userInfo, 'user data from contact informmation')
                    setUserInfo(userInfo)
                    fetchTopLocation(userInfo?.lat, userInfo?.long, userInfo?.country);
                })
                .catch(e => {
                    console.log(`Profile error from home page ${e}`)
                });
        });
    }

    const fetchTopLocation = async (latitude, longitude, countryName) => {
        try {
            const usertoken = await AsyncStorage.getItem('userToken');
            const flag = await AsyncStorage.getItem('selectedTab');
            if (!usertoken) {
                throw new Error('User token not found');
            }

            const option = {
                "lat": latitude,
                "long": longitude,
                "flag": flag || 'all_packages',
                "country": countryName,
            }
            console.log(option)
            const response = await axios.post(
                `${API_URL}/customer/top-location`,
                option,
                {
                    headers: {
                        "Authorization": `Bearer ${usertoken}`,
                        "Content-Type": 'application/json',
                    },
                }
            );

            let toplocation = response.data.data;
            console.log(toplocation, 'top location data from toplocation screen');

            setLocationList(toplocation);

        } catch (error) {
            console.log(`fetch Top Location error ${error}`);
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileDetails();
    }, []);

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

    const renderLocation = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('TopLocationScreenDetails', {
            location: item,
            country: userInfo?.country
        })}>
            <ImageBackground source={{ uri: item?.image_url }} style={styles.card} imageStyle={styles.imageStyle}>

                <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.overlay} />
                <View style={styles.textContainer}>
                    <Text
                        style={[styles.title, { maxWidth: '90%',flexShrink: 1, }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item?.location_name}
                    </Text>
                    <Text style={styles.activities}>{item?.active_packages_count} activities</Text>
                </View>

            </ImageBackground>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />  
            <CustomHeader commingFrom={'Top location'} onPress={() => navigation.goBack()} title={'Top location'} />

            <ScrollView>
                {/* <View style={{ paddingHorizontal: 15, marginVertical: responsiveHeight(1) }}>
                    <SwitchSelector
                        initial={activeButtonNo}
                        onPress={value => setActiveTab2(value)}
                        textColor={'#746868'}
                        selectedColor={'#FFFFFF'}
                        buttonColor={'#FF455C'}
                        backgroundColor={'#F4F5F5'}
                        borderWidth={0}
                        height={responsiveHeight(7)}
                        valuePadding={6}
                        hasPadding
                        options={[
                            { label: "New Packages", value: "New Packages", }, //images.feminino = require('./path_to/assets/img/feminino.png')
                            { label: "Near by", value: "Near by", }, //images.masculino = require('./path_to/assets/img/masculino.png')
                        ]}
                        testID="gender-switch-selector"
                        accessibilityLabel="gender-switch-selector"
                    />
                </View> */}
                {/* {activeTab2 == 'New Packages' ? */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: responsiveHeight(1) }}>
                    <FlatList
                        data={locationList}
                        keyExtractor={(item) => item.id}
                        renderItem={renderLocation}
                        contentContainerStyle={{ marginHorizontal: 10 }}
                        numColumns={2}
                    />
                </View>
                {/* :
                    <></>
                } */}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        //paddingTop: responsiveHeight(1),
    },
    card: {
        width: responsiveWidth(45),
        height: responsiveHeight(35),
        borderRadius: 15,
        overflow: "hidden",
        margin: 5,
    },
    imageStyle: {
        borderRadius: 15,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 15,
    },
    textContainer: {
        position: "absolute",
        bottom: 15,
        left: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    activities: {
        fontSize: 14,
        color: "#ddd",
    },


});