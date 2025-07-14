import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { chatImg, forwordImg } from '../utils/Images';

export default function CustomButton({ label, onPress, buttonIcon, buttonColor }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonColor == 'red' ? styles.buttonViewRed : buttonColor === 'delete' ? styles.buttonViewDelete : buttonColor == 'gray' ? styles.buttonViewGray : buttonColor == 'small' ? styles.buttonViewSmall : styles.buttonView}>

      <Text
        style={buttonColor == 'red' ? styles.buttonTextRed : buttonColor === 'delete' ? styles.buttonTextDelete : styles.buttonText}>
        {label}
      </Text>
      {buttonIcon ? <Image source={forwordImg} style={styles.iconImage} tintColor={'#FFF'} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonView: {
    backgroundColor: '#FF455C',
    borderColor: '#FF455C',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewSmall: {
    backgroundColor: '#EEF8FF',
    borderColor: '#417AA4',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewRed: {
    backgroundColor: '#FFF',
    borderColor: '#E3E3E3',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewGray: {
    backgroundColor: '#FFF',
    borderColor: '#E3E3E3',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewDelete: {
    backgroundColor: '#FFF',
    borderColor: '#E1293B',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonTextRed: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#2D2D2D',
  },
  buttonTextDelete: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#E1293B',
  },
  iconImage: {
    width: 23,
    height: 23,
    marginLeft: 5
  }
})
