import React, { useContext, useState, useEffect,useCallback } from 'react';
import {
    BackHandler,
    SafeAreaView,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../components/CustomHeader';
import Loader from '../../../utils/Loader';
import { useFocusEffect } from '@react-navigation/native';

export default function PrivacyPolicy({ navigation }) {

    const [isLoading, setIsLoading] = useState(false);
    const { width } = useWindowDimensions();
    const privacyPolicyUrl = "https://www.google.co.in/";

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
            <CustomHeader
                commingFrom={'Privacy Policy'}
                title={'Privacy Policy'}
                onPress={() => navigation.goBack()}
                onPressProfile={() => navigation.navigate('Profile')}
            />
            <WebView
                source={{ uri: privacyPolicyUrl }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => <Loader />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10
    },
    webview: {
        flex: 1,
    },
});
