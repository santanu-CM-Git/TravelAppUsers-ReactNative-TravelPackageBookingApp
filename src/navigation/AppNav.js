//import liraries
import React, { useContext } from 'react';
import { View, ActivityIndicator,Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { AuthContext } from '../context/AuthContext';
import { getNavigationRef } from './NavigationService'; // Import the navigation ref

const linking = {
  prefixes: ['https://yourapp.com', 'yourapp://'],
  config: {
    screens: {
      // Use the correct navigator and screen names
      PackageDetailsScreen: {
        path: 'package/:packageId',
        parse: {
          packageId: (id) => `${id}`,
        },
      },
      // Add other screens if needed
    },
  },
};

const AppNav = () => {
    const { isLoading, userToken } = useContext(AuthContext)

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} />
            </View>
        )
    }
    
    return (
        <NavigationContainer ref={getNavigationRef()} linking={linking}>
            {userToken != null ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNav;
