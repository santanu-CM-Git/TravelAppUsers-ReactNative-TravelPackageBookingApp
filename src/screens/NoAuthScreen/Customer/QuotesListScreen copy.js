import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, CheckImg, filterImg, likefillImg, mappinImg, phoneColor, plusIconstickyImg, productImg, searchIconImg, starImg, timeImg, tourImg, uncheckedImg, userImg } from '../../../utils/Images'
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



const QuotesListScreen = ({ navigation, route }) => {


    const [isLoading, setIsLoading] = useState(false)
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [starCount, setStarCount] = useState(5)
    const [refreshing, setRefreshing] = useState(false);
    const [pageno, setPageno] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [quoteList, setQuoteList] = useState([])


    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const [pricevalues, setPriceValues] = useState([5000, 25000]);
    const [distancevalues, setDistanceValues] = useState([0, 25000]);

    const fetchMyQuoteRequest = useCallback(async (page = 1) => {
        console.log(route?.params?.quoteId);
        
        try {
            setLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }
            const response = await axios.post(`${API_URL}/customer/suggested-quotes`, {}, {
                params: {
                    page,
                    request_quotes_id: route?.params?.quoteId
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            const responseData = response.data.data.request_quotes_lead;
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
    const formatNumber = (num) => {
        if (num >= 100000) {
            return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L'; // Lakhs
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
        }
        return num.toString(); // Less than 1000
    };
    const renderQuote = ({ item }) => {
        const documentArray = JSON.parse(item?.package.document);
        return (
            <View style={styles.productSection}>
                <View style={styles.topAstrologerSection}>
                    <View style={styles.totalValue4}>
                        <Image
                            source={{ uri: item?.package?.cover_photo_url }}
                            style={styles.productImg4}
                        />
                        <View style={{ margin: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                <Text style={styles.productText4}>{item?.package?.name}</Text>
                                <Text style={styles.productText5}>{item?.agent?.name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(0.5) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        source={mappinImg}
                                        style={styles.pinImg}
                                    />
                                    <Text style={styles.addressText}>{item?.package?.location}</Text>
                                </View>
                                <Text style={styles.priceText2}>₹{formatNumber(item?.package?.discounted_price)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                <Image
                                    source={userImg}
                                    style={styles.pinImg}
                                    tintColor={'#686868'}
                                />
                                <Text style={styles.packageAvlText}>Total Passengers : {item?.package?.seat_slots}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        source={timeImg}
                                        style={styles.pinImg}
                                    />
                                    <Text style={styles.packageAvlText}>
                                        {(() => {
                                            const start = moment(item?.package?.start_date);
                                            const end = moment(item?.package?.end_date);
                                            const days = end.diff(start, 'days');
                                            const nights = days > 0 ? days - 1 : 0;
                                            return `${days} Days ${nights} Nights`;
                                        })()}
                                    </Text>
                                </View>
                                <View style={styles.rateingView}>
                                    <Image
                                        source={starImg}
                                        style={[styles.staricon, { marginTop: -5 }]}
                                    />
                                    <Text style={styles.ratingText}>{item?.rating}</Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    borderBottomColor: '#686868',
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    marginVertical: 5
                                }}
                            />
                            <Text style={styles.productText6}>Required documents</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {documentArray.map((item, index) => (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 10 }}>
                                        <Image
                                            source={CheckImg}
                                            style={styles.checkicon}
                                        />
                                        <Text style={styles.packageAvlText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        {/* <View style={styles.tagTextView3}>
                            <Image
                                source={likefillImg}
                                style={styles.likeImg}
                                tintColor={"#FFFFFF"}
                            />
                        </View> */}
                        <View style={styles.tagTextView4}>
                            <View style={styles.dateContainer}>
                                <Image source={calendarImg} tintColor={'#FFFFFF'} style={[styles.timeimage, { marginRight: 5 }]} />
                                <Text style={styles.dateText}>{moment(item?.package?.start_date).format('DD MMM YYYY')}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
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
            <CustomHeader commingFrom={'List of quotes'} onPress={() => navigation.goBack()} title={'List of quotes'} />
            <ScrollView showsHorizontalScrollIndicator={false}>
                <View style={styles.searchSection}>
                    <View style={styles.searchInput}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={searchIconImg}
                                style={styles.searchIcon}
                            />
                            <Text style={styles.placeholderText}>Search</Text>
                        </View>
                        <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <Image
                                source={filterImg}
                                style={[styles.filterIcon, { marginRight: 5 }]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={{ alignSelf: 'center' }}>
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
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold',marginTop: responsiveHeight(5) }}>No quotes found</Text>
                        }
                    />
                </View>
            </ScrollView>
            <Modal
                isVisible={isFilterModalVisible}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '60%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Filter</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={toggleFilterModal} />
                            </View>
                        </View>
                    </View>
                    {/* <ScrollView style={{ marginBottom: responsiveHeight(0) }} > */}
                    <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5 }}>
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Price</Text>
                        <View style={styles.slidercontainer}>
                            <MultiSlider
                                values={pricevalues}
                                sliderLength={responsiveWidth(80)}
                                onValuesChange={setPriceValues}
                                min={5000}
                                max={25000}
                                step={100}
                                selectedStyle={{ backgroundColor: "#FF455C" }}
                                unselectedStyle={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
                                markerStyle={{ backgroundColor: "#FF455C" }}
                            />
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>₹{pricevalues[0]}</Text>
                                <Text style={styles.valueText}>₹{pricevalues[1]}</Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Rating</Text>
                        <View style={{ width: responsiveWidth(50), marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
                            <StarRating
                                disabled={false}
                                maxStars={5}
                                rating={starCount}
                                selectedStar={(rating) => setStarCount(rating)}
                                fullStarColor={'#FFCB45'}
                                starSize={28}
                                starStyle={{ marginHorizontal: responsiveWidth(1) }}
                            />
                        </View>
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Distance</Text>
                        <View style={styles.slidercontainer}>
                            <MultiSlider
                                values={distancevalues}
                                sliderLength={responsiveWidth(80)}
                                onValuesChange={setPriceValues}
                                min={5000}
                                max={25000}
                                step={100}
                                selectedStyle={{ backgroundColor: "#FF455C" }}
                                unselectedStyle={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
                                markerStyle={{ backgroundColor: "#FF455C" }}
                            />
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{distancevalues[0]} KM</Text>
                                <Text style={styles.valueText}>{distancevalues[1]} KM</Text>
                            </View>
                        </View>
                    </View>
                    {/* </ScrollView> */}
                    <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                            <CustomButton label={"Apply"}
                                onPress={() => submitForFilter()}
                            />
                        </View>
                    </View>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        </SafeAreaView>
    )
}

export default QuotesListScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    productSection: {
        marginTop: responsiveHeight(0),
        //marginLeft: 20
    },
    topAstrologerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    totalValue4: {
        width: responsiveWidth(90),
        //height: responsiveHeight(45),
        //alignItems: 'center',
        backgroundColor: '#fff',
        //justifyContent: 'center',
        padding: 5,
        borderRadius: 15,
        elevation: 5,
        margin: 2,
        marginBottom: responsiveHeight(2),
        marginRight: 5
    },
    productImg4: {
        height: responsiveHeight(21),
        width: responsiveFontSize(42),
        resizeMode: 'cover',
        borderRadius: 15,
        alignSelf: 'center'
    },
    productText4: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.8),
        marginTop: responsiveHeight(1),
    },
    productText5: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
        marginTop: responsiveHeight(1),
    },
    productText6: {
        color: '#1B2234',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.8),
    },
    pinImg: {
        height: 15,
        width: 15,
        resizeMode: 'contain',
        marginRight: 5
    },
    addressText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
    },
    travelerText: {
        color: '#FF455C',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
    },
    priceText2: {
        color: '#FF455C',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2),
    },
    packageAvlText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.4),
    },
    rateingView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    staricon: {
        height: 15,
        width: 15,
        resizeMode: 'contain'
    },
    checkicon: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
    },
    tagTextView3: {
        paddingVertical: 2,
        paddingHorizontal: 5,
        position: 'absolute',
        top: responsiveHeight(3),
        right: responsiveWidth(5),
        borderRadius: 8
    },
    likeImg: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },
    tagTextView4: {
        position: 'absolute',
        top: responsiveHeight(16),
        right: responsiveWidth(5),
    },
    tagText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    searchSection: {
        paddingHorizontal: 15,
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(2)
    },
    searchInput: {
        height: responsiveHeight(6),
        width: responsiveWidth(92),
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 26,
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
    searchIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginHorizontal: 8
    },
    placeholderText: {
        color: "#1B2234",
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
    },
    filterIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
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
    slidercontainer: {
        alignItems: "center",
        marginTop: responsiveHeight(0),
        marginBottom: responsiveHeight(1),
        marginLeft: -10
    },
    valueContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: responsiveWidth(90),
        marginTop: responsiveHeight(0),
    },
    valueText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: '#000'
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});
