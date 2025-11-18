import React, { useContext, useState, useEffect,useCallback } from 'react';
import {
    BackHandler,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../components/CustomHeader';
import Loader from '../../../utils/Loader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RefundPolicy({  }) {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const { width } = useWindowDimensions();
    const refundPolicyUrl = "https://grouptour.app/refund-policy.html";

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
                commingFrom={'Refund Policy'}
                title={'Refund Policy'}
                onPress={() => navigation.goBack()}
                onPressProfile={() => navigation.navigate('Profile')}
            />
            <WebView
                source={{ uri: refundPolicyUrl }}
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

