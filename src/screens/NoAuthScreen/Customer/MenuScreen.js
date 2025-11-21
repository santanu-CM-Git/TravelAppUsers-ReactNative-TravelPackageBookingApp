import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    StatusBar,
    BackHandler,
    Dimensions,
    Linking
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InputField from '../../../components/InputField';
import CustomButton from '../../../components/CustomButton';
import { AuthContext } from '../../../context/AuthContext';
import Loader from '../../../utils/Loader';
import axios from 'axios';
import { API_URL, BASE_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
import Entypo from 'react-native-vector-icons/Entypo';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import moment from "moment"
import Toast from 'react-native-toast-message';
import { arrowRightImg, editImg, logoutMenuImg, mybookingMenuImg, packagepostMenuImg, plus, policyMenuImg, settingsMenuImg, supportMenuImg, termMenuImg, transactionMenuImg, userPhoto } from '../../../utils/Images';
import Icon from 'react-native-vector-icons/FontAwesome';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const menuItems = [
    { id: 1, title: 'My Bookings', icon: mybookingMenuImg, page: 'MyBookingList' },
    { id: 3, title: 'Transactions', icon: transactionMenuImg, page: 'TransactionScreen' },
    { id: 4, title: 'Wishlisted Packages', icon: packagepostMenuImg, page: 'WishlistPackage' },
    { id: 6, title: 'Delete Account', icon: settingsMenuImg, page: 'DeleteAccount' },
    { id: 7, title: 'Support', icon: supportMenuImg, page: 'CustomerSupport' },
    { id: 8, title: 'Term And Condition', icon: termMenuImg, page: 'Termsofuse' },
    { id: 9, title: 'Privacy Policy', icon: policyMenuImg, page: 'PrivacyPolicy' },
    { id: 11, title: 'Refund Policy', icon: policyMenuImg, page: 'RefundPolicy' },
    { id: 10, title: 'Logout', icon: logoutMenuImg, page: 'Logout' },
];

const MenuScreen = ({ route }) => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
    const [pickedDocument, setPickedDocument] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [userInfo, setUserInfo] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);

    // Calculate responsive dimensions
    const profileImageSize = responsiveWidth(20); // 20% of screen width
    const svgSize = profileImageSize * 2; // Reduced SVG container size
    const centerPoint = svgSize / 2;
    const innerCircleRadius = profileImageSize * 0.65;
    const outerCircleRadius = profileImageSize * 0.8;

    const fetchProfileDetails = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
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
                    setIsLoading(false)
                })
                .catch(e => {
                    console.log(`Profile error from home page ${e}`)
                });
        });
    }

    useEffect(() => {
        fetchProfileDetails();
    }, [])

    useFocusEffect(
        useCallback(() => {
            fetchProfileDetails();
        }, [navigation])
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

    const navigationFunction = (item) => {
        if (item === 'Logout') {
            Alert.alert(
                'Confirm Logout',
                'Are you sure you want to logout?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Logout',
                        onPress: () => logout(),
                        style: 'destructive',
                    },
                ],
                { cancelable: true }
            );
        } else if (item === "DeleteAccount") {
            Alert.alert(
                'Confirm Delete Account',
                'Are you sure you want to delete your account?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: () => {
                            // Open the URL when Delete is pressed
                            Linking.openURL(`${BASE_URL}/delete-account`).catch(err => {
                                console.error('Failed to open URL:', err);
                                Alert.alert('Error', 'Failed to open the link');
                            });
                        },
                        style: 'destructive',
                    },
                ],
                { cancelable: true }
            );
        } else {
            navigation.navigate(item);
        }
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />  
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Profile</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('ProfileEditScreen')}>
                        <Image
                            source={editImg}
                            style={styles.editIcon}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.wrapper}>
                    <View style={styles.mainView}>
                        {/* Improved SVG for Circular Ripple with Better Responsiveness */}
                        <View style={[styles.svgContainer, { width: svgSize, height: svgSize }]}>
                            <Svg height={svgSize} width={svgSize} style={styles.svg}>
                                <Defs>
                                    {/* Gradient Mask to Fade Bottom */}
                                    <LinearGradient id="fadeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0%" stopColor="white" stopOpacity="1" />
                                        <Stop offset="70%" stopColor="white" stopOpacity="0.6" />
                                        <Stop offset="100%" stopColor="white" stopOpacity="0" />
                                    </LinearGradient>

                                    {/* Masking the Circles */}
                                    <Mask id="circleMask">
                                        <Rect x="0" y="0" width={svgSize} height={svgSize * 0.65} fill="url(#fadeGradient)" />
                                    </Mask>
                                </Defs>

                                {/* Outer Circles with Mask - Now Responsive */}
                                <Circle 
                                    cx={centerPoint} 
                                    cy={centerPoint} 
                                    r={outerCircleRadius} 
                                    stroke="#FF7788" 
                                    strokeWidth="1.5" 
                                    fill="none" 
                                    mask="url(#circleMask)" 
                                />
                                <Circle 
                                    cx={centerPoint} 
                                    cy={centerPoint} 
                                    r={innerCircleRadius} 
                                    stroke="#FF99AA" 
                                    strokeWidth="1.5" 
                                    fill="none" 
                                    mask="url(#circleMask)" 
                                />
                            </Svg>
                            
                            {/* Profile Image Container - Positioned in center of SVG */}
                            <View style={[styles.imageContainer, {
                                width: profileImageSize,
                                height: profileImageSize,
                                position: 'absolute',
                                top: centerPoint - (profileImageSize / 2),
                                left: centerPoint - (profileImageSize / 2),
                            }]}>
                                <Image 
                                    source={{ uri: userInfo.profile_photo_url }} 
                                    style={[styles.imageStyle, {
                                        width: profileImageSize * 0.9,
                                        height: profileImageSize * 0.9,
                                        borderRadius: (profileImageSize * 0.9) / 2,
                                    }]} 
                                />
                            </View>
                        </View>
                        
                        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: responsiveHeight(1),marginBottom: responsiveHeight(2) }}>
                            <Text style={styles.username}>{userInfo?.first_name} {userInfo?.last_name}</Text>
                            {/* <Text style={styles.useremail}>kristin123@gmail.com</Text> */}
                        </View>
                    </View>
                    <View style={styles.menucontainer}>
                        <FlatList
                            data={menuItems}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.menuItem} onPress={() => navigationFunction(item.page)}>
                                    <View style={styles.iconContainer}>
                                        <Image
                                            source={item.icon}
                                            style={styles.menuIcon}
                                        />
                                    </View>
                                    <Text style={styles.menuText}>{item.title}</Text>
                                    <Image
                                        source={arrowRightImg}
                                        style={styles.arrowIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView >
    );
};

export default MenuScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FAFAFA',
        flex: 1,
        marginBottom: Platform.OS === 'ios' ? -responsiveHeight(3):0,
    },
    wrapper: {
        paddingHorizontal: 10,
        marginBottom: responsiveHeight(2)
    },
    mainView: {
        alignSelf: 'center',
        marginTop: responsiveHeight(1), // Reduced top margin
        justifyContent: 'center',
        alignItems: 'center'
    },
    svgContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    loader: {
        position: 'absolute',
    },
    imageStyle: {
        // Dynamic sizing will be applied inline
        resizeMode: 'cover',
    },
    editIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
        marginRight: 15
    },
    username: {
        color: "#000000",
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(2),
    },
    useremail: {
        color: "#545F71",
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(2),
    },
    menucontainer: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        margin: responsiveWidth(0),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 5,
        borderRadius: 10,
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
        margin: 5
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffe5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'Poppins-Medium',
        color: '#1B2234',
    },
    arrowIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
    },
    menuIcon: {
        height: 22,
        width: 22,
        resizeMode: 'contain',
    },
    svg: {
        // Remove absolute positioning
    },
});