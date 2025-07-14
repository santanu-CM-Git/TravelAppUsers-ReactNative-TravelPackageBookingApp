import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, RefreshControl, TextInput, Image, FlatList, TouchableOpacity, BackHandler, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert, Platform, StatusBar } from 'react-native'
import CustomHeader from '../../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, calendarImg, cameraColor, chatColor, checkedImg, CheckImg, dateIcon, filterImg, likefillImg, mappinImg, phoneColor, plusIconstickyImg, productImg, searchIconImg, starImg, timeIcon, timeImg, tourImg, uncheckedImg, userImg } from '../../../utils/Images'
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
import RadioGroup from 'react-native-radio-buttons-group';
import DateTimePicker from "@react-native-community/datetimepicker";
import IconF from "react-native-vector-icons/FontAwesome";
import debounce from 'lodash.debounce';

const SearchScreen = ({ navigation, route }) => {

    const [isLoading, setIsLoading] = useState(false)
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [starCount, setStarCount] = useState(5)
    const [searchText, setSearchText] = useState("");
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    const [selectedId, setSelectedId] = useState();

    const radioButtons = useMemo(() => ([
        {
            id: '1',
            label: 'All  packages',
            value: 'All  packages',
            labelStyle: {
                color: '#131313',
                fontFamily: 'Poppins-Regular'

            },
            borderColor: '#FF455C',
            color: '#FF455C',
            size: 18,

        },
        {
            id: '2',
            label: 'International',
            value: 'International',
            labelStyle: {
                color: '#131313',
                fontFamily: 'Poppins-Regular'
            },
            borderColor: '#FF455C',
            color: '#FF455C',
            size: 18,
        },
        {
            id: '3',
            label: 'Domestic',
            value: 'Domestic',
            labelStyle: {
                color: '#131313',
                fontFamily: 'Poppins-Regular'
            },
            borderColor: '#FF455C',
            color: '#FF455C',
            size: 18,
        },

    ]), []);

    const [selectedId2, setSelectedId2] = useState();

    const radioButtons2 = useMemo(() => ([
        {
            id: '1',
            label: 'Male',
            value: 'Male',
            labelStyle: {
                color: '#131313',
                fontFamily: 'Poppins-Regular'

            },
            borderColor: '#FF455C',
            color: '#FF455C',
            size: 18,

        },
        {
            id: '2',
            label: 'Female',
            value: 'Female',
            labelStyle: {
                color: '#131313',
                fontFamily: 'Poppins-Regular'
            },
            borderColor: '#FF455C',
            color: '#FF455C',
            size: 18,
        },

    ]), []);

    const onChangeFromDate = (event, selectedDate) => {
        setShowFromDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
        if (selectedDate) setFromDate(selectedDate);
    };

    const onChangeToDate = (event, selectedDate) => {
        setShowToDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
        if (selectedDate) setToDate(selectedDate);
    };

    useEffect(() => {

    }, []);

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const [pricevalues, setPriceValues] = useState([5000, 25000]);

    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState([])
    const [mostPopular, setMostPopular] = useState([])

    const fetchSuggestions = async (query) => {
        try {
            // Validate required field
            if (!query) {
                setSuggestions([]);
                return;
            }

            setIsSuggestionsLoading(true);

            const payload = {
                "string": query,
                "country": "India"
            };

            const userToken = await AsyncStorage.getItem('userToken'); // if token is needed

            const response = await axios.post(
                `${API_URL}/customer/location-auto-complete`,
                payload,
                {
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                        "Content-Type": 'application/json'
                    }
                }
            );

            if (response.data.response === true) {
                console.log(response.data.data,'dsddsfdsfdsf');
                
                setSuggestions(response.data.data || []);
            } else {
                Alert.alert('Error', response.data.message || 'Failed to fetch suggestions');
                setSuggestions([]);
            }
        } catch (error) {
            console.log('Fetch suggestions error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong while fetching suggestions');
            setSuggestions([]);
        } finally {
            setIsSuggestionsLoading(false);
        }
    };

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 400), []);

    const storeSearch = async (locationid,locationName) => {
        try {
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                throw new Error('User token not found');
            }
            const option = {
                "location" : locationid,
                "location_name" : locationName,
                "string": ""
            }
            const response = await axios.post(
                `${API_URL}/customer/search-store`,
                option,
                {
                    headers: {
                        "Authorization": `Bearer ${usertoken}`,
                        "Content-Type": 'application/json',
                    },
                }
            );

            if(response.data.response == true){
                console.log('OK')
            }

        } catch (error) {
            console.log(`search-store error ${error}`);
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const fetchSearchHistory = async () => {
        try {
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                throw new Error('User token not found');
            }

            const response = await axios.post(
                `${API_URL}/customer/search-history`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${usertoken}`,
                        "Content-Type": 'application/json',
                    },
                }
            );

            let history = response.data.data;

            setSearchHistory(history);
        } catch (error) {
            console.log(`fetch Search History error ${error}`);
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const fetchMostPopular = async () => {
        try {
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                throw new Error('User token not found');
            }

            const response = await axios.post(
                `${API_URL}/customer/search-history`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${usertoken}`,
                        "Content-Type": 'application/json',
                    },
                }
            );

            let history = response.data.data;

            setMostPopular(history);
        } catch (error) {
            console.log(`fetch Search History error ${error}`);
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const renderSearchHistory = ({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8B8B8B', borderBottomWidth: 1, paddingBottom: responsiveHeight(2), paddingTop: responsiveHeight(2) }}>
            <Image
                source={timeIcon}
                style={[styles.filterIcon, { marginRight: 5 }]}
            />
            <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(1.7), color: '#FF455C' }}>Jammu-Kashmir</Text>
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7), color: '#A9A8A8' }}>Jammu-Kashmir</Text>
            </View>
        </View>
    );

    const renderMostPopular = ({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8B8B8B', borderBottomWidth: 1, paddingBottom: responsiveHeight(2), paddingTop: responsiveHeight(2) }}>
            <Image
                source={timeIcon}
                style={[styles.filterIcon, { marginRight: 5 }]}
            />
            <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(1.7), color: '#FF455C' }}>Jammu-Kashmir</Text>
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7), color: '#A9A8A8' }}>Jammu-Kashmir</Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <Loader />
        )
    }

    useEffect(()=>{
        fetchSearchHistory();
        fetchMostPopular();
    },[])

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
            <StatusBar translucent={false} backgroundColor="black" barStyle="light-content" />
            <CustomHeader commingFrom={'Search'} onPress={() => navigation.goBack()} title={'Search'} />
            <ScrollView showsHorizontalScrollIndicator={false}>
                <View style={styles.searchSection}>
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
                                onChangeText={(text) => {
                                    setSearchText(text);
                                    debouncedFetchSuggestions(text);
                                }}
                            />
                        </View>
                        <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <Image
                                source={filterImg}
                                style={[styles.filterIcon, { marginRight: 5 }]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                    {/* Suggestions List */}
                    {isSuggestionsLoading && <Text>Loading...</Text>}
                    {!isSuggestionsLoading && suggestions.length > 0 && (
                        <View style={{
                            backgroundColor: '#fff',
                            borderRadius: 8,
                            marginTop: 4,
                            elevation: 3,
                            zIndex: 10,
                            position: 'absolute',
                            top: responsiveHeight(6.5),
                            left: 0,
                            right: 0,
                            margin: 10
                        }}>
                            {suggestions.map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => {
                                        setSearchText(item);
                                        setSuggestions([]);
                                        storeSearch(item?.id,item?.name)
                                    }}
                                    style={{ padding: 12, borderBottomWidth: idx === suggestions.length - 1 ? 0 : 1, borderBottomColor: '#eee' }}
                                >
                                    <Text style={{ color: '#333',fontFamily: 'Poppins-Regular',fontSize: responsiveFontSize(1.7) }}>{item?.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                <View style={{ paddingHorizontal: 15, }}>
                    <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Search history</Text>
                   
                    <FlatList
                        data={searchHistory}
                        keyExtractor={(item) => item.id}
                        renderItem={renderSearchHistory}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                              <Text style={styles.emptyText}>No search history found.</Text>
                            </View>
                          )}
                    />
                </View>
                <View style={{ paddingHorizontal: 15, marginTop: responsiveHeight(2) }}>
                    <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Most Popular</Text>
                    <FlatList
                        data={mostPopular}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMostPopular}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                              <Text style={styles.emptyText}>No popular location found.</Text>
                            </View>
                          )}
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
                <View style={{ height: '75%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
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
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Days</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveHeight(2) }}>
                                <View style={{ flexDirection: 'column' }}>
                                    {/* From Date */}
                                    <Text style={styles.textinputHeader}>Departure Date</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowFromDatePicker(true)}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: "#ddd",
                                            paddingHorizontal: 10,
                                            paddingVertical: 13,
                                            borderRadius: 5,
                                            marginTop: 5,
                                        }}
                                    >
                                        <Icon name="calendar" size={20} color="red" />
                                        <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{fromDate.toDateString()}</Text>
                                    </TouchableOpacity>
                                    {showFromDatePicker && (
                                        <DateTimePicker
                                            value={fromDate}
                                            mode="date"
                                            display="default"
                                            onChange={onChangeFromDate}
                                        />
                                    )}
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    {/* To Date */}
                                    <Text style={styles.textinputHeader}>Return Date</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowToDatePicker(true)}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: "#ddd",
                                            paddingHorizontal: 10,
                                            paddingVertical: 13,
                                            borderRadius: 5,
                                            marginTop: 5,
                                        }}
                                    >
                                        <Icon name="calendar" size={20} color="red" />
                                        <Text style={{ marginLeft: 10, color: '#767676', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.7) }}>{toDate.toDateString()}</Text>
                                    </TouchableOpacity>
                                    {showToDatePicker && (
                                        <DateTimePicker
                                            value={toDate}
                                            mode="date"
                                            display="default"
                                            onChange={onChangeToDate}
                                        />
                                    )}
                                </View>
                            </View>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Type</Text>
                            <View style={{ marginTop: responsiveHeight(1), marginBottom: responsiveHeight(1), marginLeft: -responsiveWidth(2.5) }}>
                                <RadioGroup
                                    radioButtons={radioButtons}
                                    onPress={setSelectedId}
                                    selectedId={selectedId}
                                    layout='row'
                                    containerStyle={{ flexWrap: 'wrap' }}
                                />
                            </View>
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
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'Poppins-SemiBold', }}>Gender</Text>
                            <View style={{ marginTop: responsiveHeight(1), marginBottom: responsiveHeight(1), marginLeft: -responsiveWidth(2.5) }}>
                                <RadioGroup
                                    radioButtons={radioButtons2}
                                    onPress={setSelectedId2}
                                    selectedId={selectedId2}
                                    layout='row'
                                    containerStyle={{ flexWrap: 'wrap' }}
                                />
                            </View>
                        </View>
                    </ScrollView>
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

export default SearchScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    productSection: {
        marginTop: responsiveHeight(0),
        marginLeft: 20
    },
    topAstrologerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    totalValue4: {
        width: responsiveWidth(90),
        height: responsiveHeight(45),
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
    input: {
        flex: 1,
        fontSize: responsiveFontSize(1.5),
        color: "#000",
        fontFamily: 'Poppins-Regular',
    },
    textinputHeader: {
        fontSize: responsiveFontSize(1.5),
        color: '#000000',
        fontFamily: 'Poppins-Medium',
        marginBottom: 5,
        marginTop: 10
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
