import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import type { Slide } from '../../types/intro-slide';

interface Props {
  slides: Slide[];
  onDone: () => void;
}

const { width, height } = Dimensions.get('window');

const OnboardingSlider: React.FC<Props> = ({ slides, onDone }) => {
  const renderItem = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Text style={styles.title}>{item.title}</Text>
      {item.image && <Image source={item.image} style={styles.image} />}
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={onDone}
      showSkipButton
      showPrevButton
      bottomButton
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 96,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  image: {
    width: width * 0.7,
    height: height * 0.3,
    resizeMode: 'contain',
    marginBottom: 40,
  },
});

export default OnboardingSlider;
