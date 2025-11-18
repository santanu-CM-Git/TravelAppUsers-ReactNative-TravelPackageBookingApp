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
    KeyboardAwareScrollView,
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
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder, notificationImg, markerImg, searchIconImg, productImg, travelImg, likefillImg, mappinImg, starImg, arrowBackImg, shareImg, calendarImg, CheckImg, addnewImg, mybookingMenuImg, transactionMenuImg, arrowRightImg, cancelTourImg } from '../../../utils/Images';
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
import SwitchSelector from "react-native-switch-selector";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/Entypo';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');
const itemWidth = width * 0.8; // 80% of screen width
const imageHeight = itemWidth * 0.5; // Maintain a 4:3 aspect ratio


export default function ChatListScreen({ }) {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [chatList, setChatList] = useState([]);
    const [filteredChatList, setFilteredChatList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const { userInfo } = useContext(AuthContext);

    const fetchChatList = async (page = 1, isRefreshing = false) => {
        try {
            if (page === 1) {
                setIsLoading(true);
            } else {
                setLoadingMore(true);
            }

            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                setIsLoading(false);
                return;
            }

            const response = await axios.post(`${API_URL}/customer/message-list`, {}, {
                params: {
                    page
                },
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Accept': 'application/json',
                }
            });

            if (response.data.response) {
                const { data, current_page, last_page } = response.data.data;

                if (isRefreshing || page === 1) {
                    setChatList(data);
                } else {
                    setChatList(prevList => [...prevList, ...data]);
                }

                setCurrentPage(current_page);
                setLastPage(last_page);
            }
        } catch (error) {
            console.error('Error fetching chat list:', error);
            Alert.alert('Error', 'Failed to fetch chat list');
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchChatList();
    }, []);

    useEffect(() => {
        // Filter chat list when search text changes
        if (searchText.trim() === '') {
            setFilteredChatList(chatList);
        } else {
            const filtered = chatList.filter(item =>
                item.agent.name.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredChatList(filtered);
        }
    }, [searchText, chatList]);

    useFocusEffect(
        useCallback(() => {
            fetchChatList()
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchChatList(1, true);
    };

    const loadMore = () => {
        if (currentPage < lastPage && !loadingMore) {
            fetchChatList(currentPage + 1);
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#000" />
            </View>
        );
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={styles.Container}>
            <StatusBar translucent={false} backgroundColor="black" barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />  
            <CustomHeader commingFrom={'My Message'} onPress={() => navigation.navigate('HOME', { screen: 'Home' })} title={'My Message'} />
            <View style={styles.searchSection}>
                <View style={styles.searchInput}>
                    <View style={{ flexDirection: 'row', alignItems: "center", flex: 1 }}>
                        <Image
                            source={searchIconImg}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Search by agent name"
                            placeholderTextColor="#888"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchText('')}
                                style={styles.clearButton}
                            >
                                <Icon name="cross" size={20} color="#888" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            <FlatList
                data={filteredChatList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => navigation.navigate('ChatScreen', {
                            agentId: item?.agent?.id
                        })}
                    >
                        <Image
                            source={{ uri: item.agent.profile_photo_url }}
                            style={styles.avatar}
                            defaultSource={productImg}
                        />
                        <View style={styles.chatDetails}>
                            <Text style={styles.chatName}>{item.agent.name}</Text>
                            <Text style={styles.chatMessage} numberOfLines={1}>{item.last_message}</Text>
                        </View>
                        <View style={styles.chatMeta}>
                            <Text style={styles.chatTime}>{formatTime(item.updated_at)}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {searchText ? 'No agents found matching your search' : 'No messages yet'}
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        //paddingTop: responsiveHeight(1),
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
    input: {
        flex: 1,
        fontSize: responsiveFontSize(1.5),
        color: "#000",
        fontFamily: 'Poppins-Regular',
    },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    chatDetails: {
        flex: 1,
        marginLeft: 12,
    },
    chatName: {
        fontFamily: 'Poppins-Medium',
        fontSize: responsiveFontSize(1.7),
        color: '#000000',
    },
    chatMessage: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#545F71',
        marginTop: 2,
    },
    chatMeta: {
        alignItems: "flex-end",
    },
    chatTime: {
        fontFamily: 'Poppins-Regular',
        fontSize: responsiveFontSize(1.6),
        color: '#545F71',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center'
    },
    clearButton: {
        padding: 8,
        marginRight: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: responsiveFontSize(1.8),
        color: '#888',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
    },
});