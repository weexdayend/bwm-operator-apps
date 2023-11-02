import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

type Props = {
  percentage: any
}

const CircularProgressBar = ({ percentage }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Ensure the percentage is within the valid range [0, 100]
    const validPercentage = Math.min(Math.max(percentage, 0), 100);

    // Animate the progress bar from 0% to the specified percentage
    const animationDuration = 1000; // 1 second
    const animationSteps = 100;
    const stepInterval = animationDuration / animationSteps;
    let step = 0;

    const intervalId = setInterval(() => {
      if (step >= validPercentage) {
        clearInterval(intervalId);
      } else {
        step += 1;
        setProgress(step);
      }
    }, stepInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [percentage]);


  return (
    <View style={styles.container}>
      <Svg height="100" width="100">
        {/* Background Circle */}
        <Circle
          cx="50"
          cy="50"
          r="45" 
          stroke="lightgray"
          strokeWidth="8"
          fill="transparent"
        />
        {/* Progress Circle */}
        <Circle
          cx="50"
          cy="50"
          r="45" 
          stroke="#facc15"
          strokeWidth="8" 
          strokeDasharray={`${progress * 2.82},282`}
          fill="transparent"
        />
        {/* Percentage Text */}
        <SvgText
          x="50%"
          y="50%"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="black"
        >
          {`${progress}%`}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});

export default CircularProgressBar;
