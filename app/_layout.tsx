import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { MobileWrapper } from '@/components/MobileWrapper';
import { UserProvider, useUser } from '@/context/UserDataContext';
import { useRouter, useSegments } from 'expo-router';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UserProvider>
        <ProtectedLayout>
          <MobileWrapper>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            </Stack>
          </MobileWrapper>
        </ProtectedLayout>
      </UserProvider>
    </ThemeProvider>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { userData, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)'; // Assuming we might add auth group later, currently handling onboarding
    const inOnboarding = segments[0] === 'onboarding';

    if (!userData.hasCompletedOnboarding && !inOnboarding) {
      // Redirect to onboarding if not completed and not already there
      router.replace('/onboarding');
    } else if (userData.hasCompletedOnboarding && inOnboarding) {
      // Redirect to tabs if completed and trying to access onboarding
      router.replace('/(tabs)');
    }
  }, [userData.hasCompletedOnboarding, isLoading, segments]);

  return <>{children}</>;
}
