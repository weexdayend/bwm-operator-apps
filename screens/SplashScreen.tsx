import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from 'twrnc';

async function retrieveNumber(key: string) {
  try {
    const value = await AsyncStorage.getItem(key)
    if (value !== null) {
      return parseInt(value, 10)
    }
    return null
  } catch (error) {
    console.error(`Error retrieving ${key}: ${error}`)
    return null
  }
}

const SplashScreen = () => {
  const navigation = useNavigation<any>()

  const { width } = Dimensions.get('window');
  const responsiveWidth = width * 0.8;

  useEffect(() => {

    const checkSession = async () => {
      const TPS = await retrieveNumber('TPS');
      const OperatorID = await retrieveNumber('OperatorID');

      if (OperatorID === null && TPS === null) { 
        navigation.replace('Welcome');
      } else {
        navigation.replace('Home');
      }
    }

    setTimeout(() => {
      checkSession();
    }, 2500);
  }, []);

  return (
    <LinearGradient
      colors={['#22c55e', '#16a34a']} // Set your gradient colors here
      start={{ x: 0, y: 0.5 }} // Adjust start point as needed
      end={{ x: 1, y: 0.5 }} // Adjust end point as needed
      style={tw`flex-1 items-center justify-center`}
    >
      <View style={styles.container}>
        <Text style={tw`absolute top-45 text-white/25 text-xs`}>SAPTA KARYA</Text>
        <Image
          source={require('../assets/images/box-splash-screen-bwm.png')}
          style={[tw`h-${responsiveWidth * 0.25} absolute`]}
          resizeMode="contain"
        />
        <ActivityIndicator color="#fff" size="large" style={styles.activityIndicator} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {
    position: 'absolute',
    bottom: 80, // Adjust this value as needed to control the vertical position
  },
});

export default SplashScreen;
