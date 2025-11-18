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
    StatusBar,
    ImageBackground,
    KeyboardAwareScrollView
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../../context/AuthContext';
import { getProducts } from '../../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, productImg, travelImg, likefillImg, mappinImg, starImg, arrowBackImg, shareImg, calendarImg, CheckImg, addnewImg, mybookingMenuImg, transactionMenuImg, arrowRightImg, cancelTourImg } from '../../../utils/Images';
import Loader from '../../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../../components/CustomHeader';
import InputField from '../../../components/InputField';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating-widget';
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Entypo';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function TransactionScreen({  }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { logout } = useContext(AuthContext);
    // const { userInfo } = useContext(AuthContext)
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [transactionList, setTransactionList] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [pageno, setPageno] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [startDay, setStartDay] = useState(moment().format('YYYY-MM-DD'));
    const [endDay, setEndDay] = useState(null);
    const [markedDates, setMarkedDates] = useState({});

    const toggleCalendarModal = () => {
        setCalendarModalVisible(!isCalendarModalVisible);
    }
    // const handleDayPress = (day) => {
    //     if (startDay && !endDay) {
    //         const date = {}
    //         for (const d = moment(startDay); d.isSameOrBefore(day.dateString); d.add(1, 'days')) {
    //             //console.log(d,'vvvvvvvvvv')
    //             date[d.format('YYYY-MM-DD')] = {
    //                 marked: true,
    //                 color: 'black',
    //                 textColor: 'white'
    //             };

    //             if (d.format('YYYY-MM-DD') === startDay) {
    //                 date[d.format('YYYY-MM-DD')].startingDay = true;
    //             }
    //             if (d.format('YYYY-MM-DD') === day.dateString) {
    //                 date[d.format('YYYY-MM-DD')].endingDay = true;
    //             }
    //         }

    //         setMarkedDates(date);
    //         setEndDay(day.dateString);
    //     }
    //     else {
    //         setStartDay(day.dateString)
    //         setEndDay(null)
    //         setMarkedDates({
    //             [day.dateString]: {
    //                 marked: true,
    //                 color: 'black',
    //                 textColor: 'white',
    //                 startingDay: true,
    //                 endingDay: true
    //             }
    //         })
    //     }

    // }


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
    const fetchTransactionHistory = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }

            const params = {
                page
            };

            const response = await axios.post(`${API_URL}/customer/transaction`, {}, {
                params,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            const responseData = response.data.data.data;
            console.log(responseData, 'transaction historyy')
            setTransactionList(prevData => page === 1 ? responseData : [...prevData, ...responseData]);
            if (responseData.length === 0) {
                setHasMore(false); // No more data to load
            }
        } catch (error) {
            console.log(`Fetch transaction history error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, []);

    const dateRangeSearch = () => {
        setTransactionList([]);
        setPageno(1);
        setHasMore(true);
        fetchTransactionHistory(1);
        toggleCalendarModal();
    };

    useEffect(() => {
        fetchTransactionHistory(pageno);
    }, [fetchTransactionHistory, pageno]);

    useFocusEffect(
        useCallback(() => {
            setTransactionList([]);
            setPageno(1);
            setHasMore(true); // Reset hasMore on focus
            fetchTransactionHistory(1);
        }, [fetchTransactionHistory])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTransactionList([]);
        setPageno(1);
        setHasMore(true); // Reset hasMore on focus
        fetchTransactionHistory(1);
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

    const renderTransactionHistory = ({ item }) => {
        return (
            <View style={styles.itemContainer}>
                <Image source={{ uri: item?.agent?.profile_photo_url }} style={styles.avatar} />
                <View style={styles.detailsContainer}>
                    <Text style={styles.name}>{item?.agent?.name}</Text>
                    <Text style={styles.message}>{item?.purpose}</Text>
                    <Text style={styles.time}>
                        {moment(item?.created_at).isSame(moment(), 'day')
                            ? `Today, ${moment(item?.created_at).format('hh:mm A')}`
                            : moment(item?.created_at).format('DD MMMM YYYY, hh:mm A')}
                    </Text>
                </View>
                <Text style={[styles.amount, item?.type == "credit" ? styles.negative : styles.positive]}>
                    {item?.type == "credit" ? `- ₹${Math.abs(item?.amount)}` : ` ₹${item?.amount}`}
                </Text>
            </View>
        )
    };


    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />  
            <CustomHeader commingFrom={'Account'} onPress={() => navigation.goBack()} title={'Account'} />
            {/* <View style={{ marginHorizontal: 15, }}>
                <Text style={styles.productText3}>Filter By Date</Text>
            </View>
            <View style={styles.bookingContainer}>
                <TouchableOpacity style={styles.bookingDatePicker} onPress={() => toggleCalendarModal()}>
                    <FontAwesome name="calendar" size={16} color="#FF455C" />
                    <Text style={styles.bookingDateText}>
                    {!endDay || moment(startDay).isSame(endDay, 'day')
                                ? moment(startDay).format('DD MMM, YYYY')
                                : `${moment(startDay).format('DD MMM, YYYY')} - ${moment(endDay).format('DD MMM, YYYY')}`}
                    </Text>
                </TouchableOpacity>
            </View> */}
            <View style={{ marginHorizontal: 15, }}>
                <Text style={styles.productText3}>Transaction</Text>
            </View>
            {/* <FlatList
                data={chatData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Image source={item.image} style={styles.avatar} />
                        <View style={styles.detailsContainer}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.message}>{item.message}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                        <Text style={[styles.amount, item.amount < 0 ? styles.negative : styles.positive]}>
                            {item.amount < 0 ? `-$${Math.abs(item.amount)}` : `$${item.amount}`}
                        </Text>
                    </View>
                )}
            /> */}
            <FlatList
                data={transactionList}
                renderItem={renderTransactionHistory}
                keyExtractor={(item) => item.id.toString()}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']} />
                }
            />
            {/* calender modal */}
            {/* <Modal
                isVisible={isCalendarModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ height: '70%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>
                        <View style={{ marginBottom: responsiveHeight(3) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Select your date</Text>
                                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                    <Icon name="cross" size={20} color="#000000" onPress={toggleCalendarModal} />
                                </View>
                            </View>
                            <Calendar
                                onDayPress={(day) => {
                                    handleDayPress(day)
                                }}
                                //monthFormat={"yyyy MMM"}
                                //hideDayNames={false}
                                markingType={'period'}
                                markedDates={markedDates}
                                theme={{
                                    selectedDayBackgroundColor: '#FF4B5C',
                                    selectedDayTextColor: 'white',
                                    monthTextColor: '#FF4B5C',
                                    textMonthFontFamily: 'Poppins-Medium',
                                    dayTextColor: 'black',
                                    textMonthFontSize: 18,
                                    textDayHeaderFontSize: 16,
                                    arrowColor: '#2E2E2E',
                                    dotColor: 'black'
                                }}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#E3EBF2',
                                    borderRadius: 15,
                                    height: responsiveHeight(50),
                                    marginTop: 20,
                                    marginBottom: 10
                                }}
                            />
                            <View style={styles.buttonwrapper2}>
                                <CustomButton label={"Apply"} onPress={() => { dateRangeSearch() }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal> */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        //paddingTop: responsiveHeight(1),
    },

    productText3: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        marginTop: responsiveHeight(1),
    },
    bookingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    bookingDatePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    bookingDateText: {
        fontSize: responsiveFontSize(1.5),
        color: "#686868",
        fontFamily: 'Poppins-Medium',
        marginLeft: 5
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 5,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: 10,
    },
    name: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Medium',
        color: '#333',
    },
    message: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#555',
    },
    time: {
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Regular',
        color: '#999',
    },
    amount: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'Poppins-Medium',
    },
    positive: {
        color: 'green',
    },
    negative: {
        color: 'red',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});