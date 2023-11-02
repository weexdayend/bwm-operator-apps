import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, Alert, Linking, Platform, FlatList, KeyboardAvoidingView, TouchableOpacity, Image, StyleSheet } from 'react-native'

import Permissions, { PERMISSIONS } from 'react-native-permissions';

import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';

import tw from 'twrnc';
import * as Solid from 'react-native-heroicons/solid';

import { ShimmerView } from '../components/ShimmerView';
import { useNavigation } from '@react-navigation/native';
import { Image as img } from 'react-native-compressor';
import { useDispatch } from 'react-redux';

type Props = {}

const ShowGalleryScreen = (props: Props) => {

  const navigation = useNavigation<any>()
  
  const [photos, setPhotos] = useState<PhotoIdentifier[]>([]);

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  console.log(photos)
  console.log(hasPermission)

  const openSettingsAlert = useCallback(({title}: {title: string}) => {
    Alert.alert(title, '', [
      {
        isPreferred: true,
        style: 'default',
        text: 'Open Settings',
        onPress: () => Linking?.openSettings(),
      },
    ],{cancelable: false});
  }, []);

  const checkAndroidPermissions = useCallback(async () => {
    if (parseInt(Platform.Version as string, 10) >= 33) {
      const permissions = await Permissions.checkMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      ]);
      if (
        permissions[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
          Permissions.RESULTS.GRANTED &&
        permissions[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] ===
          Permissions.RESULTS.GRANTED
      ) {
        setHasPermission(true);
        return;
      }
      const res = await Permissions.requestMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      ]);
      if (
        res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
          Permissions.RESULTS.GRANTED &&
        res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] ===
          Permissions.RESULTS.GRANTED
      ) {
        setHasPermission(true);
      }
      if (
        res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
          Permissions.RESULTS.DENIED ||
        res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === Permissions.RESULTS.DENIED
      ) {
        checkAndroidPermissions();
      }
      if (
        res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
          Permissions.RESULTS.BLOCKED ||
        res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] ===
          Permissions.RESULTS.BLOCKED
      ) {
        openSettingsAlert({
          title: 'Izinkan akses galeri hp anda di settings',
        });
      }
    } else {
      const permission = await Permissions.check(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );
      if (permission === Permissions.RESULTS.GRANTED) {
        setHasPermission(true);        
        return;
      }
      const res = await Permissions.request(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );
      if (res === Permissions.RESULTS.GRANTED) {
        setHasPermission(true);
      }
      if (res === Permissions.RESULTS.DENIED) {
        checkAndroidPermissions();
      }
      if (res === Permissions.RESULTS.BLOCKED) {
        openSettingsAlert({
          title: 'Izinkan akses galeri hp anda di settings',
        });
      }
    }
  }, [openSettingsAlert]);

  const checkPermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      const permission = await Permissions.check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (permission === Permissions.RESULTS.GRANTED ||
          permission === Permissions.RESULTS.LIMITED) {
        setHasPermission(true);
        return;
      }
      const res = await Permissions.request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (res === Permissions.RESULTS.GRANTED ||
          res === Permissions.RESULTS.LIMITED) {
        setHasPermission(true);
      }
      if (res === Permissions.RESULTS.BLOCKED) {
        openSettingsAlert({
          title: 'Izinkan akses galeri hp anda di settings',
        });
      }
    } else if (Platform.OS === 'android') {
      checkAndroidPermissions();
    }
  }, [checkAndroidPermissions, openSettingsAlert]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const fetchPhotos = useCallback(async () => {
    const res = await CameraRoll.getPhotos({
      first: 10,
      assetType: 'Photos',
    });
    setPhotos(res?.edges);
    // 👇 Add this line to set loading to false once images are fetched
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (hasPermission) {
      fetchPhotos();
    }
  }, [hasPermission, fetchPhotos]);

  const padding = Platform.OS === "ios" ? 'px-4 py-4' : ''
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

  const [imageSource, setImageSource] = useState<any>(null)
  
  const dispatch = useDispatch()

  const selectPhoto = async (file: any) => {
    const compressedPhoto = await img.compress(file, {
      compressionMethod: 'auto',
      quality: 0.3,
      maxWidth: 1000,
      output: "jpg",
      returnableOutputType: "base64",
    });

    setImageSource(`data:image/jpeg;base64,${compressedPhoto}`);
    dispatch({ type: 'SELECT_IMAGE', payload: `data:image/jpeg;base64,${compressedPhoto}` });

    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-white`}
    >
      <View style={tw`w-full bg-gray-50 px-4 pt-16 pb-2`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`bg-transparent flex flex-row gap-2 items-center`}>
          <Solid.ArrowLeftIcon size={28} style={tw`text-green-600`} />
        <Text style={tw`${titleSize} font-bold text-green-600 text-center`}>Pilih Foto</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        numColumns={3}
        data={isLoading ? Array(15).fill('') : photos}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item, index}) => {
          if (isLoading) {
            return (
              <ShimmerView key={index} delay={index * 100} width={'33%'} />
            );
          }
          return (
            <TouchableOpacity onPress={() => selectPhoto(item?.node?.image?.uri)} style={tw`flex-1`}>
              <Image
                key={item?.node?.image?.uri}
                source={{uri: item?.node?.image?.uri}}
                height={140}
                style={styles.image}
              />
            </TouchableOpacity>
          );
        }}
        style={styles.list}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  list: {padding: 16},
  image: {
    height: 120,
    width: '33%',
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
});

export default ShowGalleryScreen