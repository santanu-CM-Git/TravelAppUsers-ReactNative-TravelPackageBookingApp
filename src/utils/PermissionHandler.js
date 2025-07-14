import { PERMISSIONS, checkMultiple, requestMultiple } from 'react-native-permissions';

export const requestCameraAndAudioPermissions = async () => {
  const statuses = await checkMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO]);

  if (statuses[PERMISSIONS.ANDROID.CAMERA] !== 'granted' || statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] !== 'granted') {
    const results = await requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO]);

    if (results[PERMISSIONS.ANDROID.CAMERA] === 'granted' && results[PERMISSIONS.ANDROID.RECORD_AUDIO] === 'granted') {
      return true;
    } else {
      alert('Permissions are required to proceed.');
      return false;
    }
  } else {
    return true;
  }
};
