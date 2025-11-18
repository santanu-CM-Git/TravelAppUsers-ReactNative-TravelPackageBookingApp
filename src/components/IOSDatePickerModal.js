import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

/**
 * iOS Date Picker Modal Component
 * 
 * Usage:
 * const [showDatePicker, setShowDatePicker] = useState(false);
 * const [selectedDate, setSelectedDate] = useState(new Date());
 * 
 * <IOSDatePickerModal
 *   visible={showDatePicker}
 *   date={selectedDate}
 *   minimumDate={new Date(1930, 0, 1)}
 *   maximumDate={new Date()}
 *   onConfirm={(date) => {
 *     setSelectedDate(date);
 *     setShowDatePicker(false);
 *   }}
 *   onCancel={() => setShowDatePicker(false)}
 * />
 */
const IOSDatePickerModal = ({
  visible,
  date,
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel,
  mode = 'date', // 'date' or 'time' or 'datetime'
}) => {
  const [tempDate, setTempDate] = useState(date);

  const handleConfirm = () => {
    onConfirm(tempDate);
  };

  const handleCancel = () => {
    setTempDate(date); // Reset to original date
    onCancel();
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  // Update tempDate when date prop changes
  React.useEffect(() => {
    setTempDate(date);
  }, [date]);

  if (Platform.OS !== 'ios') {
    // For Android, you can return null or use a different implementation
    return null;
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
      propagateSwipe={true}
    >
      <View style={styles.modalContent}>
        {/* Header with Cancel and Done buttons */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {mode === 'date' ? 'Select Date' : mode === 'time' ? 'Select Time' : 'Select Date & Time'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        <View style={styles.pickerContainer}>
          <RNDateTimePicker
            value={tempDate}
            mode={mode}
            display="spinner"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleDateChange}
            textColor="#000"
            themeVariant="light"
          />
        </View>
      </View>
    </Modal>
  );
};

export default IOSDatePickerModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Safe area for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerButton: {
    minWidth: 60,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: responsiveFontSize(1.9),
    color: '#007AFF',
    fontFamily: 'Poppins-Regular',
  },
  doneText: {
    fontSize: responsiveFontSize(1.9),
    color: '#007AFF',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: responsiveFontSize(2),
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  pickerContainer: {
    paddingVertical: 10,
  },
});

