import React, { useEffect, useRef } from 'react';
import { View, Text, Dimensions, Animated, Alert, Linking, BackHandler } from 'react-native'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';

import tw from 'twrnc'

import LinearGradient from 'react-native-linear-gradient'
import UpdateProfileScreen from './screens/UpdateProfileScreen';

import * as Solid from 'react-native-heroicons/solid'
import * as Outline from 'react-native-heroicons/outline'

import reducer from './lib/reducers';

import { Provider, useSelector } from 'react-redux';
import { createStore } from 'redux';

import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import SortingScreen from './screens/SortingScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import ManageAccountScreen from './screens/ManageAccountScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OTPScreen from './screens/OTPScreen';
import PINScreen from './screens/PINScreen';
import NewAccountScreen from './screens/NewAccountScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import AffiliateScreen from './screens/AffiliateScreen';
import RequestScreen from './screens/RequestScreen';
import SplashScreen from './screens/SplashScreen';
import SuccessScreen from './screens/SuccessScreen';
import DetailDataScreen from './screens/DetailDataScreen';
import ShowGalleryScreen from './screens/ShowGalleryScreen';
import CourseScreen from './screens/CourseScreen';
import UpdateCollectionScreen from './screens/UpdateCollectionScreen';

const Stack = createNativeStackNavigator()
const Tabs  = createBottomTabNavigator()

function getWidth() {
  let width = Dimensions.get('window').width
  width = width - 30
  return width / 4
}

function HomeStack(): JSX.Element {
  return(
    <Stack.Navigator
      initialRouteName='Home'
    >
      <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function CourseStack(): JSX.Element {
  return(
    <Stack.Navigator>
      <Stack.Screen name='Course' component={CourseScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function RequestStack(): JSX.Element {
  return(
    <Stack.Navigator
      initialRouteName='Request'
    >
      <Stack.Screen name='Request' component={RequestScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function HistoryStack(): JSX.Element {
  return(
    <Stack.Navigator
      initialRouteName='History'
    >
      <Stack.Screen name='History' component={HistoryScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function ProfileStack(): JSX.Element {
  return(
    <Stack.Navigator
      initialRouteName='Profile'
    >
      <Stack.Screen name='Profile' component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function BottomNav(): JSX.Element {
  const tabOffsetValue = useRef(new Animated.Value(0)).current;
  const requestTotal = useSelector((state: any) => state.requestTotal);

  return(
    <>
      <Tabs.Navigator
        initialRouteName='HomeStack'
        screenOptions={{
          tabBarStyle: {
            height: 97,
            paddingHorizontal: 15,
          }
        }}
      >
        <Tabs.Screen
          name='HomeStack'
          component={HomeStack}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <View style={tw`w-full h-full items-center justify-center`}>
                <View style={tw`w-20 rounded-xl py-4 items-center`}>
                  {
                    focused ?
                    <Solid.HomeIcon style={tw`text-green-600`} />
                    :
                    <Outline.HomeIcon style={tw`text-[#bababa]`}/>
                  }
                  <Text style={tw`mt-1 text-xs ${focused ? "text-gray-900 font-bold" : "text-[#bababa]"} `}>Home</Text>
                </View>
              </View>
            )
          }} listeners={({navigation, route}) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }
          })}
        />
        <Tabs.Screen
          name='CourseStack'
          component={CourseStack}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <View style={tw`w-full h-full items-center justify-center`}>
                <View style={tw`w-20 rounded-xl py-4 items-center`}>
                  {
                    focused ?
                    <Solid.AcademicCapIcon style={tw`text-green-600`} />
                    :
                    <Outline.AcademicCapIcon style={tw`text-[#bababa]`}/>
                  }
                  <Text style={tw`mt-1 text-xs ${focused ? "text-gray-900 font-bold" : "text-[#bababa]"} `}>Literasi</Text>
                </View>
              </View>
            )
          }} listeners={({navigation, route}) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth(),
                useNativeDriver: true
              }).start()
            }
          })}
        />
        {/* <Tabs.Screen
          name='RequestStack'
          component={RequestStack}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <View style={tw`w-full h-full items-center justify-center`}>
                <View style={tw`w-20 rounded-xl py-4 items-center`}>
                  <View style={tw`absolute z-50 top-1 right-5 px-1.5 py-0.5 rounded-full bg-red-500`}><Text style={tw`text-white font-bold text-xs`}>{requestTotal}</Text></View>
                  {
                    focused ?
                    <Solid.ClipboardIcon style={tw`text-green-600`} />
                    :
                    <Outline.ClipboardIcon style={tw`text-[#bababa]`}/>
                  }
                  <Text style={tw`mt-1 text-xs ${focused ? "text-gray-900 font-bold" : "text-[#bababa]"} `}>Request</Text>
                </View>
              </View>
            )
          }} listeners={({navigation, route}) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth(),
                useNativeDriver: true
              }).start()
            }
          })}
        /> */}
        <Tabs.Screen
          name='HistoryStack'
          component={HistoryStack}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <View style={tw`w-full h-full items-center justify-center`}>
                <View style={tw`w-20 rounded-xl py-4 items-center`}>
                  {
                    focused ?
                    <Solid.DocumentTextIcon style={tw`text-green-600`} />
                    :
                    <Outline.DocumentTextIcon style={tw`text-[#bababa]`}/>
                  }
                  <Text style={tw`mt-1 text-xs ${focused ? "text-gray-900 font-bold" : "text-[#bababa]"} `}>Riwayat</Text>
                </View>
              </View>
            )
          }} listeners={({navigation, route}) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 2,
                useNativeDriver: true
              }).start()
            }
          })}
        />
        <Tabs.Screen
          name='ProfileStack'
          component={ProfileStack}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => (
              <View style={tw`w-full h-full items-center justify-center`}>
                <View style={tw`w-20 rounded-xl py-4 items-center`}>
                  {
                    focused ?
                    <Solid.UserIcon style={tw`text-green-600`} />
                    :
                    <Outline.UserIcon style={tw`text-[#bababa]`}/>
                  }
                  <Text style={tw`mt-1 text-xs ${focused ? "text-gray-900 font-bold" : "text-[#bababa]"} `}>Profile</Text>
                </View>
              </View>
            )
          }} listeners={({navigation, route}) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 3,
                useNativeDriver: true
              }).start()
            }
          })}
        />
      </Tabs.Navigator>
      <View style={tw`flex h-4.5 bottom-20 absolute left-7`}>
        <Animated.View
          style={{ 
            width: getWidth() - 25,
            height: 5,
            backgroundColor: '#16a34a',
            transform: [
              { translateX: tabOffsetValue }
            ],
            borderBottomLeftRadius: 60,
            borderBottomRightRadius: 60
          }}
        >
          <LinearGradient start={{x: 0, y: 0}} end={{x: 0, y: 1}} colors={['rgba(52, 223, 132, 0.2)', 'rgba(0, 146, 69, 0)']} style={tw`p-6`}></LinearGradient>
        </Animated.View>
      </View>
    </>
  )
}

