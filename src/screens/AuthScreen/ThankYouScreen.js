import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../..//assets/images/misc/Thankyou.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const ThankYouScreen = ({  }) => {
  return (

    <LinearGradient
      colors={['#ECFCFA', '#FFF', '#FFF']} // Change these colors as needed
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.linearView}
    >
      <SafeAreaView
        style={styles.safeareaView}>
        <View style={styles.successMsgView}>
          <Image
            source={require('../../assets/images/accept.png')}
            style={styles.imgIcon}
          />
          <Text style={styles.msgText}>Registration Successfully Done</Text>
        </View>
        <View style={styles.thankImg}>
          <Thankyou
            width={300}
            height={200}
          //style={{transform: [{rotate: '-15deg'}]}}
          />
        </View>
        <View style={{ paddingHorizontal: 20, marginBottom: responsiveHeight(2) }}>
          <Text style={styles.thankText}>Thank You</Text>
          <Text style={styles.thanksubText}>For registering with us! Our team will reach out to you within 7 working days</Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
};

export default ThankYouScreen;

const styles = StyleSheet.create({
  linearView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeareaView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMsgView: {
    marginTop: 1,
    backgroundColor: '#F4F5F5',
    width: responsiveWidth(90),
    height: responsiveHeight(6),
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  imgIcon: {
    height: 15,
    width: 15,
    resizeMode: 'contain'
  },
  msgText: {
    color: '#2D2D2D',
    alignSelf: 'center',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.5),
    marginLeft: 10
  },
  thankImg: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  thankText: {
    color: '#444343',
    alignSelf: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2.5),
    textAlign: 'center',
    marginBottom: 10
  },
  thanksubText: {
    color: '#746868',
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
    textAlign: 'center'
  }
})