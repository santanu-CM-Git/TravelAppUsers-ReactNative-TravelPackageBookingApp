import { useNavigation } from '@react-navigation/native';
import React, { useRef, useEffect } from 'react';
import {
    SafeAreaView,
    Image,
    View,
    StyleSheet,
    Dimensions,
    Animated,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const SplashScreen = ({  }) => {
    const navigation = useNavigation();
    const moveAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(moveAnim, {
                duration: 2000,
                toValue: Dimensions.get('window').width / 1.6,
                delay: 0,
                useNativeDriver: false,
            }),
            Animated.timing(moveAnim, {
                duration: 2000,
                toValue: 0,
                delay: 0,
                useNativeDriver: false,
            }),
        ]).start();
        Animated.timing(fadeAnim, {
            duration: 1000,
            toValue: 1,
            delay: 2000,
            useNativeDriver: false,
        }).start();

        const timeout = setTimeout(() => {
            navigation.push('Login');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [moveAnim, fadeAnim]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#FF455C', '#FFF', '#FFF']} // Change these colors as needed
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                    flex: 1, justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Animated.View style={[styles.logoContainer, { marginLeft: moveAnim }]}>
                    <Animated.Image
                        source={require('../../assets/images/gt_icon.jpg')}
                        style={[styles.image, { opacity: fadeAnim }]}
                    />
                </Animated.View> 
            </LinearGradient>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: responsiveWidth(90),
        height: responsiveHeight(7),
        resizeMode:'contain'
    },
    logoContainer: {
        flexDirection: 'row',
    },
});
