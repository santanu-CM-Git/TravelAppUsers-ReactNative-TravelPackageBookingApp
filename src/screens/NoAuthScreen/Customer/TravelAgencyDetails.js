import React, { useContext, useMemo, useState, useEffect, memo, useCallback, useRef } from 'react';
import {
    View,
    Text,
    SafeAreaView,
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
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, productImg, travelImg, likefillImg, mappinImg, starImg, arrowBackImg, shareImg, calendarImg } from '../../../utils/Images';
import Loader from '../../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../../components/CustomHeader';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import StarRating from 'react-native-star-rating-widget';
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Entypo';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function TravelAgencyDetails({ route }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { logout } = useContext(AuthContext);
    // const { userInfo } = useContext(AuthContext)
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [starCount, setStarCount] = useState(4)
    const [travelAgencyData, setTravelAgencyData] = useState(route?.params?.item)
    const [packages, setPackages] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Add review states
    const [reviews, setReviews] = useState([]);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const [reviewPage, setReviewPage] = useState(1);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const [activeTab, setActiveTab] = useState('List of Packages');
    const tabs = [
        { label: 'List of Packages', value: 'List of Packages' },
        { label: 'Reviews', value: 'Reviews' }
    ];

    const [loadingLikes, setLoadingLikes] = useState({});

    const fetchAgentPackages = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                console.log('No user token found');
                return;
            }

            const response = await axios.post(
                `${API_URL}/customer/agent-packages`,
                {
                    agent_id: travelAgencyData?.id,
                    country: route?.params?.countryName
                },
                {
                    params: {
                        page,
                    },
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${usertoken}`,
                    },
                }
            );

            const responseData = response.data.data.data;
            console.log(responseData, 'agent packages data');
            setPackages(prevData => page === 1 ? responseData : [...prevData, ...responseData]);

            if (responseData.length === 0) {
                setHasMore(false); // No more data to load
            }
        } catch (error) {
            console.log(`Fetch agent packages error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setLoading(false);
        }
    }, [travelAgencyData?.id]);

    const fetchAgentReviews = useCallback(async (page = 1) => {
        try {
            setLoadingReviews(true);
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                console.log('No user token found');
                return;
            }

            const response = await axios.post(
                `${API_URL}/customer/agent-review`,
                {
                    agent_id: travelAgencyData?.id,
                },
                {
                    params: {
                        page
                    },
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${usertoken}`,
                    },
                }
            );

            const responseData = response.data.reviews.data;
            console.log(responseData, 'agent reviews data');
            setReviews(prevData => page === 1 ? responseData : [...prevData, ...responseData]);

            if (responseData.length === 0) {
                setHasMoreReviews(false);
            }
        } catch (error) {
            console.log(`Fetch agent reviews error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setLoadingReviews(false);
        }
    }, [travelAgencyData?.id]);

    useEffect(() => {
        console.log(JSON.stringify(travelAgencyData), 'travelAgencyDatatravelAgencyData')
        fetchAgentPackages(1);
    }, [fetchAgentPackages]);

    useEffect(() => {
        if (activeTab === 'Reviews') {
            fetchAgentReviews(1);
        }
    }, [activeTab, fetchAgentReviews]);

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

    const renderEmptyComponent = () => {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No data found</Text>
            </View>
        )
    }
    const formatNumber = (num) => {
        if (num >= 100000) {
            return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L'; // Lakhs
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
        }
        return num.toString(); // Less than 1000
    };

    const handleWishlist = async (packageId) => {
        try {
            setLoadingLikes(prev => ({ ...prev, [packageId]: true }));
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
                // Update the wishlist status in the locationList
                console.log(response.data.message)
                setPackages(prevList =>
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
            setLoadingLikes(prev => ({ ...prev, [packageId]: false }));
        }
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            {/* <CustomHeader commingFrom={'Top location'} onPressProfile={() => navigation.navigate('Profile')} title={'Top location'} /> */}
            {/* <StatusBar translucent backgroundColor="transparent" /> */}
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <ScrollView>
                <ImageBackground
                    source={{ uri: travelAgencyData?.cover_photo_url }} // Replace with your image URL
                    style={styles.background}
                    imageStyle={styles.imageStyle}
                >
                    {/* Header Icons */}
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                                <Image
                                    source={arrowBackImg}
                                    style={styles.filterIcon}
                                />
                            </TouchableOpacity>
                            
                            <View style={{ marginLeft: responsiveWidth(1) }}>
                                {/* Text with background overlay */}
                                <View style={{
                                    backgroundColor: 'rgba(11, 10, 10, 0.5)', // light gray, semi-transparent
                                    borderRadius: 8,
                                    paddingHorizontal: responsiveWidth(2),
                                    paddingVertical: responsiveHeight(0.5),
                                    maxWidth: responsiveWidth(70),
                                }}>
                                    <Text
                                        style={[
                                            styles.title,
                                            { zIndex: 2 }
                                        ]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {travelAgencyData?.name || 'Travel Agency'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Bottom Like Button */}
                    {/* <TouchableOpacity style={styles.likeButton}>
                        <Image
                            source={likefillImg}
                            style={styles.likeIcon}
                        />
                    </TouchableOpacity> */}
                </ImageBackground>
                <View style={{ marginBottom: responsiveHeight(5) }}>
                    {/* SVG for Circular Ripple with Bottom Fade */}
                    <Svg height="250" width="250" style={styles.svg}>
                        <Defs>
                            {/* Gradient Mask to Fade Top */}
                            <LinearGradient id="fadeGradient" x1="0" y1="1" x2="0" y2="0">
                                <Stop offset="0%" stopColor="white" stopOpacity="1" />
                                <Stop offset="80%" stopColor="white" stopOpacity="0.3" />
                                <Stop offset="100%" stopColor="white" stopOpacity="0" />
                            </LinearGradient>

                            {/* Masking the Circles */}
                            <Mask id="circleMask">
                                <Rect x="0" y="125" width="250" height="125" fill="url(#fadeGradient)" />
                            </Mask>
                        </Defs>

                        {/* Outer Circles with Mask */}
                        <Circle cx="125" cy="125" r="55" stroke="#FF7788" strokeWidth="2" fill="none" mask="url(#circleMask)" />
                        <Circle cx="125" cy="125" r="45" stroke="#FF99AA" strokeWidth="2" fill="none" mask="url(#circleMask)" />
                    </Svg>
                    {/* Profile Picture Section */}
                    <View style={styles.profileContainer}>
                        <View style={styles.profilePicWrapper}>
                            <Image
                                source={{ uri: travelAgencyData?.profile_photo_url }} // Replace with actual profile image
                                style={styles.profilePic}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ margin: 5, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.productText3}>{travelAgencyData?.name}</Text>
                        {/* <Text style={styles.priceText2}>$72.00</Text> */}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: responsiveWidth(85) }}>
                        <Image
                            source={mappinImg}
                            style={styles.pinImg}
                        />
                        <Text style={styles.addressText}>{travelAgencyData?.address}</Text>
                    </View>
                    {/* <Text style={styles.travelerText}>Omega Tours</Text> */}
                    {/* <Text style={styles.packageAvlText}>04 September 2024</Text> */}
                    {travelAgencyData?.no_of_active_packages ?
                        <Text style={styles.packageAvlText}>available package : {travelAgencyData?.no_of_active_packages}</Text>
                        : null}
                    <Text style={styles.productText3}>About</Text>
                    <Text style={styles.addressText}>{travelAgencyData?.tag_line}</Text>

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

                    {activeTab == 'List of Packages' ?
                        <View style={styles.productSection}>
                            <FlatList
                                key={'packages'}
                                data={packages}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableWithoutFeedback onPress={() => navigation.navigate('PackageDetailsScreen', { packageId: item.id })}>
                                        <View style={styles.totalValue4}>
                                            <Image
                                                source={{ uri: item.cover_photo_url }}
                                                style={styles.productImg4}
                                            />
                                            <View style={{ margin: 5 }}>
                                                <Text style={styles.productText4} numberOfLines={1} ellipsizeMode='tail'>{item.name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image
                                                        source={mappinImg}
                                                        style={styles.pinImg}
                                                    />
                                                    <Text style={styles.addressText}>{item.location}</Text>
                                                </View>
                                                <Text style={styles.travelerText}>{item.agent?.name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                                    {item?.date_type == 0 ?
                                                        <Text style={styles.addressText}>Slots : {item?.seat_slots - item?.booked_slots}</Text>
                                                        :
                                                        null
                                                    }
                                                    <Text style={styles.priceText2}>₹{formatNumber(item?.discounted_price)}</Text>
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
                                                                const days = end.diff(start, 'days') + 1;
                                                                const nights = days > 0 ? days - 1 : 0;
                                                                return `${days} Days ${nights} Nights`;
                                                            })()}
                                                        </Text> :
                                                        <Text style={styles.packageAvlText}>
                                                            {item?.itinerary.length} Days {item?.itinerary.length - 1} Nights
                                                        </Text>
                                                    }
                                                    <View style={styles.rateingView}>
                                                        <Image
                                                            source={starImg}
                                                            style={[styles.staricon, { marginTop: -5 }]}
                                                        />
                                                        <Text style={styles.ratingText}>{item.rating || '0'}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.tagTextView3}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleWishlist(item.id);
                                                }}
                                                disabled={loadingLikes[item.id]}
                                            >
                                                {loadingLikes[item.id] ? (
                                                    <ActivityIndicator size="small" color="#FF455C" />
                                                ) : (
                                                    <Image
                                                        source={likefillImg}
                                                        style={styles.likeImg}
                                                        tintColor={item?.wishlist == false ? "#A6A7AC" : "#FF455C"}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                            {item?.date_type == 0 ? (
                                                <View style={styles.tagTextView4}>
                                                    <View style={styles.dateContainer}>
                                                        <Image source={calendarImg} tintColor={'#FFFFFF'} style={[styles.timeimage, { marginRight: 5 }]} />
                                                        <Text style={styles.dateText}>{moment(item.start_date).format('DD MMM YYYY')}</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                null
                                            )}
                                        </View>
                                    </TouchableWithoutFeedback>
                                )}
                                onEndReached={() => {
                                    if (hasMore && !loading) {
                                        setPage(prevPage => prevPage + 1);
                                        fetchAgentPackages(page + 1);
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListEmptyComponent={renderEmptyComponent}
                                ListFooterComponent={() => {
                                    if (loading) {
                                        return (
                                            <View style={{ paddingVertical: 20 }}>
                                                <ActivityIndicator size="large" color="#FF455C" />
                                            </View>
                                        );
                                    }
                                    return null;
                                }}
                                numColumns={2}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        </View>
                        :
                        <View style={styles.productSection}>
                            <FlatList
                                key={'reviews'}
                                data={reviews}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.card}>
                                        <View style={styles.header2}>
                                            <Image
                                                source={item.customer?.profile_image ? { uri: item.customer.profile_image } : productImg}
                                                style={styles.profileImage}
                                            />
                                            <View style={styles.userInfo}>
                                                <Text style={styles.name}>{item.customer?.first_name || 'Anonymous'} {item.customer?.last_name}</Text>
                                                <Text style={styles.date}>{moment(item.created_at).format('DD MMM YYYY')}</Text>
                                            </View>
                                            <View style={{ marginBottom: 5, width: responsiveWidth(20), marginRight: responsiveWidth(10) }}>
                                                <StarRating
                                                    disabled={true}
                                                    maxStars={5}
                                                    rating={item?.star}
                                                    fullStarColor={'#FFCB45'}
                                                    starSize={15}
                                                />
                                            </View>
                                        </View>
                                        <Text style={styles.reviewText}>{item.message}</Text>
                                    </View>
                                )}
                                onEndReached={() => {
                                    if (hasMoreReviews && !loadingReviews) {
                                        setReviewPage(prevPage => prevPage + 1);
                                        fetchAgentReviews(reviewPage + 1);
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListEmptyComponent={renderEmptyComponent}
                                ListFooterComponent={() => {
                                    if (loadingReviews) {
                                        return (
                                            <View style={{ paddingVertical: 20 }}>
                                                <ActivityIndicator size="large" color="#FF455C" />
                                            </View>
                                        );
                                    }
                                    return null;
                                }}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        </View>
                    }
                </View>
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
        top: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: responsiveWidth(5),
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
        //backgroundColor: 'rgba(0,0,0,0.5)',
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
    likeIcon: {
        height: 22,
        width: 22,
        resizeMode: 'contain'
    },
    filterIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
    },
    productText3: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2.5),
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
    packageAvlText: {
        color: '#2A2A2A',
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
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
    },
    travelerText: {
        color: '#FF455C',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
    },
    priceText2: {
        color: '#FF455C',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2.5),
    },
    /* tab section */
    tabView: {
        //paddingHorizontal: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        //justifyContent: 'space-around',
        marginVertical: 20,
        //width: responsiveWidth(92)
    },
    tab: {
        // paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderColor: '#FF455C',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: responsiveHeight(5),
        // width: responsiveWidth(28),
        marginRight: responsiveWidth(2)
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
    contentContainer: {
        flex: 1,
        //paddingHorizontal: 10,
        paddingVertical: 10,
    },
    /* tab section */
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
        margin: 1,
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
    addressText: {
        color: '#686868',
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
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 10,
        marginHorizontal: 2,
    },
    header2: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
        marginLeft: 10,
    },
    name: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(1.6),
        color: '#000000'
    },
    date: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#000000'
    },
    rating: {
        flexDirection: 'row',
    },
    reviewText: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.6),
        color: '#696969'
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
    svg: {
        position: 'absolute',
        bottom: -responsiveHeight(16),
        zIndex: 2,
        alignSelf: 'center',
    },
    profileContainer: {
        alignItems: "center",
        position: 'absolute',
        bottom: -responsiveHeight(5),
        //right: 150,
        zIndex: 3,
        alignSelf: 'center'
    },
    profilePicWrapper: {
        position: "relative",
    },
    profilePic: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fff",
        borderWidth: 3,
        borderColor: "#fff",
    },
});