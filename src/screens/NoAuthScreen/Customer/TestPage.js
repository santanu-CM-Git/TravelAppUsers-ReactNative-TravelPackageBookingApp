import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    Button,
    StyleSheet,
    PermissionsAndroid,
    Platform,
    Image,
    ImageBackground,
    TouchableOpacity
} from 'react-native';
import {
    ClientRoleType,
    createAgoraRtcEngine,
    ChannelProfileType,
    RtcSurfaceView
} from 'react-native-agora';
import { audioBgImg, audiooffIcon, audioonIcon, defaultUserImg, speakeroffIcon, speakeronIcon } from '../../../utils/Images';

const appId = '65f24fadce1247f98c8f7c77a232ec8e';
const channelName = 'testChannel';
const token = '007eJxTYJhVtlH76s/3ao1JOg/6nolv+XLKOfs+t7JXZEbea/6dPx0VGMxM04xM0hJTklMNjUzM0ywtki3SzJPNzRONjI1Sky1Sj147ltYQyMgQW32IhZEBAkF8boaS1OIS54zEvLzUHAYGAO/KJOM=';
const uid = 0;

const TestPage = ({ route }) => {
    const agoraEngineRef = useRef(null);
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState(null);
    const [message, setMessage] = useState('');
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);

    useEffect(() => {
        setupVideoSDKEngine();
        return () => {
            agoraEngineRef.current?.destroy();
        };
    }, []);

    const setupVideoSDKEngine = async () => {
        try {
            if (Platform.OS === 'android') {
                await getPermission();
            }
            agoraEngineRef.current = createAgoraRtcEngine();
            const agoraEngine = agoraEngineRef.current;

            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    showMessage('Successfully joined the channel: ' + channelName);
                    setIsJoined(true);
                },
                onUserJoined: (_connection, Uid) => {
                    showMessage('Remote user ' + Uid + ' has joined');
                    setRemoteUid(Uid);
                },
                onUserOffline: (_connection, Uid) => {
                    showMessage('Remote user ' + Uid + ' has left the channel');
                    setRemoteUid(null);
                },
            });

            agoraEngine.initialize({
                appId: appId,
            });
        } catch (e) {
            console.log(e);
        }
    };

    const getPermission = async () => {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ]);
            return granted;
        } catch (err) {
            console.warn(err);
        }
    };

    const joinChannel = async () => {
        const agoraEngine = agoraEngineRef.current;
        agoraEngine?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
        agoraEngine?.startPreview();
        agoraEngine?.joinChannel(token, channelName, uid, {
            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
    };

    const leaveChannel = () => {
        const agoraEngine = agoraEngineRef.current;
        agoraEngine?.leaveChannel();
        setRemoteUid(null);
        setIsJoined(false);
        setIsVideoEnabled(false);
        setMicOn(true); // Ensure mic is on when leaving the channel
        setSpeakerOn(true); // Ensure speaker is on when leaving the channel
        showMessage('You left the channel');
    };

    const startVideoCall = async () => {
        const agoraEngine = agoraEngineRef.current;
        agoraEngine?.enableVideo();
        setIsVideoEnabled(true);
    };

    const startAudioCall = async () => {
        const agoraEngine = agoraEngineRef.current;
        agoraEngine?.disableVideo();
        setIsVideoEnabled(false);
    };

    const toggleMic = () => {
        setMicOn(!micOn);
        // Implement logic to mute/unmute microphone using Agora SDK
    };

    const toggleSpeaker = () => {
        setSpeakerOn(!speakerOn);
        // Implement logic to toggle speaker using Agora SDK
    };

    const showMessage = (msg) => {
        setMessage(msg);
        console.log(msg);
    };

    return (
        <SafeAreaView style={styles.container}>
            {isVideoEnabled ? (
                <View style={styles.videoContainer}>
                    {/* Remote Video View */}
                    {remoteUid !== null && (
                        <RtcSurfaceView
                            canvas={{ uid: remoteUid }}
                            style={styles.remoteVideo}
                        />
                    )}
                    
                    {/* Local Video View */}
                    <RtcSurfaceView
                        canvas={{ uid: 0 }}
                        style={styles.localVideo}
                    />
                    <View style={styles.buttonContainer}>
                        <Button title="Switch to Audio" onPress={startAudioCall} />
                        <Button title="Leave Channel" onPress={leaveChannel} />
                    </View>
                </View>
            ) : (
                <ImageBackground source={audioBgImg} blurRadius={10} style={styles.audioBackground}>
                    {route?.params?.details?.therapist?.profile_pic ?
                        <Image
                            source={{ uri: route?.params?.details?.therapist?.profile_pic }}
                            style={styles.buttonImage}
                        /> :
                        <Image
                            source={defaultUserImg}
                            style={styles.buttonImage}
                        />
                    }
                    <Text style={styles.audioSectionTherapistName}>{route?.params?.details?.therapist?.name}</Text>
                    <View style={styles.audioButtonSection}>
                        <TouchableOpacity onPress={() => toggleMic()}>
                            <Image
                                source={micOn ? audioonIcon : audiooffIcon}
                                style={styles.iconStyle}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleSpeaker()}>
                            <Image
                                source={speakerOn ? speakeronIcon : speakeroffIcon}
                                style={styles.iconStyle}
                            />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        marginVertical: 10,
    },
    videoContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    localVideo: {
        width: '30%',
        height: 200,
        position:'absolute',
        top: 10,
        right: 10,
    },
    remoteVideo: {
        width: '100%',
        height: '100%',
    },
    audioBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonImage: {
        height: 150,
        width: 150,
        borderRadius: 75,
        marginTop: -150,
    },
    audioSectionTherapistName: {
        color: '#FFF',
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        marginTop: 20,
        marginBottom: 20,
    },
    audioButtonSection: {
        backgroundColor: '#000',
        height: 70,
        width: '50%',
        borderRadius: 35,
        alignItems: 'center',
        position: 'absolute',
        bottom: 60,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    iconStyle: {
        height: 50,
        width: 50,
    },
});

export default TestPage;
