import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet,BackHandler } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../../../assets/images/misc/Thankyou.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import moment from 'moment-timezone';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const ThankYouBookingScreen = ({ navigation, route }) => {
  const [data, setData] = useState(null);

  useFocusEffect(
    useCallback(() => {
        const backAction = () => {
          if (navigation.isFocused()) {
            // If you're not on the home screen, redirect to the home screen
            navigation.navigate('Home'); // Replace 'Home' with the actual route name for your home screen
            return true; // Prevent the default back action
          } else {
            // If already on the home screen, allow default back action (exit app)
            return false;
          }
          };
      
          const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
          );
      
          return () => backHandler.remove();
    }, [navigation])
);

  useEffect(() => {
    const detailsData = JSON.parse(route?.params?.detailsData);
    setData(detailsData);
    
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.thankYouImageWrapper}>
        <Thankyou width={300} height={150} />
      </View>
      <View style={styles.thankYouTextWrapper}>
        <Text style={styles.thankYouText}>Thank You</Text>
        <Text style={styles.appreciationText}>For booking the appointment with us!</Text>
      </View>
      {data && (
        <View style={styles.totalValue}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Appointment details</Text>
          </View>
          <View style={styles.detailsWrapper}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>User Name</Text>
              <Text style={styles.detailValue}>{data[0]?.patient.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Therapist Name</Text>
              <Text style={styles.detailValue}>{data[0]?.therapist.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Schedule Date</Text>
              <Text style={styles.detailValue}>{moment(data[0]?.date).format('dddd, D MMMM')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Schedule Time</Text>
              <Text style={styles.detailValue}>{moment(data[0]?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(data[0]?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
            </View>
            {/* <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Appointment</Text>
              <Text style={styles.detailValue}>Booked</Text>
            </View> */}
          </View>
        </View>
      )}
      <View style={styles.buttonWrapper}>
        <CustomButton label={"Back to Home"} onPress={() => navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })} />
      </View>
    </SafeAreaView>
  );
};

export default ThankYouBookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouImageWrapper: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouTextWrapper: {
    paddingHorizontal: 20,
    marginBottom: responsiveHeight(2),
    marginTop: responsiveHeight(2),
  },
  thankYouText: {
    color: '#444343',
    alignSelf: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2.5),
    textAlign: 'center',
    marginBottom: 10,
  },
  appreciationText: {
    color: '#746868',
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.5),
    textAlign: 'center',
  },
  totalValue: {
    width: responsiveWidth(89),
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#E3E3E3',
    borderWidth: 1,
    marginTop: responsiveHeight(5),
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    height: responsiveHeight(7),
    backgroundColor: '#DEDEDE',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    alignItems: 'center',
  },
  headerText: {
    color: '#2D2D2D',
    fontFamily: 'Poppins-Bold',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: responsiveWidth(2),
  },
  detailsWrapper: {
    padding: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  detailLabel: {
    color: '#746868',
    fontFamily: 'Poppins-Regular',
    fontSize: responsiveFontSize(1.7),
  },
  detailValue: {
    color: '#444343',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(1.7),
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    width: responsiveWidth(90),
  },
});