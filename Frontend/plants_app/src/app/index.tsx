import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import OnboardingSlider from '../components/common/IntroSlider';
import { checkFirstLaunch, markFirstLaunchDone } from '../utils/storage';
import { Loader } from '../components/common/Loader';

export default function AppIndex() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      const firstLaunch = await checkFirstLaunch();
      console.log('[App] First launch status:', !firstLaunch);
      setIsFirstLaunch(!firstLaunch);
    };
    init();
  }, []);

  const handleDone = async () => {
    console.log('[App] Onboarding completed');
    await markFirstLaunchDone();
    setIsFirstLaunch(false);
  };

  if (isFirstLaunch === null) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={20} />
      </View>
    );
  }

  if (isFirstLaunch) {
    console.log('[App] Rendering Onboarding');
    const slides = [
// ...

        key: '1',
        title: 'Welcome to Verna',
        text: 'Your intelligent companion for plant care and identification.',
        image: require('../images/1.png'),
        backgroundColor: '#16a34a',
      },
      {
        key: '2',
        title: 'Identify with AI',
        text: 'Take a photo of any plant and get instant detailed information.',
        image: require('../images/2.png'),
        backgroundColor: '#0d7332',
      },
      {
        key: '3',
        title: 'Health Diagnostics',
        text: 'Detect diseases and pests early with our smart leaf scanner.',
        image: require('../images/3.png'),
        backgroundColor: '#ef4444',
      },
    ];

    return <OnboardingSlider slides={slides} onDone={handleDone} />;
  }

  return <RootNavigator />;
}
