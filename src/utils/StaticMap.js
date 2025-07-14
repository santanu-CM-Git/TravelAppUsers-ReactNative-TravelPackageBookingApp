import React from 'react';
import { Image } from 'react-native';
import { GOOGLE_MAP_KEY } from '@env';
import { responsiveHeight } from 'react-native-responsive-dimensions'; 

const StaticMap = ({ latitude, longitude, label }) => {
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=7&size=600x300&markers=color:red%7C${latitude},${longitude}&key=${GOOGLE_MAP_KEY}`;
  console.log("mapUrl", mapUrl);
  return (
    <Image
      source={{ uri: mapUrl }}
      style={{ width: '100%', height: responsiveHeight(20), borderRadius: 10 }}
      resizeMode="cover"
    />
  );
};

export default StaticMap;
