import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";
import yourAnimation from '../assets/images/trash-animation.json';

import tw from 'twrnc'
import { useNavigation } from "@react-navigation/native";

type Props = {}

const SuccessScreen = (props: Props) => {
  const navigation = useNavigation<any>()

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('Home')
    }, 3500)
  }, [])
  
  return (
    <View style={[tw`bg-white`,{ flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
      <LottieView
        source={yourAnimation} // JSON animation file
        autoPlay
        speed={1} // Adjust the animation speed
        style={{ width: 200, height: 200 }} // Set the animation dimensions
      />
    </View>
  )
}

export default SuccessScreen