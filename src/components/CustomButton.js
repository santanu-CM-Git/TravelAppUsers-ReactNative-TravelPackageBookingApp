import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { chatImg, forwordImg } from '../utils/Images';

export default function CustomButton({ label, onPress, buttonIcon, buttonColor, disabled, style }) {
  const getButtonStyle = () => {
    if (disabled) {
      return styles.buttonViewDisabled;
    }
    if (buttonColor == 'red') return styles.buttonViewRed;
    if (buttonColor === 'delete') return styles.buttonViewDelete;
    if (buttonColor == 'gray') return styles.buttonViewGray;
    if (buttonColor == 'small') return styles.buttonViewSmall;
    return styles.buttonView;
  };

  const getTextStyle = () => {
    if (disabled) {
      return styles.buttonTextDisabled;
    }
    if (buttonColor == 'red') return styles.buttonTextRed;
    if (buttonColor === 'delete') return styles.buttonTextDelete;
    return styles.buttonText;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[getButtonStyle(), style]}
      activeOpacity={disabled ? 1 : 0.7}>

      <Text style={getTextStyle()}>
        {label}
      </Text>
      {buttonIcon ? <Image source={forwordImg} style={styles.iconImage} tintColor={disabled ? '#999999' : '#FFF'} /> : null}
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
  buttonViewDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    opacity: 0.6
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
  buttonTextDisabled: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#999999',
  },
  iconImage: {
    width: 23,
    height: 23,
    marginLeft: 5
  }
})
