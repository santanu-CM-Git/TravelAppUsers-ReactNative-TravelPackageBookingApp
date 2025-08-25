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
    Share
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../../context/AuthContext';
import { getProducts } from '../../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../../store/cartSlice';
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, productImg, travelImg, likefillImg, mappinImg, starImg, arrowBackImg, shareImg, calendarImg, CheckImg, timeImg } from '../../../utils/Images';
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
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Entypo';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { ActivityIndicator } from '@react-native-material/core';
import StaticMap from '../../../utils/StaticMap';

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function PackageDetailsScreen({ route }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const [isLoading, setIsLoading] = useState(true)
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    const [packageInfo, setPackageInfo] = useState(null)
    const [activeTab, setActiveTab] = useState('Day 1');
    const [tabs, setTabs] = useState([]);

    const [location, setLocation] = useState("Jammu-Kashmir");
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [loadingLikes, setLoadingLikes] = useState({});

    useEffect(() => {
        if (packageInfo?.date_type == 0) {
            // Auto-populate dates for fixed date type
            setFromDate(new Date(packageInfo?.start_date));
            setToDate(new Date(packageInfo?.end_date));
        }
    }, [packageInfo]);

    useEffect(() => {
        console.log('showFromDatePicker changed:', showFromDatePicker);
    }, [showFromDatePicker]);

    const onChangeFromDate = (event, selectedDate) => {
        if (packageInfo?.date_type == 0) return; // Disable date selection for fixed dates

        setShowFromDatePicker(false); // Close picker after selection
        if (selectedDate) {
            const packageStartDate = new Date(packageInfo?.start_date);
            const packageEndDate = new Date(packageInfo?.end_date);

            // Ensure selected date is not before package start date
            if (selectedDate < packageStartDate) {
                Alert.alert('Invalid Date', 'Please select a date after the package start date');
                return;
            }

            // Ensure selected date is not after package end date
            if (selectedDate > packageEndDate) {
                Alert.alert('Invalid Date', 'Please select a date before the package end date');
                return;
            }

            setFromDate(selectedDate);

            // Calculate arrival date based on itinerary length
            const itineraryLength = packageInfo?.itinerary?.length || 0;
            const calculatedToDate = new Date(selectedDate);
            calculatedToDate.setDate(calculatedToDate.getDate() + (itineraryLength - 1));

            // Ensure calculated arrival date doesn't exceed package end date
            if (calculatedToDate > packageEndDate) {
                Alert.alert('Invalid Date', 'Selected date would exceed package end date');
                return;
            }

            setToDate(calculatedToDate);
        }
    };

    const onChangeToDate = (event, selectedDate) => {
        // Disable manual toDate selection as it's calculated automatically
        return;
    };
    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };
    const [quantityAdult, setQuantityAdult] = useState(1);
    const [quantityChild, setQuantityChild] = useState(0);
    const [adultPrice, setAdultPrice] = useState('80')
    const [childPrice, setChildPrice] = useState('40')

    const increaseQuantityAdult = () => {
        setQuantityAdult(quantityAdult + 1)
    };
    const decreaseQuantityAdult = () => {
        if (quantityAdult > 1) {
            setQuantityAdult(quantityAdult - 1);
        }
    };

    const increaseQuantityChild = () => {
        setQuantityChild(quantityChild + 1)
    };
    const decreaseQuantityChild = () => {
        if (quantityChild > 0) {
            setQuantityChild(quantityChild - 1);
        }
    };

    const itineraryFeatures = [
        { title: 'Natural beauty', description: 'See the snowcapped Himalayas, lakes, and pastures.' },
        { title: 'Historical sites', description: 'Explore the Amar Mahal Palace, Martand Sun Temple, and more.' },
        { title: 'Gardens', description: 'Visit the Indira Gandhi Tulip Garden, Shalimar Bagh, and Nishat Bagh.' },
        { title: 'Hill stations', description: 'Visit Gulmarg, Pahalgam, and Sonmarg.' },
        { title: 'Kashmir Ladakh tour', description: 'Explore Srinagar, Kargil, Leh, Nubra Valley, and Pangong Tso.' },
    ];

    const itineraryImages = [
        require('../../../assets/images/tour.png'),
        require('../../../assets/images/tour.png'),
        require('../../../assets/images/tour.png'),
    ];

    const renderItineraryFeature = ({ item }) => (
        <View style={styles.itineraryFeatureItem}>
            <Text style={styles.itineraryBullet}>• </Text>
            <Text style={styles.itineraryFeatureText}>
                <Text style={styles.itineraryFeatureTitle}>{item.title}: </Text>
                {item.description}
            </Text>
        </View>
    );

    const renderItineraryImage = ({ item }) => (
        <Image source={productImg} style={styles.itineraryImage} />
    );

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

    const fetchPackageDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            console.log(usertoken, 'usertoken')
            const packageId = route?.params?.packageId;
            axios.post(`${API_URL}/customer/packages-details`, { package_id: packageId }, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    let packageInfo = res.data.data;
                    console.log(packageInfo, 'package data from package details')
                    setPackageInfo(packageInfo)
                    // Set tabs based on itinerary
                    if (packageInfo.itinerary && packageInfo.itinerary.length > 0) {
                        const itineraryTabs = packageInfo.itinerary.map((item, index) => ({
                            label: `Day ${index + 1}`,
                            value: `Day ${index + 1}`
                        }));
                        setTabs(itineraryTabs);
                        setActiveTab(`Day 1`);
                    }
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`package data error from package details ${e}`)
                });
        });
    }

    useEffect(() => {
        fetchPackageDetails();
    }, []);

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
                fetchPackageDetails()
            }
        } catch (error) {
            console.log('Wishlist error:', error);
            Alert.alert('Error', 'Failed to update wishlist');
        } finally {
            setLoadingLikes(prev => ({ ...prev, [packageId]: false }));
        }
    };
    const onShare = async () => {
        try {
            const shareMessage = `Check out this amazing travel package!\n\n${packageInfo?.name}\nLocation: ${packageInfo?.location_data?.name}\nPrice: ${packageInfo?.discounted_price}\n\nBook now and enjoy your dream vacation!`;

            const result = await Share.share({
                message: shareMessage,
                title: 'Share Travel Package',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    // shared
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing:', error.message);
        }
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

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            {/* <CustomHeader commingFrom={'Top location'} onPressProfile={() => navigation.navigate('Profile')} title={'Top location'} /> */}
            <StatusBar translucent backgroundColor="transparent" />
            <ScrollView>
                <ImageBackground
                    source={packageInfo?.cover_photo_url ? { uri: packageInfo.cover_photo_url } : productImg}
                    style={styles.background}
                    imageStyle={styles.imageStyle}
                >
                    {/* Header Icons */}
                    <View style={[styles.header, { position: 'relative' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                                <Image
                                    source={arrowBackImg}
                                    style={styles.filterIcon}
                                />
                            </TouchableOpacity>
                            <View style={{ position: 'relative', justifyContent: 'center' }}>
                                {/* Light gray overlay */}
                                <View style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(11, 10, 10, 0.5)', // light gray, semi-transparent
                                    borderRadius: 8,
                                    zIndex: 1,
                                }} />
                                {/* Text */}
                                <Text
                                    style={[
                                        styles.titleM,
                                        { width: responsiveWidth(70), marginLeft: responsiveWidth(2), zIndex: 2 }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {packageInfo?.name || 'Package Details'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.iconButton} onPress={onShare}>
                            <Image
                                source={shareImg}
                                style={styles.filterIcon}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Like Button */}
                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleWishlist(packageInfo.id);
                        }}
                        disabled={loadingLikes[packageInfo.id]}
                    >
                        {loadingLikes[packageInfo.id] ? (
                            <ActivityIndicator size="small" color="#FF455C" />
                        ) : (
                            <Image
                                source={likefillImg}
                                style={styles.likeIcon}
                                tintColor={packageInfo?.wishlist == false ? "#A6A7AC" : "#FF455C"}
                            />
                        )}
                    </TouchableOpacity>
                </ImageBackground>

                <View style={{ margin: 5, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.productText3}>{packageInfo?.agent?.name || 'Travel Agency'}</Text>
                        <Text style={styles.priceText22}>₹{packageInfo?.discounted_price || 0}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={mappinImg}
                            style={styles.pinImg}
                        />
                        <Text style={styles.addressText}>{packageInfo?.location || 'Location'}</Text>
                    </View>
                    <Text style={styles.travelerText}>{packageInfo?.agent?.tag_line || 'Travel Agency'}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        {packageInfo?.date_type == 0 ? (
                            <Text style={styles.packageAvlTextMain}>{moment(packageInfo?.start_date).format('DD MMMM YYYY')}</Text>
                        ) : (
                            <Text style={styles.packageAvlTextMain}>Package Expire at {moment(packageInfo?.end_date).format("DD MMMM YYYY")}</Text>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={timeImg}
                                style={styles.pinImg}
                            />
                            {packageInfo?.date_type == 0 ? (
                                <Text style={styles.addressText}>
                                    {(() => {
                                        const start = moment(packageInfo?.start_date);
                                        const end = moment(packageInfo?.end_date);
                                        const days = end.diff(start, 'days') +1;
                                        const nights = days > 0 ? days - 1 : 0;
                                        return `${days} Days ${nights} Nights`;
                                    })()}</Text>
                            ) : (
                                <Text style={styles.addressText}>{tabs.length} Days {tabs.length - 1} Nights</Text>
                            )}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <View style={{ flex: 1 }}>
                            {packageInfo?.date_type == 0 && (
                                <Text style={styles.packageAvlTextMain}>
                                    Slots : {packageInfo?.seat_slots - packageInfo?.booked_slots}
                                </Text>
                            )}
                        </View>
                        {packageInfo?.rating !== null && packageInfo?.rating !== undefined && packageInfo?.rating !== 0 && (
                        <View style={styles.rateingView}>
                            <Image
                                source={starImg}
                                style={[styles.staricon, { marginTop: -5 }]}
                            />
                                <Text style={styles.ratingText}>{packageInfo?.rating || 0}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.productText3}>About</Text>
                    <Text style={styles.addressText}>{packageInfo?.description || 'No description available'}</Text>
                    <Text style={styles.productText3}>Itinerary</Text>
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
                    {packageInfo?.itinerary && packageInfo.itinerary.map((day, index) => {
                        if (activeTab === `Day ${index + 1}`) {
                            return (
                                <View key={index} style={styles.itineraryCard}>
                                    <Text style={styles.itineraryTitle}>Day {index + 1}</Text>
                                    <Text style={styles.itineraryDescription}>
                                        {day.description}
                                    </Text>
                                    {day.images && day.images.length > 0 && (
                                        <Carousel
                                            data={day.images}
                                            renderItem={({ item }) => (
                                                <Image
                                                    source={{ uri: item }}
                                                    style={styles.itineraryImage}
                                                />
                                            )}
                                            sliderWidth={width - responsiveWidth(15)}
                                            itemWidth={width * 0.6}
                                            loop
                                        />
                                    )}
                                </View>
                            );
                        }
                        return null;
                    })}
                    <View style={{ marginTop: responsiveHeight(2) }}>
                        <StaticMap latitude={packageInfo?.location_data?.latitude} longitude={packageInfo?.location_data?.longitude} label={packageInfo?.location} />
                    </View>
                    <Text style={styles.productText3}>Required documents</Text>
                    {packageInfo?.document && JSON.parse(packageInfo.document).map((doc, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={CheckImg}
                                style={styles.checkicon}
                            />
                            <Text style={styles.packageAvlText}>{doc}</Text>
                        </View>
                    ))}
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity style={styles.bookNowButton} onPress={() => { toggleFilterModal() }}>
                            <Text style={styles.bookNowText}>Book Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.talkToAgentButton} onPress={() => { navigation.navigate('ChatScreen', { agentId: packageInfo?.agent?.id }) }}>
                            <Text style={styles.talkToAgentText}>Talk to Agent</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <Modal
                isVisible={isFilterModalVisible}
                style={{
                    margin: 0,
                    justifyContent: 'flex-end',
                }}>
                <View style={{ height: '55%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Booking options</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={toggleFilterModal} />
                            </View>
                        </View>
                    </View>
                    <ScrollView style={{ marginBottom: responsiveHeight(0) }}>
                        <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5 }}>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Please Select a tour date</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(2) }}>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={styles.textinputHeader}>Departure Date</Text>
                                    {/* {packageInfo?.date_type == 0 ? (
                                         <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{moment(packageInfo?.start_date).format('ddd MMM DD YYYY')}</Text>
                                    ) : ( */}
                                        <TouchableOpacity
                                        onPress={() => {
                                            console.log('Departure Date pressed, date_type:', packageInfo?.date_type);
                                            if(packageInfo?.date_type == 1){
                                                setShowFromDatePicker(true);
                                            }
                                           
                                        }}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: "#ddd",
                                            paddingHorizontal: 10,
                                            paddingVertical: 13,
                                            borderRadius: 5,
                                            marginTop: 5,
                                            opacity: packageInfo?.date_type == 0 ? 0.5 : 1
                                        }}
                                    >
                                        <Icon name="calendar" size={20} color="red" />
                                        <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{fromDate.toDateString()}</Text>
                                    </TouchableOpacity>
                                    {/* )} */}
                                    
                                    {showFromDatePicker && (
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={fromDate}
                                            mode="date"
                                            is24Hour={true}
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={onChangeFromDate}
                                            minimumDate={new Date(packageInfo?.start_date)}
                                            maximumDate={new Date(packageInfo?.end_date)}
                                        />
                                    )}
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={styles.textinputHeader}>Arrival date</Text>
                                    {/* {packageInfo?.date_type == 0 ? (
                                         <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{moment(packageInfo?.end_date).format('ddd MMM DD YYYY')}</Text>
                                    ) : ( */}
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: "#ddd",
                                            paddingHorizontal: 10,
                                            paddingVertical: 13,
                                            borderRadius: 5,
                                            marginTop: 5,
                                            opacity:  0.5
                                        }}
                                    >
                                        <Icon name="calendar" size={20} color="red" />
                                        <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{toDate.toDateString()}</Text>
                                    </TouchableOpacity>
                                    {/* )} */}
                                </View>
                            </View>
                            <View style={styles.containerforqty}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>Person</Text>
                                    <Text style={styles.subtitle}>(12 years+)</Text>
                                </View>
                                <Text style={styles.price}>₹{packageInfo?.discounted_price * quantityAdult || 0}</Text>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity onPress={decreaseQuantityAdult} style={styles.button}>
                                        <Icon name="minus" size={20} color="#FF3B5C" />
                                    </TouchableOpacity>
                                    <Text style={styles.quantity}>{quantityAdult}</Text>
                                    <TouchableOpacity onPress={increaseQuantityAdult} style={styles.button}>
                                        <Icon name="plus" size={20} color="#FF3B5C" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.containerforqty}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>Children</Text>
                                    <Text style={styles.subtitle}>(0 to 12 years)</Text>
                                </View>
                                <Text style={styles.price}>₹{packageInfo?.children_price * quantityChild || 0}</Text>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity onPress={decreaseQuantityChild} style={styles.button}>
                                        <Icon name="minus" size={20} color="#FF3B5C" />
                                    </TouchableOpacity>
                                    <Text style={styles.quantity}>{quantityChild}</Text>
                                    <TouchableOpacity onPress={increaseQuantityChild} style={styles.button}>
                                        <Icon name="plus" size={20} color="#FF3B5C" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={{ bottom: 0, width: responsiveWidth(100), paddingHorizontal: 15, borderTopColor: '#E3E3E3', borderTopWidth: 1, flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: responsiveFontSize(2.5), color: '#22313F', fontFamily: 'Poppins-Bold', }}>₹ {(packageInfo?.discounted_price * quantityAdult) + (packageInfo?.children_price * quantityChild) || 0}</Text>
                        <View style={{ width: responsiveWidth(45), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                            <CustomButton label={"Book Now"}
                                onPress={() => {
                                    setFilterModalVisible(false)
                                    navigation.navigate('BookingSummary', {
                                        packageInfo: packageInfo,
                                        bookingDetails: {
                                            fromDate: fromDate,
                                            toDate: toDate,
                                            adults: quantityAdult,
                                            children: quantityChild,
                                            totalPrice: (packageInfo?.discounted_price * quantityAdult) + (packageInfo?.children_price * quantityChild)
                                        }
                                    })
                                }

                                }
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
        top: 35,
        //left: 20,
        //right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: responsiveWidth(5),
        alignSelf: 'center',
    },
    titleM: {
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
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    likeIcon: {
        height: 20,
        width: 20,
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
    addressText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
    },
    packageAvlTextMain: {
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
    priceText22: {
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
        marginVertical: responsiveHeight(2),
        // width: responsiveWidth(92)
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
    priceText2: {
        color: '#FF455C',
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2),
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
    itineraryCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    itineraryTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2),
        color: '#1B2234',
        marginBottom: 8,
    },
    itineraryDescription: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
        color: '#696969',
        marginBottom: 12,
    },
    itineraryFeatureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    itineraryBullet: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(2),
        color: '#696969',
    },
    itineraryFeatureText: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.7),
        color: '#696969',
        flexShrink: 1,
    },
    itineraryFeatureTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: responsiveFontSize(1.7),
        color: '#696969',
    },
    itineraryImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    checkicon: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    packageAvlText: {
        color: '#696969',
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    buttoncontainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    bookNowButton: {
        backgroundColor: '#FF3B5C',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginRight: 10,
        elevation: 3,
        width: responsiveWidth(45),
        justifyContent: 'center',
        alignItems: 'center'
    },
    bookNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    talkToAgentButton: {
        borderWidth: 2,
        borderColor: '#FF3B5C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: responsiveWidth(45),
        justifyContent: 'center',
        alignItems: 'center'
    },
    talkToAgentText: {
        color: '#FF3B5C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textinputHeader: {
        fontSize: responsiveFontSize(1.5),
        color: '#000000',
        fontFamily: 'Poppins-Medium',
        marginBottom: 5,
        marginTop: 10
    },
    containerforqty: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 12,
        color: '#777',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FF3B5C',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    button: {
        padding: 1,
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 10,
    },
});