const store = createStore(reducer);

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AutocompleteDropdownContextProvider>
          <Provider store={store}>
            <Stack.Navigator initialRouteName='Splash'>
              <Stack.Screen name='Splash' component={SplashScreen} options={{ headerShown: false }} />
              <Stack.Screen name='Success' component={SuccessScreen} options={{ headerShown: false }} />
              <Stack.Screen name='Home' component={BottomNav} options={{ headerShown: false }} />
              <Stack.Screen name='Welcome' component={WelcomeScreen} options={{ gestureEnabled: false, headerShown: false, headerLeft: () => null }} />
              <Stack.Screen name='Login' component={LoginScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='Register' component={RegisterScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='OTP' component={OTPScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='PIN' component={PINScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='NewAccount' component={NewAccountScreen} options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='Sorting' component={SortingScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='Processing' component={ProcessingScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='Confirmation' component={ConfirmationScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='ShowGallery' component={ShowGalleryScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='DetailData' component={DetailDataScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='Affiliate' component={AffiliateScreen} options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name='ManageAccount' component={ManageAccountScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'fullScreenModal' }} />
              <Stack.Screen name='UpdateProfile' component={UpdateProfileScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'fullScreenModal' }} />
              <Stack.Screen name='UpdateCollection' component={UpdateCollectionScreen} options={{ gestureEnabled: true, headerShown: false, presentation: 'fullScreenModal' }} />
            </Stack.Navigator>
          </Provider>
        </AutocompleteDropdownContextProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
