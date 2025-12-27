import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { TextInput as MTextInput, IconButton } from "@react-native-material/core";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { YellowTck, eyeIcon } from '../utils/Images';

export default function InputField({
  label,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  editable,
  value,
  onChangeText,
  helperText,
  error,
  inputFieldType,
  ref,
  maxLength
}) {
  //console.log(inputType, 'dddd')
  return (
    <View
      style={styles.container}>
      {inputType == 'code' ? (
        <TextInput
          variant="outlined"
          keyboardType={keyboardType}
          style={styles.codeInput}
          value={value}
          editable={false}
        />
      ) : inputType == 'name' ? (
        <MTextInput
          variant="outlined"
          label={label}
          keyboardType={keyboardType}
          style={styles.nametextinput}
          inputContainerStyle={styles.inputcontainer}
          inputStyle={styles.input}
          labelTextStyle={styles.label}
          value={value}
          onChangeText={onChangeText}
          helperText={helperText}
          error
          trailing={props => (
            <IconButton icon={props => <Image
              source={eyeIcon}
              style={{ height: 20, width: 20, resizeMode: 'contain' }}
            />} {...props} />
          )}
        />
      ) : inputType == 'address' ? (
        <TextInput
          style={styles.inputAddress}
          onChangeText={onChangeText}
          value={value}
          placeholder={label}
          keyboardType={keyboardType}
          editable={inputType == 'nonedit' ? false : true}
          multiline={inputFieldType == 'address' ? true : false}
          placeholderTextColor="#808080"
        />
      ) : inputType == 'nonedit' ? (
        <TextInput
          style={styles.noneditinput}
          onChangeText={onChangeText}
          value={value}
          placeholder={label}
          keyboardType={keyboardType}
          editable={inputType == 'nonedit' ? false : true}
          multiline={inputFieldType == 'address' ? true : false}
          placeholderTextColor="#808080"
        />
      ) : inputType == 'others' ? (
        <TextInput
          style={styles.editinput}
          onChangeText={onChangeText}
          value={value}
          placeholder={label}
          keyboardType={keyboardType}
          editable={inputType == 'nonedit' ? false : true}
          multiline={inputFieldType == 'address' ? true : false}
          placeholderTextColor="#808080"
          selectionColor="#ff455c"
          maxLength={maxLength}
        />
      )  : inputType == 'login' ? (
        <TextInput
          style={styles.logininput}
          onChangeText={onChangeText}
          value={value}
          placeholder={label}
          keyboardType={keyboardType}
          editable={inputType == 'nonedit' ? false : true}
          multiline={inputFieldType == 'address' ? true : false}
          placeholderTextColor="#808080"
          selectionColor="#808080"
        />
      ) : inputType == 'searchable' ? (
        <TextInput
          style={styles.editinput}
          onChangeText={onChangeText}
          value={value}
          ref={ref}
          placeholder={label}
          keyboardType={keyboardType}
          editable={inputType == 'nonedit' ? false : true}
          multiline={inputFieldType == 'address' ? true : false}
          placeholderTextColor="#808080"
        />
      ) : inputType == 'coupon' ? (
        <View style={styles.couponContainer}>
          <TextInput
            style={styles.editinputforCupon}
            onChangeText={onChangeText}
            value={value}
            placeholder={label}
            keyboardType={keyboardType}
            editable={inputType == 'nonedit' ? false : true}
            multiline={inputFieldType == 'address' ? true : false}
            placeholderTextColor="#808080"
          />
        </View>
      ) : (
        <MTextInput
          variant="outlined"
          label={label}
          keyboardType={keyboardType}
          style={styles.textinput}
          inputContainerStyle={styles.inputcontainer}
          inputStyle={styles.input}
          labelTextStyle={styles.label}
          value={value}
          onChangeText={onChangeText}
          helperText={helperText}
          editable={editable == 'no' ? false : true}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  codeInput: {
    borderColor: '#808080',
    borderWidth: 1,
    padding: 5,
    borderRadius: 6,
    color: '#808080',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(2),
    height: responsiveHeight(8),
    width: responsiveWidth(15),
    justifyContent: 'center',
    alignItems: 'center'
  },
  textinput: {
    height: responsiveHeight(8),
    width: responsiveWidth(70),
    color: '#808080',
  },
  nametextinput: {
    height: responsiveHeight(8),
    width: responsiveWidth(88),
    color: '#808080',
  },
  inputcontainer: {
    height: responsiveHeight(7),
    borderColor: '#E0E0E0',
    borderWidth: 0,
    borderRadius: 8,
  },
  input: {
    color: '#808080',
    fontFamily: 'Poppins-Medium',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1)
  },
  label: {
    color: "#808080",
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(2),
  },
  inputAddress: {
    color: '#808080',
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    paddingLeft: responsiveHeight(1),
    borderColor: '#E3E3E3',
    borderWidth: 1,
    borderRadius: 8,
    width: responsiveWidth(89),
    height: responsiveHeight(30),
    textAlignVertical: 'top',
  },
  noneditinput: {
    color: '#808080',
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    paddingLeft: responsiveHeight(1),
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    width: responsiveWidth(88),
    height: responsiveHeight(6),
    backgroundColor: '#F4F5F5'
  },
  editinput: {
    color: '#808080',
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    paddingLeft: responsiveHeight(1),
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    width: responsiveWidth(88),
    height: responsiveHeight(6),
  },
  logininput:{
    color: '#808080',
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    paddingLeft: responsiveHeight(1),
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    width: responsiveWidth(70),
    height: responsiveHeight(6),
  },
  couponContainer: {
    flex: 1,
    marginBottom: 0,
  },
  editinputforCupon: {
    color: '#808080',
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    paddingLeft: responsiveHeight(1),
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    height: responsiveHeight(6),
  }

});
