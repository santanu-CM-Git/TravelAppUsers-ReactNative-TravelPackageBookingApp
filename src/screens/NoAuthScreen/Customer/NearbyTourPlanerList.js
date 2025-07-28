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
    ImageBackground,
    StatusBar,
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
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, filterImg, productImg, travelImg, likefillImg, mappinImg, starImg } from '../../../utils/Images';
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
import Icon from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio

export default function NearbyTourPlanerList({  }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [nearbyTourAgent, setNearbyTourAgent] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [pageno, setPageno] = useState(1);
    const [loading, setLoading] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [countryName, setCountryName] = useState(null);
    const [isLocationDataReady, setIsLocationDataReady] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState([]);

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
                    setLatitude(userInfo?.lat);
                    setLongitude(userInfo?.long);
                    setCountryName(userInfo?.country);
                    setIsLocationDataReady(true);
                })
                .catch(e => {
                    console.log(`Profile error from home page ${e}`)
                });
        });
    }

    const fetchNearbyTourPlaner = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }

            const response = await axios.post(
                `${API_URL}/customer/nearBy-traveller`,
                {
                    lat: latitude,
                    long: longitude,
                    country: countryName
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

            const responseData = response.data.data.data;
            console.log(responseData, 'nearby tour planner data');
            setNearbyTourAgent(prevData => page === 1 ? responseData : [...prevData, ...responseData]);

            if (responseData.length === 0) {
                setHasMore(false); // No more data to load
            }
        } catch (error) {
            console.log(`Fetch nearby tour planner error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror == 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, [latitude, longitude, countryName]);

    useEffect(() => {
        fetchProfileDetails();
    }, []);

    useEffect(() => {
        if (isLocationDataReady && latitude && longitude && countryName) {
            fetchNearbyTourPlaner(1);
        }
    }, [isLocationDataReady, latitude, longitude, countryName]);

    useEffect(() => {
        if (pageno > 1) {
            fetchNearbyTourPlaner(pageno);
        }
    }, [pageno]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPageno(prevPage => prevPage + 1);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === '') {
            setFilteredData(nearbyTourAgent);
        } else {
            const filtered = nearbyTourAgent.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(filtered);
        }
    };

    useEffect(() => {
        setFilteredData(nearbyTourAgent);
    }, [nearbyTourAgent]);

    const renderNearbyTourPlanner = ({ item }) => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate('TravelAgencyDetails', { item:item,countryName:countryName })}>
            <View style={styles.productSection}>
                <View style={styles.topAstrologerSection}>
                    <View style={styles.totalValue3}>
                        <Image source={{ uri: item?.profile_photo_url }} style={styles.productImg3} />
                        <View style={{ margin: 5 }}>
                            <Text style={styles.productText3}>{item.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={mappinImg} style={styles.pinImg} />
                                <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                            </View>
                            <View
                                style={{
                                    borderBottomColor: '#C0C0C0',
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    marginVertical: 5,
                                }}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.packageAvlText}>Package : {item.no_of_active_packages}</Text>
                                {item?.rating !== null && item?.rating !== undefined && item?.rating !== 0 && (
                                    <View style={styles.rateingView}>
                                        <Image source={starImg} style={[styles.staricon, { marginTop: -5 }]} />
                                        <Text style={styles.ratingText}>{item.rating}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Nearby Tour Planner'} onPress={() => navigation.goBack()} title={'Nearby Tour Planner'} />
            <View style={styles.searchInput}>
                <View style={{ flexDirection: 'row', alignItems: "center", flex: 1 }}>
                    <Image
                        source={searchIconImg}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Search by name"
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: responsiveHeight(1) }}>
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNearbyTourPlanner}
                    contentContainerStyle={{ marginHorizontal: 10 }}
                    numColumns={2}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => loading && <ActivityIndicator size="small" color="#FF455C" style={{ alignSelf: 'center' }} />}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No tour planners found</Text>
                        </View>
                    )}
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
        alignSelf: 'center',
        marginTop: responsiveHeight(2)
    },
    searchIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginHorizontal: 8
    },
    input: {
        flex: 1,
        fontSize: responsiveFontSize(1.5),
        color: "#000",
        fontFamily: 'Poppins-Regular',
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
    totalValue3: {
        width: responsiveWidth(46),
        //height: responsiveHeight(34),
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
    productImg3: {
        height: responsiveHeight(21),
        width: responsiveFontSize(21),
        resizeMode: 'cover',
        borderRadius: 15,
        alignSelf: 'center'
    },
    productText3: {
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
    ratingText: {
        fontSize: responsiveFontSize(1.5),
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 5
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: responsiveHeight(20),
    },
    emptyText: {
        fontSize: responsiveFontSize(2),
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
});