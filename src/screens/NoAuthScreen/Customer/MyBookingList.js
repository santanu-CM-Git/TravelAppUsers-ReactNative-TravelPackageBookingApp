import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, ImageBackground, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, likefillImg, mappinImg, phoneColor, plusIconstickyImg, productImg, starImg, timeImg, tourImg, uncheckedImg, userImg } from '../../../utils/Images'
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { AuthContext } from '../../../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

const MyBookingList = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const [activeTab, setActiveTab] = useState('Upcomming')
    const tabs = [
        { label: 'Upcoming', value: 'Upcomming' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
    ];

    const fetchBookings = async (status) => {
        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await axios.post(
                `${API_URL}/customer/booking-list`,
                { status: status.toLowerCase() },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            if (response.data.response) {
                console.log("booking list", response.data.data);
                setBookings(response.data.data);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message || 'Failed to fetch bookings',
                });
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Something went wrong',
            });
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBookings(activeTab);
    }, [activeTab]);

    useEffect(() => {
        fetchBookings(activeTab);
    }, [activeTab]);

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

    const formatNumber = (num) => {
        if (num >= 100000) {
            return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L'; // Lakhs
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
        }
        return num.toString(); // Less than 1000
    };

    const renderBookingCard = (item) => {
        console.log("item", item);
        const getStatusColor = () => {
            switch (activeTab) {
                case 'Upcoming':
                    return '#FF455C';
                case 'Completed':
                    return '#4BB04D';
                case 'Cancelled':
                    return '#FF0004';
                default:
                    return '#FF455C';
            }
        };

        const getStatusText = () => {
            switch (activeTab) {
                case 'Upcoming':
                    return 'messages';
                case 'Completed':
                    return 'Completed';
                case 'Cancelled':
                    return 'Cancelled';
                default:
                    return 'messages';
            }
        };

        return (
            <Pressable
                onPress={() => navigation.navigate('MyBookingDetails', { bookingId: item })}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
                <ImageBackground
                    source={item?.package?.cover_photo_url ? { uri: item?.package?.cover_photo_url } : productImg}
                    style={styles.card}
                    imageStyle={styles.imageStyle}
                >
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.overlay} />
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{item?.package?.location || 'Jammu-Kashmir'}</Text>
                        {item?.rating !== null && item?.rating !== undefined && item?.rating !== 0 && (
                        <View style={styles.rateingView}>
                            <Image
                                source={starImg}
                                style={[styles.staricon, { marginTop: -5 }]}
                            />
                                <Text style={styles.ratingText}>{item.rating}</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.priceText}>₹{formatNumber(item.final_amount)}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                {activeTab === 'Upcomming' ? (
                                    <TouchableOpacity
                                        style={[styles.buttonView, { backgroundColor: '#FF455C', marginRight: 8, elevation: 10 }]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            navigation.navigate('ChatScreen', { agentId: item?.agent?.id });
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Messages</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={[styles.buttonView, { backgroundColor: getStatusColor() }]}>
                                        <Text style={styles.buttonText}>{getStatusText()}</Text>
                                    </View>
                                )}

                            </View>
                        </View>
                    </View>
                </ImageBackground>
                <View style={styles.tagTextView4}>
                    <View style={styles.dateContainer}>
                        <Image source={calendarImg} tintColor={'#FFFFFF'} style={[styles.timeimage, { marginRight: 5 }]} />
                        <Text style={styles.dateText}>{moment(item.start_date).format('DD MMM YYYY')}</Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    if (isLoading && !refreshing) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'My booking'} onPress={() => navigation.goBack()} title={'My booking'} />
            <View style={styles.tabView}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View style={styles.tabContainer}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.value}
                                onPress={() => setActiveTab(tab.value)}
                                style={[
                                    styles.tab,
                                    activeTab === tab.value && styles.activeTab,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === tab.value && styles.activeTabText,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
            <View style={{flex:1, marginHorizontal: 10,marginBottom:responsiveHeight(1) }}>
            {bookings.length > 0 ? (
                <FlatList
                    data={bookings}
                    renderItem={({ item }) => renderBookingCard(item)}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    numColumns={2}
                    contentContainerStyle={{ justifyContent: 'center', paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListFooterComponent={<View style={{ height: 20 }} />}
                />
            ) : (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No {activeTab.toLowerCase()} bookings found</Text>
                </View>
            )}
            </View>
        </SafeAreaView>
    );
};

export default MyBookingList;

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    tabView: {
        paddingHorizontal: 15,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
        width: responsiveWidth(92)
    },
    tab: {
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderColor: '#FF455C',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveHeight(5),
        width: responsiveWidth(28)
    },
    activeTab: {
        backgroundColor: '#FF455C',
        borderColor: '#FF455C',
        borderWidth: 1
    },
    tabText: {
        color: '#FF455C',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    activeTabText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    card: {
        width: responsiveWidth(45),
        height: responsiveHeight(35),
        borderRadius: 15,
        overflow: "hidden",
        margin: 5,
    },
    textContainer: {
        position: "absolute",
        bottom: 15,
        left: 15,
    },
    imageStyle: {
        borderRadius: 15,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    tagTextView4: {
        paddingVertical: 2,
        paddingHorizontal: 5,
        position: 'absolute',
        top: responsiveHeight(2),
        left: responsiveWidth(3),
        borderRadius: 8
    },
    dateContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.70)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        flexDirection: 'row',
    },
    dateText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
    },
    timeimage: {
        width: 15,
        height: 15,
        resizeMode: 'contain'
    },
    rateingView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    staricon: {
        height: 15,
        width: 15,
        resizeMode: 'contain'
    },
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#FFFFFF',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
    },
    priceText: {
        fontSize: responsiveFontSize(2),
        color: '#FF455C',
        fontFamily: 'Poppins-Bold',
    },
    buttonText: {
        fontSize: responsiveFontSize(1.6),
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
    },
    buttonView: {
        padding: 5,
        borderRadius: 5,
        marginLeft: responsiveWidth(3)
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    noDataText: {
        fontSize: responsiveFontSize(2),
        color: '#666',
        fontFamily: 'Poppins-Medium',
    }
});
