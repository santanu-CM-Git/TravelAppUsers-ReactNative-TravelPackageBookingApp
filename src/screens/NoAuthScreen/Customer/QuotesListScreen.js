import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { AuthContext } from '../../../context/AuthContext';

const QuotesListScreen = ({ route }) => {

    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false)
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [starCount, setStarCount] = useState(5)
    const [refreshing, setRefreshing] = useState(false);
    const [pageno, setPageno] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [quoteList, setQuoteList] = useState([])
    const [filteredQuoteList, setFilteredQuoteList] = useState([])
    const [searchText, setSearchText] = useState("");
    const { logout } = useContext(AuthContext);

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const [pricevalues, setPriceValues] = useState([0, 25000]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(25000);
    const [distancevalues, setDistanceValues] = useState([0, 2000]);

    // Add these new state variables to track which filters have been modified
    const [initialFilters, setInitialFilters] = useState({
        priceValues: [0, 25000],
        starCount: 5,
        distanceValues: [0, 2000]
    });

    const [modifiedFilters, setModifiedFilters] = useState({
        priceModified: false,
        ratingModified: false,
        distanceModified: false
    });

    // Update price change handler
    const handlePriceChange = (values) => {
        setPriceValues(values);
        setModifiedFilters(prev => ({ ...prev, priceModified: true }));
    };

    // Update rating change handler
    const handleRatingChange = (rating) => {
        setStarCount(rating);
        setModifiedFilters(prev => ({ ...prev, ratingModified: true }));
    };

    // Update distance change handler
    const handleDistanceChange = (values) => {
        setDistanceValues(values);
        setModifiedFilters(prev => ({ ...prev, distanceModified: true }));
    };

    const fetchMyQuoteRequest = useCallback(async (page = 1, filters = {}) => {
        console.log(route?.params?.quoteId);
    
        try {
            setLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }

            const requestData = {
                request_quotes_id: route?.params?.quoteId,
                ...filters
            };

            console.log('Fetching quotes with filters:', requestData);

            const response = await axios.post(`${API_URL}/customer/suggested-quotes`, requestData, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });
    
            const responseData = response.data.data.request_quotes_lead;
            console.log(JSON.stringify(responseData), 'Quotes suggestion list');
            setQuoteList(responseData);
            setFilteredQuoteList(responseData);
    
            // Extract only valid numeric prices
            const prices = responseData.map(item => parseFloat(item.package?.discounted_price || item.package?.price || 0));
    
            if (prices.length > 0) {
                const max = Math.max(...prices);
                setMinPrice(0);
                setMaxPrice(max);
                if (!modifiedFilters.priceModified) {
                    setPriceValues([0, max]);
                }
            }
    
        } catch (error) {
            console.log(`Fetch session history error: ${error}`);
            let myerror = error.response?.data?.message;
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => myerror === 'Unauthorized' ? logout() : console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, [route?.params?.quoteId, modifiedFilters.priceModified]);

    useEffect(() => {
        fetchMyQuoteRequest();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMyQuoteRequest();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setQuoteList([]);
        setFilteredQuoteList([]);
        await fetchMyQuoteRequest();
        setRefreshing(false);
    }, [fetchMyQuoteRequest]);

    // Handle search functionality
    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === '') {
            setFilteredQuoteList(quoteList);
        } else {
            const filtered = quoteList.filter(item =>
                item.package?.name.toLowerCase().includes(text.toLowerCase()) ||
                item.package?.location.toLowerCase().includes(text.toLowerCase()) ||
                item.agent?.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredQuoteList(filtered);
        }
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
            <TouchableOpacity activeOpacity={0.5}
                onPress={() =>
                    navigation.navigate('HOME', {
                        screen: 'PackageDetailsScreen',
                        params: { packageId: item?.package?.id },
                    })
                }>
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
                                {item?.package?.date_type == 0 ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                        <Image
                                            source={userImg}
                                            style={styles.pinImg}
                                            tintColor={'#686868'}
                                        />
                                        <Text style={styles.packageAvlText}>Total Passengers : {item?.package?.seat_slots}</Text>
                                    </View>
                                ) : (
                                    null
                                )}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {item?.package?.date_type == 0 ? (
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
                                    ) : (
                                        null
                                    )}
                                    <View style={styles.rateingView}>
                                        <Image
                                            source={starImg}
                                            style={[styles.staricon, { marginTop: -5 }]}
                                        />
                                        <Text style={styles.ratingText}>{item?.agent?.rating}</Text>
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
                            {item?.package?.date_type == 0 ? (
                                <View style={styles.tagTextView4}>
                                    <View style={styles.dateContainer}>
                                        <Image source={calendarImg} tintColor={'#FFFFFF'} style={[styles.timeimage, { marginRight: 5 }]} />
                                        <Text style={styles.dateText}>{moment(item?.package?.start_date).format('DD MMM YYYY')}</Text>
                                    </View>
                                </View>
                            ) : (
                                null
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
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

    // Updated submitForFilter function
    const submitForFilter = async () => {
        try {
            const filters = {};

            // Only add price filters if they were modified
            if (modifiedFilters.priceModified) {
                filters.min_price = pricevalues[0];
                filters.max_price = pricevalues[1];
            }

            // Only add rating filter if it was modified
            if (modifiedFilters.ratingModified) {
                filters.rating = starCount;
            }

            // Only add distance filter if it was modified
            if (modifiedFilters.distanceModified) {
                filters.min_distance = distancevalues[0];
                filters.max_distance = distancevalues[1];
            }

            console.log('Applied filters:', filters);

            // Close the filter modal
            toggleFilterModal();

            // Fetch filtered data
            await fetchMyQuoteRequest(1, filters);
        } catch (error) {
            console.log('Error applying filters:', error);
        }
    };

    // Updated resetFilters function
    const resetFilters = async () => {
        try {
            // Reset all filter states to initial values
            setPriceValues([0, 25000]);
            setStarCount(5);
            setDistanceValues([0, 2000]);

            // Reset modification tracking
            setModifiedFilters({
                priceModified: false,
                ratingModified: false,
                distanceModified: false
            });

            // Fetch initial data without filters
            await fetchMyQuoteRequest(1);

            // Close the filter modal
            toggleFilterModal();
        } catch (error) {
            console.log('Error resetting filters:', error);
        }
    };

    // Add this function to get active filters count
    const getActiveFiltersCount = () => {
        let count = 0;
        if (modifiedFilters.priceModified) count++;
        if (modifiedFilters.ratingModified) count++;
        if (modifiedFilters.distanceModified) count++;
        return count;
    };

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />  
            <CustomHeader commingFrom={'List of quotes'} onPress={() => navigation.goBack()} title={'List of quotes'} />
            <ScrollView showsHorizontalScrollIndicator={false}>
                <View style={styles.searchSection}>
                    <View style={styles.searchInput}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Image
                                source={searchIconImg}
                                style={styles.searchIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Search"
                                placeholderTextColor="#888"
                                value={searchText}
                                onChangeText={handleSearch}
                            />
                        </View>
                        {/* <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <View style={styles.filterContainer}>
                                <Image
                                    source={filterImg}
                                    style={[styles.filterIcon, { marginRight: 5 }]}
                                />
                                {getActiveFiltersCount() > 0 && (
                                    <View style={styles.filterBadge}>
                                        <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback> */}
                    </View>
                </View>
                <View style={{ alignSelf: 'center' }}>
                    <FlatList
                        data={filteredQuoteList}
                        renderItem={renderQuote}
                        keyExtractor={(item) => item.id.toString()}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={10}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', marginTop: responsiveHeight(5) }}>No quotes found</Text>
                        }
                    />
                </View>
            </ScrollView>
            <Modal
                isVisible={isFilterModalVisible}
                style={{
                    margin: 0,
                    justifyContent: 'flex-end',
                }}>
                <View style={{ height: '60%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-Bold', }}>Filter</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#B0B0B0', height: 30, width: 30, borderRadius: 25, }}>
                                <Icon name="cross" size={20} color="#000000" onPress={toggleFilterModal} />
                            </View>
                        </View>
                    </View>
                    <ScrollView style={{ marginBottom: responsiveHeight(0) }}>
                        <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 0, paddingHorizontal: 15, marginBottom: 5 }}>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Price</Text>
                            <View style={styles.slidercontainer}>
                                <MultiSlider
                                    values={pricevalues}
                                    sliderLength={responsiveWidth(80)}
                                    onValuesChange={handlePriceChange}
                                    min={minPrice}
                                    max={maxPrice}
                                    step={500}
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
                                    onChange={handleRatingChange}
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
                                    onValuesChange={handleDistanceChange}
                                    min={0}
                                    max={2000}
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
                    </ScrollView>

                    <View style={{ bottom: 0, paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: responsiveWidth(40), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                                <CustomButton
                                    label={"Reset"}
                                    onPress={resetFilters}
                                    buttonStyle={{ backgroundColor: '#E3E3E3' }}
                                    textStyle={{ color: '#000' }}
                                />
                            </View>

                            <View style={{ width: responsiveWidth(40), marginTop: responsiveHeight(2), alignSelf: 'center' }}>
                                <CustomButton label={"Apply"}
                                    onPress={submitForFilter}
                                />
                            </View>
                        </View>
                    </View>
                </View>
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
    },
    topAstrologerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    totalValue4: {
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 15,
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
        margin: 2,
        marginBottom: responsiveHeight(2),
        marginRight: 5
    },
    productImg4: {
        height: responsiveHeight(21),
        width: responsiveFontSize(44),
        resizeMode: 'cover',
        borderRadius: 15,
        alignSelf: 'center'
    },
    productText4: {
        color: '#1E2023',
        fontFamily: 'Poppins-SemiBold',
        fontSize: responsiveFontSize(1.8),
        marginTop: responsiveHeight(1),
        width: responsiveWidth(55),
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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
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
    input: {
        flex: 1,
        fontSize: responsiveFontSize(1.7),
        color: '#1B2234',
        fontFamily: 'Poppins-Regular',
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
    filterContainer: {
        position: 'relative',
    },
    filterIcon: {
        height: 32,
        width: 32,
        resizeMode: 'contain'
    },
    filterBadge: {
        position: 'absolute',
        top: -5,
        right: 0,
        backgroundColor: '#FF455C',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
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