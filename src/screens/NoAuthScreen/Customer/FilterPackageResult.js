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
    ActivityIndicator
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../../context/AuthContext';
import { getProducts } from '../../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../../store/cartSlice';
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, filterImg, productImg, travelImg, likefillImg, mappinImg, starImg, arrowBackImg, shareImg, calendarImg } from '../../../utils/Images';
import Loader from '../../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../../components/CustomHeader';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Entypo';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function FilterPackageResult({ route }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { logout } = useContext(AuthContext);
    // const { userInfo } = useContext(AuthContext)
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [starCount, setStarCount] = useState(4)
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [locationList, setLocationList] = useState([]);
    const [filteredLocationList, setFilteredLocationList] = useState([]);
    const [userInfo, setUserInfo] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [pageno, setPageno] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pricevalues, setPriceValues] = useState([5000, 25000]);
    const [loadingWishlist, setLoadingWishlist] = useState({});

    const onChangeFromDate = (event, selectedDate) => {
        setShowFromDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
        if (selectedDate) setFromDate(selectedDate);
    };

    const onChangeToDate = (event, selectedDate) => {
        setShowToDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
        if (selectedDate) setToDate(selectedDate);
    };
    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

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
                    // fetchTopLocationDetails(userInfo?.country);
                })
                .catch(e => {
                    console.log(`Profile error from home page ${e}`)
                });
        });
    }

    const fetchTopLocationDetails = useCallback(async (page = 1, filters = {}) => {
        try {
            setLoading(true);
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                throw new Error('User token not found');
            }

            const option = {
                ...route?.params.filters, // This will include all params passed from home screen
            }
            console.log('Fetching data for page:', page, 'with options:', option);
            const response = await axios.post(
                `${API_URL}/customer/filter`,
                option,
                {
                    headers: {
                        "Authorization": `Bearer ${usertoken}`,
                        "Content-Type": 'application/json',
                    },
                    params: {
                        page,
                    },
                }
            );
            const responseData = response.data.data.data;
            console.log('Received data for page:', page, 'Data length:', responseData.length);
            console.log(JSON.stringify(responseData),'responseData')
            if (page === 1) {
                setLocationList(responseData);
            } else {
                setLocationList(prevData => [...prevData, ...responseData]);
            }

            if (responseData.length < perPage) {
                setHasMore(false);
                console.log('No more data available');
            }

        } catch (error) {
            console.log(`fetch Top Location error ${error}`);
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    }, [perPage, route?.params]);

    const handleLoadMore = () => {
        if (!loading && hasMore && userInfo?.country && locationList.length > 0) {
            console.log('Loading more data for page:', pageno + 1);
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

    useEffect(() => {
        console.log(route?.params.filters,'route?.params.filters')
        fetchProfileDetails();
    }, []);

    useEffect(() => {
        if (pageno > 1) {
            fetchTopLocationDetails(pageno);
        }
    }, [pageno]);

    useEffect(() => {
        // Initial data fetch when component mounts
        fetchTopLocationDetails(1);
    }, []);

    useEffect(() => {
        setFilteredLocationList(locationList);
    }, [locationList]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === '') {
            setFilteredLocationList(locationList);
        } else {
            const filtered = locationList.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase()) ||
                item.location.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredLocationList(filtered);
        }
    };

    const handleWishlist = async (packageId) => {
        try {
            setLoadingWishlist(prev => ({ ...prev, [packageId]: true }));
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                Alert.alert('Error', 'Please login to add to wishlist');
                return;
            }

            const response = await axios.post(
                `${API_URL}/customer/wishlist-create`,
                { package_id: packageId },
                {
                    headers: {
                        "Authorization": `Bearer ${usertoken}`,
                        "Content-Type": 'application/json',
                    },
                }
            );

            if (response.data.response == true) {
                setLocationList(prevList =>
                    prevList.map(item =>
                        item.id === packageId
                            ? { ...item, wishlist: !item.wishlist }
                            : item
                    )
                );
            }
        } catch (error) {
            console.log('Wishlist error:', error);
            Alert.alert('Error', 'Failed to update wishlist');
        } finally {
            setLoadingWishlist(prev => ({ ...prev, [packageId]: false }));
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('PackageDetailsScreen', { packageId: item.id })}>
                <View style={styles.productSection}>
                    <View style={styles.topAstrologerSection}>
                        <View style={styles.totalValue4}>
                            <Image
                                source={{ uri: item?.cover_photo_url }}
                                style={styles.productImg4}
                            />
                            <View style={{ margin: 5 }}>
                                <Text style={styles.productText4} numberOfLines={1}>{item?.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        source={mappinImg}
                                        style={styles.pinImg}
                                    />
                                    <Text style={styles.addressText} numberOfLines={1}>{item?.location}</Text>
                                </View>
                                <Text style={styles.travelerText} numberOfLines={1}>{item?.agent?.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                    {item?.date_type == 0 ?
                                        <Text style={styles.addressText}>Slots : {item?.seat_slots - item?.booked_slots}</Text>
                                        : null}
                                    <Text style={[styles.priceText2,{textAlign: 'right', flex: 1 }]}>₹{formatNumber(item?.discounted_price)}</Text>
                                </View>
                                <View
                                    style={{
                                        borderBottomColor: '#686868',
                                        borderBottomWidth: StyleSheet.hairlineWidth,
                                        marginVertical: 5
                                    }}
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {item?.date_type == 0 ?
                                        <Text style={styles.packageAvlText}>
                                            {(() => {
                                                const start = moment(item.start_date);
                                                const end = moment(item.end_date);
                                                const days = end.diff(start, 'days');
                                                const nights = days > 0 ? days - 1 : 0;
                                                return `${days} Days ${nights} Nights`;
                                            })()}
                                        </Text> :
                                        <Text style={styles.packageAvlText}>
                                            {item?.itinerary.length} Days {item?.itinerary.length - 1} Nights
                                        </Text>
                                    }
                                    {item?.rating !== null && item?.rating !== undefined && item?.rating !== 0 && (
                                        <View style={styles.rateingView}>
                                            <Image
                                                source={starImg}
                                                style={[styles.staricon, { marginTop: -5 }]}
                                            />
                                            <Text style={styles.ratingText}>{item?.rating}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.tagTextView3}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleWishlist(item.id);
                                }}
                                disabled={loadingWishlist[item.id]}
                            >
                                {loadingWishlist[item.id] ? (
                                    <ActivityIndicator size="small" color="#FF455C" />
                                ) : (
                                    <Image
                                        source={likefillImg}
                                        style={styles.likeImg}
                                        tintColor={item?.wishlist ? "#FF455C" : "#FFFFFF"}
                                    />
                                )}
                            </TouchableOpacity>
                            {item?.date_type == 0 ?
                                <View style={styles.tagTextView4}>
                                    <View style={styles.dateContainer}>
                                        <Image source={calendarImg} tintColor={'#FFFFFF'} style={[styles.timeimage, { marginRight: 5 }]} />
                                        <Text style={styles.dateText}>{moment(item?.start_date).format('DD MMM YYYY')}</Text>
                                    </View>
                                </View> : null}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    const renderEmptyComponent = () => {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No data found</Text>
            </View>
        )
    }

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Packages'} onPress={() => navigation.goBack()} title={'Packages'} />
            <View style={styles.mainContainer}>
                {/* <View style={styles.searchSection}>
                    <View style={styles.searchInput}>
                        <View style={{ flexDirection: 'row', alignItems: "center", flex: 1 }}>
                            <Image
                                source={searchIconImg}
                                style={styles.searchIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Search"
                                placeholderTextColor="#888"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                        <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <Image
                                source={filterImg}
                                style={[styles.filterIcon, { marginRight: 5 }]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                </View> */}
                <FlatList
                    data={locationList}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmptyComponent}
                    contentContainerStyle={{ margin: 13, paddingBottom: responsiveHeight(5) }}
                    numColumns={2}
                    removeClippedSubviews={true}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    mainContainer: {
        flex: 1,
    },
    background: {
        width: '100%',
        height: 300,  // Adjust height as needed
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        marginTop: -responsiveHeight(0.5)
    },
    imageStyle: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    header: {
        position: 'absolute',
        top: 35,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
        color: '#FFFFFF',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    likeButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    filterButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    filterIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
    },
    likeIcon: {
        height: 22,
        width: 22,
        resizeMode: 'contain'
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
    productSection: {
        marginTop: responsiveHeight(0),
        //marginLeft: 20
    },
    //product section
    topAstrologerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    totalValue4: {
        width: responsiveWidth(45),
        height: responsiveHeight(35),
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
        height: responsiveHeight(16),
        width: responsiveFontSize(21),
        resizeMode: 'cover',
        borderRadius: 15,
        alignSelf: 'center'
    },
    productText4: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.7),
        marginTop: responsiveHeight(1),
    },
    pinImg: {
        height: 12,
        width: 12,
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
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
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
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
    },
    staricon: {
        height: 15,
        width: 15,
        resizeMode: 'contain'
    },
    tagTextView3: {
        paddingVertical: 2,
        paddingHorizontal: 5,
        position: 'absolute',
        top: responsiveHeight(2),
        right: responsiveWidth(3),
        borderRadius: 8
    },
    likeImg: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },
    tagTextView4: {
        paddingVertical: 2,
        paddingHorizontal: 5,
        position: 'absolute',
        top: responsiveHeight(12),
        left: responsiveWidth(10),
        borderRadius: 8
    },
    tagText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
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
    textinputHeader: {
        fontSize: responsiveFontSize(1.5),
        color: '#000000',
        fontFamily: 'Poppins-Medium',
        marginBottom: 5,
        marginTop: 10
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
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginTop: responsiveHeight(10)
    },
    emptyText: {
        fontSize: responsiveFontSize(2),
        color: '#666',
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
});