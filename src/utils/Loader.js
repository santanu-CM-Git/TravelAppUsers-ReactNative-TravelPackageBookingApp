import React from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet
} from 'react-native';

export default function Loader({ navigation }) {
    return (
        <View style={styles.Container}>
            <ActivityIndicator
                size="large" color={'#FF455C'}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20
    }
});

