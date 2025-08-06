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
    KeyboardAwareScrollView
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../../context/AuthContext';
import { getProducts } from '../../../store/productSlice'
import moment from 'moment-timezone';
import CustomButton from '../../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../../store/cartSlice';
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, filterImg, productImg, travelImg, likefillImg, mappinImg, starImg, arrowBackImg, shareImg, calendarImg, CheckImg, addnewImg, mybookingMenuImg, transactionMenuImg, arrowRightImg, cancelTourImg } from '../../../utils/Images';
import Loader from '../../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../../components/CustomHeader';
import InputField from '../../../components/InputField';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating-widget';
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Entypo';
import RadioGroup from 'react-native-radio-buttons-group';
import MultiSlider from '@ptomasroos/react-native-multi-slider';


const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function CompletedBookingDetails({  }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { logout } = useContext(AuthContext);
    // const { userInfo } = useContext(AuthContext)
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [notificationStatus, setNotificationStatus] = useState(false)
    const [therapistData, setTherapistData] = React.useState([])
    const [upcomingBooking, setUpcomingBooking] = useState([])
    const [previousBooking, setPreviousBooking] = useState([])
    const [starCount, setStarCount] = useState(4)
    const [activeSlide, setActiveSlide] = React.useState(0);
    const [bannerData, setBannerData] = useState([])
    const [customerSpeaksData, setCustomerSpeaksData] = useState([])
    const [userInfo, setuserInfo] = useState([])
    const [currentDateTime, setCurrentDateTime] = useState(moment.tz(new Date(), 'Asia/Kolkata'));
    const [freeBannerImg, setFreeBannerImg] = useState('')
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isFilterModalVisible2, setFilterModalVisible2] = useState(false);

    const [firstname, setFirstname] = useState('');
    const [firstNameError, setFirstNameError] = useState('')

    const [phoneno, setPhoneno] = useState('');
    const [phoneError, setphoneError] = useState('')

    const [address, setaddress] = useState('');
    const [addressError, setaddressError] = useState('')

    const contacts = [
        {
            id: 1,
            name: "Kristin Sharma",
            phone: "+91 76966 46546",
            image: "https://randomuser.me/api/portraits/women/1.jpg",
        },
        {
            id: 2,
            name: "Esther Howard",
            phone: "+91 98758 95845",
            image: "https://randomuser.me/api/portraits/women/2.jpg",
        },
    ];

    const [activeTab2, setActiveTab2] = useState('New Packages')
    const [activeButtonNo, setActiveButtonNo] = useState(0)

    const [location, setLocation] = useState("Jammu-Kashmir");
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    const [adultPassengers, setAdultPassengers] = useState("8");
    const [kidsPassengers, setKidsPassengers] = useState("2");
    const [searchText, setSearchText] = useState("");

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

    const toggleFilterModal2 = () => {
        setFilterModalVisible2(!isFilterModalVisible2);
    };
    const [quantityAdult, setQuantityAdult] = useState(1);
    const [quantityChild, setQuantityChild] = useState(1);
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
        if (quantityChild > 1) {
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

    const getFCMToken = async () => {
        try {
            // if (Platform.OS == 'android') {
            await messaging().registerDeviceForRemoteMessages();
            // }
            const token = await messaging().getToken();
            AsyncStorage.setItem('fcmToken', token)
            //console.log(token, 'fcm token');
        } catch (e) {
            console.log(e);
        }
    };

    const ContactItem = ({ name, phone, image, onRemove }) => {
        return (
            <View style={styles.contactContainer}>
                <Image source={{ uri: image }} style={styles.contactAvatar} />
                <Text style={styles.contactName}>{name}</Text>
                <Text style={styles.contactPhone}>{phone}</Text>
                <TouchableOpacity onPress={onRemove} style={styles.contactCloseButton}>
                    <Text style={styles.contactCloseText}>×</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const changeFirstname = (text) => {
        setFirstname(text)
        if (text) {
            setFirstNameError('')
        } else {
            setFirstNameError('Please enter name.')
        }
    }

    const changePhoneno = (text) => {
        setPhoneno(text)
        if (text) {
            setphoneError('')
        } else {
            setphoneError('Please enter phone no.')
        }
    }


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
            {/* <CustomHeader commingFrom={'Top location'} onPressProfile={() => navigation.navigate('Profile')} title={'Top location'} /> */}
            <StatusBar translucent backgroundColor="transparent" />
            <ScrollView>
                <ImageBackground
                    source={productImg} // Replace with your image URL
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
                            <Text style={[styles.titleM, { marginLeft: responsiveWidth(2) }]}>Beach & Garden</Text>
                        </View>
                        <TouchableOpacity style={styles.iconButton}>
                            <Image
                                source={shareImg}
                                style={styles.filterIcon}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Like Button */}
                    <TouchableOpacity style={styles.likeButton}>
                        <Image
                            source={likefillImg}
                            style={styles.likeIcon}
                        />
                    </TouchableOpacity>
                </ImageBackground>

                <View style={{ margin: 5, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.productText3}>Pramukh Tours</Text>
                        <Text style={styles.priceText22}>$72.00</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={mappinImg}
                            style={styles.pinImg}
                        />
                        <Text style={styles.addressText}>Himachal Pradesh</Text>
                    </View>
                    <Text style={styles.travelerText}>Omega Tours</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.packageAvlTextMain}>04 September 2024</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={timeIcon}
                                style={styles.pinImg}
                            />
                            <Text style={styles.addressText}>5 Days 6 Nights</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: "center" }}>
                        <Text style={styles.packageAvlTextMain}>Slots : 05</Text>
                        {/* <View style={styles.rateingView}>
                            <Image
                                source={starImg}
                                style={styles.staricon}
                            />
                            <Text style={styles.ratingText}>3.5</Text>
                        </View> */}
                    </View>
                    <View
                        style={{
                            borderBottomColor: '#686868',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            marginVertical: 7
                        }}
                    />
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: responsiveHeight(1) }}>
                        <Text style={styles.productText3}>Co Traveler</Text>
                        {/* <TouchableOpacity onPress={() => toggleFilterModal()}>
                            <Image
                                source={addnewImg}
                                style={styles.addnewIcon}
                            />
                        </TouchableOpacity> */}
                    </View>
                    <View style={styles.contactListContainer}>
                        {contacts.map((contact) => (
                            <ContactItem
                                key={contact.id}
                                name={contact.name}
                                phone={contact.phone}
                                image={contact.image}
                                onRemove={() => console.log("Remove", contact.name)}
                            />
                        ))}
                    </View>
                    <Text style={styles.productText3}>Rating</Text>
                    <Text style={{ fontSize: responsiveFontSize(2), color: '#1B2234', fontFamily: 'Poppins-Regular', textAlign: 'left', marginTop: responsiveHeight(2) }}>How was your experience?</Text>
                    <View style={{ alignSelf: 'flex-start', width: responsiveWidth(50), marginTop: responsiveHeight(2) }}>
                        <StarRating
                            disabled={false}
                            maxStars={5}
                            rating={starCount}
                            onChange={(rating) => setStarCount(rating)}
                            fullStarColor={'#FFCB45'}
                            starSize={30}
                            starStyle={{ marginHorizontal: responsiveWidth(1) }}
                        />
                    </View>
                    <View style={{marginTop: responsiveHeight(1)}}>
                        <InputField
                            label={'Write a Massage...'}
                            keyboardType="default"
                            value={address}
                            helperText={addressError}
                            inputType={'address'}
                            inputFieldType={'address'}
                            onChangeText={(text) => {
                                setaddress(text)
                            }}
                        />
                    </View>
                    <View style={styles.buttonwrapper}>
                        <CustomButton label={"Submit Review"}
                            onPress={() => submitForm()}
                        />
                    </View>
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
        top: 35,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    addressText: {
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.5),
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
    buttoncontainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    talkToAgentButton: {
        borderWidth: 2,
        borderColor: '#FF3B5C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: responsiveWidth(92),
        justifyContent: 'center',
        alignItems: 'center'
    },
    talkToAgentText: {
        color: '#FF3B5C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    paymentcontainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
        marginVertical: responsiveHeight(1)
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    label: {
        color: "#8C8C8C",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    value: {
        color: "#1B2234",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    amountLabel: {
        color: "#8C8C8C",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(2),
    },
    amountValue: {
        color: "#FF455C",
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
    },
    addnewIcon: {
        height: responsiveHeight(4),
        width: responsiveWidth(25),
        resizeMode: 'contain'
    },
    contactListContainer: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    contactContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    contactAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    contactName: {
        flex: 1,
        color: "#FF455C",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
    },
    contactPhone: {
        color: "#1B2234",
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        marginRight: 10,
    },
    contactCloseButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eee",
    },
    contactCloseText: {
        fontSize: 18,
        color: "#333",
    },
    invoiceContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        marginVertical: responsiveHeight(1)
    },
    invoiceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    invoiceText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    invoiceDivider: {
        height: 1,
        backgroundColor: "#ddd",
        marginHorizontal: 5,
    },
    arrowIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
    },
    textinputheader: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },
    requiredheader: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.5),
        color: '#E1293B',
        marginBottom: responsiveHeight(1),
        marginLeft: responsiveWidth(1)
    },
    inputView: {
        alignSelf: 'center'
    },
    cancelTourIcon: {
        height: 90,
        width: 90,
        resizeMode: 'contain',
        marginTop: responsiveHeight(5)
    },
    cancelText: {
        fontSize: responsiveFontSize(1.7),
        color: '#686868',
        fontFamily: 'Poppins-Regular',
        marginTop: responsiveHeight(5)
    }
});