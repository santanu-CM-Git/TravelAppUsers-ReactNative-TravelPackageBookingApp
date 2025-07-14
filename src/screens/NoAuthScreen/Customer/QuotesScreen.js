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


const QuotesScreen = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);
    const [pageno, setPageno] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [quoteList, setQuoteList] = useState([])

    const fetchMyQuoteRequest = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }
            const response = await axios.post(`${API_URL}/customer/request-quotes-mine`, {}, {
                params: {
                    page
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            const responseData = response.data.data.data;
            //console.log(responseData, 'session historyy')
            setQuoteList(prevData => page === 1 ? responseData : [...prevData, ...responseData]);
            if (responseData.length === 0) {
                setHasMore(false); // No more data to load
            }
        } catch (error) {
            console.log(`Fetch session history error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchMyQuoteRequest(pageno);
    }, [fetchMyQuoteRequest, pageno]);

    useFocusEffect(
        useCallback(() => {
            setQuoteList([]);
            setPageno(1);
            setHasMore(true); // Reset hasMore on focus
            fetchMyQuoteRequest(1);
        }, [fetchMyQuoteRequest])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setQuoteList([]);
        setPageno(1);
        setHasMore(true); // Reset hasMore on focus
        fetchMyQuoteRequest(1);
        setRefreshing(false);
    }, []);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPageno(prevPage => prevPage + 1);
        }
    };

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.loaderContainer}>
                <Loader />
            </View>
        );
    };
    const renderQuote = ({ item }) => {

        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('QuotesListScreen',{quoteId: item?.id})}>
                <View style={styles.cardContainer}>
                    <Image source={{ uri: item?.location_data?.image_url }} style={styles.image} />
                    <View style={styles.detailsContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.title}>{item?.location}</Text>

                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={timeImg} style={[styles.timeimage, { marginRight: 5 }]} />
                            <Text style={styles.duration}>
                                {(() => {
                                    const start = moment(item.sdate);
                                    const end = moment(item.edate);
                                    const days = end.diff(start, 'days');
                                    const nights = days > 0 ? days - 1 : 0;
                                    return `${days} Days ${nights} Nights`;
                                })()}
                            </Text>
                        </View>
                        <View style={styles.statsContainer}>
                            <Image source={userImg} style={[styles.timeimage, { marginRight: 5 }]} />
                            <Text style={styles.statsText}> Total Adult: {item?.edults}</Text>
                            <Text style={styles.statsText}> Total Kids: {item?.kids}</Text>
                        </View>

                    </View>
                    <View style={styles.dateContainer}>
                        <Image source={calendarImg} style={[styles.timeimage, { marginRight: 5 }]} />
                        <Text style={styles.dateText}>{moment(item?.sdate).format('DD MMM YYYY')}</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    };
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.goBack();
                return true; // Prevents default back behavior
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
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
            <CustomHeader commingFrom={'My request'} onPress={() => navigation.goBack()} title={'My request'} />
            <ScrollView showsHorizontalScrollIndicator={false}>

                <FlatList
                    data={quoteList}
                    renderItem={renderQuote}
                    keyExtractor={(item) => item.id.toString()}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={10}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF455C" colors={['#FF455C']} />
                    }
                />
            </ScrollView>
            {/* <View style={{ position: 'absolute', right: 0, bottom: 0,}}>
                <TouchableOpacity onPress={() => navigation.navigate('QuotesListScreen')}>
                    <Image source={plusIconstickyImg} style={styles.stickyimage} />
                </TouchableOpacity>
            </View> */}
        </SafeAreaView >
    )
}

export default QuotesScreen

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
        marginVertical: 5,
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
