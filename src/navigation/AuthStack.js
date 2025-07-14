import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/AuthScreen/OnboardingScreen';
import LoginScreen from '../screens/AuthScreen/LoginScreen';
import ThankYouScreen from '../screens/AuthScreen/ThankYouScreen';

import ForgotPassword from '../screens/AuthScreen/ForgotPassword';
import OtpScreen from '../screens/AuthScreen/OtpScreen';
import PasswordChange from '../screens/AuthScreen/PasswordChange';
import SplashScreen from '../screens/AuthScreen/SplashScreen';
import PrivacyPolicy from '../screens/NoAuthScreen/Customer/PrivacyPolicy';
import Termsofuse from '../screens/NoAuthScreen/Customer/Termsofuse';
import PersonalInformation from '../screens/AuthScreen/Customer/PersonalInformation';


const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      {/* <Stack.Screen name="Onboarding" component={OnboardingScreen} /> */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="PasswordChange" component={PasswordChange} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformation} />
      <Stack.Screen name="Thankyou" component={ThankYouScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="Termsofuse" component={Termsofuse} />
    </Stack.Navigator>
  );
};

export default AuthStack;
