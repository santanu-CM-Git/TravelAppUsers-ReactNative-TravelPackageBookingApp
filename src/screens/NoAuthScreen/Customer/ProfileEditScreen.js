import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
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
  BackHandler
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from '@react-native-documents/picker';
import InputField from '../../../components/InputField';
import CustomButton from '../../../components/CustomButton';
import { AuthContext } from '../../../context/AuthContext';
import Loader from '../../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import moment from "moment"
import Toast from 'react-native-toast-message';
import { plus, userPhoto } from '../../../utils/Images';
import Svg, { Circle, Defs, LinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';

const dataGender = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' }
];
const dataMarital = [
  { label: 'Married', value: 'Married' },
  { label: 'Single', value: 'Single' },
  { label: 'Divorced', value: 'Divorced' },
  { label: 'Widowed', value: 'Widowed' }
];

const ProfileEditScreen = ({ navigation, route }) => {

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
  const [pickedDocument, setPickedDocument] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/customer/profile-details`, {}, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": 'application/json'
        },
      });
      
      const userData = response.data.data;
      setFirstname(userData.first_name || '');
      setLastname(userData.last_name || '');
      const countryCode = userData?.country_code;
      const mobile = userData?.mobile;
      setMobile(countryCode + mobile);
      setAddress(userData.address || '');
      if (userData.profile_photo_url) {
        setImageFile(userData.profile_photo_url);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Error fetching profile:', error);
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch profile data',
        position: 'top',
        topOffset: Platform.OS == 'ios' ? 55 : 20
      });
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const pickedDocument = result[0];
      setPickedDocument(pickedDocument);

      const formData = new FormData();
      if (pickedDocument) {
        formData.append("profile_pic", {
          uri: pickedDocument.uri,
          type: pickedDocument.type || 'image/jpeg',
          name: pickedDocument.name || 'photo.jpg',
        });
      } else {
        formData.append("profile_pic", "");
      }

    } catch (err) {
      setIsPicUploadLoading(false);
      if (DocumentPicker.isCancel(err)) {
        console.log('Document picker was cancelled');
      } else if (err.response) {
        console.log('Error response:', err.response.data?.response?.records);
        handleAlert('Oops..', err.response.data?.message);
      } else {
        console.error('Error picking document', err);
      }
    }
  };


  const changeFirstname = (text) => {
    setFirstname(text);
    if (text) {
      setFirstNameError('');
    } else {
      setFirstNameError('Please enter first name.');
    }
  };

  const changeLastname = (text) => {
    setLastname(text);
    if (text) {
      setLastNameError('');
    } else {
      setLastNameError('Please enter last name.');
    }
  };

  const changeMobile = (text) => {
    setMobile(text);
    if (text) {
      setMobileError('');
    } else {
      setMobileError('Please enter mobile number.');
    }
  };

  const submitForm = () => {
    if (!firstname) {
      setFirstNameError('Please enter first name.');
      return;
    } else {
      setFirstNameError('');
    }

    if (!lastname) {
      setLastNameError('Please enter last name.');
      return;
    } else {
      setLastNameError('');
    }


    setIsLoading(true);
    const formData = new FormData();
    
    if (pickedDocument) {
      formData.append("profile_photo", {
        uri: pickedDocument.uri,
        type: pickedDocument.type || 'image/jpeg',
        name: pickedDocument.name || 'photo.jpg',
      });
    }
    
    formData.append("first_name", firstname);
    formData.append("last_name", lastname);

    axios.post(`${API_URL}/customer/profile-update`, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        "Authorization": `Bearer ${userToken}`,
      },
    })
    .then(res => {
      if (res.data.response === true) {
        setIsLoading(false);
        Toast.show({
          type: 'success',
          text1: '',
          text2: "Profile updated successfully",
          position: 'top',
          topOffset: Platform.OS == 'ios' ? 55 : 20
        });
        fetchProfileData(); // Refresh profile data
      } else {
        setIsLoading(false);
        Alert.alert('Error', "Failed to update profile");
      }
    })
    .catch(e => {
      setIsLoading(false);
      console.log('Profile update error:', e);
      Alert.alert('Error', "Failed to update profile");
    });
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

  if (isLoading) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(0) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
          <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: responsiveFontSize(2.5), color: '#2F2F2F', marginLeft: responsiveWidth(5) }}>Profile</Text>
        </View>
        <View style={styles.wrapper}>
          <View style={styles.mainView}>
            {/* SVG for Circular Ripple with Bottom Fade */}
            <Svg height="250" width="250" style={styles.svg}>
              <Defs>
                {/* Gradient Mask to Fade Bottom */}
                <LinearGradient id="fadeGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="white" stopOpacity="1" />
                  <Stop offset="80%" stopColor="white" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="white" stopOpacity="0" />
                </LinearGradient>

                {/* Masking the Circles */}
                <Mask id="circleMask">
                  <Rect x="0" y="0" width="250" height="160" fill="url(#fadeGradient)" />
                </Mask>
              </Defs>

              {/* Outer Circles with Mask */}
              <Circle cx="125" cy="125" r="60" stroke="#FF7788" strokeWidth="2" fill="none" mask="url(#circleMask)" />
              <Circle cx="125" cy="125" r="50" stroke="#FF99AA" strokeWidth="2" fill="none" mask="url(#circleMask)" />
            </Svg>
            <View style={styles.imageContainer}>
              {isPicUploadLoading ? (
                <ActivityIndicator size="small" color="#417AA4" style={styles.loader} />
              ) : (
                pickedDocument == null ? (
                  imageFile != null ? (
                    <Image source={{ uri: imageFile }} style={styles.imageStyle} />
                  ) : (
                    <Image source={userPhoto} style={styles.imageStyle} />
                  )
                ) : (
                  <Image source={{ uri: pickedDocument.uri }} style={styles.imageStyle} />
                )
              )}
            </View>
            <TouchableOpacity style={styles.plusIcon} onPress={pickDocument}>
              <Image source={plus} style={styles.iconStyle} />
            </TouchableOpacity>
          </View>
          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>First name</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'First name'}
                keyboardType="default"
                value={firstname}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Last name</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {lastNameError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{lastNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Last name'}
                keyboardType="default"
                value={lastname}
                inputType={'others'}
                onChangeText={(text) => changeLastname(text)}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Mobile number</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {mobileError ? <Text style={{ color: 'red', fontFamily: 'Poppins-Regular' }}>{mobileError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Mobile number'}
                keyboardType="phone-pad"
                value={mobile}
                inputType={'nonedit'}
                onChangeText={(text) => changeMobile(text)}
              />
            </View>

            {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Address</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Address'}
                keyboardType="default"
                value={address}
                inputType={'nonedit'}
                onChangeText={(text) => setAddress(text)}
              />
            </View> */}
          </View>

        </View>


      </KeyboardAwareScrollView>
      <View style={styles.buttonwrapper}>

        <CustomButton label={"Submit"}
          onPress={() => { submitForm() }}
        />
      </View>
    </SafeAreaView >
  );
};

export default ProfileEditScreen;

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 23,
    //height: responsiveHeight(78)
    marginBottom: responsiveHeight(2)
  },
  header1: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: responsiveFontSize(3),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  header: {
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
  subheader: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '400',
    color: '#808080',
    marginBottom: responsiveHeight(1),
  },
  photoheader: {
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F'
  },
  imageView: {
    marginTop: responsiveHeight(2)
  },
  imageStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  plusIcon: {
    position: 'absolute',
    bottom: 10,
    left: 50
  },
  textinputview: {
    marginBottom: responsiveHeight(15),
    marginTop: responsiveHeight(5)
  },
  inputView: {
    paddingVertical: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    width: responsiveWidth(100),
  },
  searchInput: {
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    //borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5
  },
  dropdownMenu: {
    backgroundColor: '#FFF'
  },
  dropdownMenuSubsection: {
    borderBottomWidth: 0,

  },
  mainWrapper: {
    flex: 1,
    marginTop: responsiveHeight(1)

  },
  dropdownHalf: {
    height: responsiveHeight(7.2),
    width: responsiveWidth(89),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
  placeholderStyle: {
    fontSize: responsiveFontSize(1.8),
    color: '#2F2F2F',
    fontFamily: 'Poppins-Regular'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#2F2F2F'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#2F2F2F'
  },
  dayname: {
    color: '#716E6E',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '500'
  },
  calenderInput: {
    height: responsiveHeight(7),
    width: responsiveWidth(88),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: responsiveHeight(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  termsView: {
    marginBottom: responsiveHeight(3),
    paddingHorizontal: 10,
    //alignSelf: 'flex-start',
  },
  termsText: {
    color: '#746868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
    //textAlign: 'center',
  },
  termsLinkText: {
    color: '#746868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
    textAlign: 'center',
    textDecorationLine: 'underline', // Optional: to make the link look more like a link
  },
  doneButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#EEF8FF',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(5)
  },
  doneText: {
    color: '#000',
    fontWeight: 'bold',
  },
  mainView: {
    alignSelf: 'center',
    marginTop: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    height: 90,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loader: {
    position: 'absolute',
  },
  iconStyle: { height: 25, width: 25, resizeMode: 'contain' },
  svg: {
    position: 'absolute',
    bottom: -responsiveHeight(8)
  },
});
