import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity,Image } from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Logo from '../..//assets/images/misc/logo.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';

const OnboardingScreen = ({  }) => {
  const navigation = useNavigation();
  return (

    <LinearGradient
      colors={['#ECFCFA', '#FFF', '#FFF']} // Change these colors as needed
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        flex: 1, justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{ marginTop: 1,marginBottom: responsiveHeight(5) }}>
        <Image
            source={require('../../assets/images/icon.png')}
            style={{height: responsiveHeight(5),width: responsiveWidth(80),resizeMode:'contain'}}
          />
        </View>
       
        {/* <View style={{paddingHorizontal:20, marginBottom: responsiveHeight(2)}}>
          <Text style={{ color: '#444343', alignSelf: 'center', fontFamily: 'Poppins-Bold', fontSize: responsiveFontSize(2.5),textAlign:'center',marginBottom:10 }}>Journey to Mental Well-being Begins</Text>
          <Text style={{ color: '#746868', alignSelf: 'center', fontFamily: 'Poppins-Regular', fontSize: responsiveFontSize(1.5),textAlign:'center' }}>Enter the details below so we can get to know and serve you better</Text>
        </View> */}
        <View style={{ width: responsiveWidth(90) }}>
          <CustomButton label={"Sign In"}
            onPress={() => navigation.navigate('Login')}
          //onPress={() => { navigation.push('Otp', { phoneno: phone }) }}
          />
        </View>
        <View style={{ width: responsiveWidth(90) }}>
          <CustomButton label={"Register (New Therapist)"}
            buttonColor={'red'}
            onPress={() => navigation.navigate('PersonalInformation')}
          //onPress={() => { navigation.push('Otp', { phoneno: phone }) }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OnboardingScreen;
