import React, { useContext, useState, useEffect } from 'react';
import {
    Platform,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../components/CustomHeader';
import Loader from '../../../utils/Loader';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { responsiveHeight } from 'react-native-responsive-dimensions';

export default function Termsofuse({  }) {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const { width } = useWindowDimensions();
    const privacyPolicyUrl = "https://grouptour.app/terms.html";

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader
                commingFrom={'Terms of use'}
                title={'Terms and Conditions'}
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
        paddingTop: 10,
        marginBottom: Platform.OS === 'ios' ? -responsiveHeight(3):0,
    },
    webview: {
        flex: 1,
    },
});
