import * as firebase from "firebase/app"

const firebaseConfig = {
    apiKey: "AIzaSyC-vCkuuBqnsZcSwSXvMDMyHM88-NssTCQ",
    authDomain: 'patientapp-dd55a.firebaseapp.com',
    databaseURL: "https://patientapp-dd55a-default-rtdb.firebaseio.com/",
    projectId: 'patientapp-dd55a',
    storageBucket: 'patientapp-dd55a.appspot.com',
    messagingSenderId: '705575053072',
    appId: '1:705575053072:android:03482b18254c411a7b2795',
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
