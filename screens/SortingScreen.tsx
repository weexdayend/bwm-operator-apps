import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

import { 
  View,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Linking,
  Pressable,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { useNavigation } from "@react-navigation/native";
import { Camera, CameraRuntimeError, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { Image as img } from 'react-native-compressor';

import tw from 'twrnc';
import * as Solid from 'react-native-heroicons/solid';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { DbResult, supabase } from "../lib/supabase";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../lib/constant";
import ConfirmationScreen from "./ConfirmationScreen";
import { useDispatch, useSelector } from "react-redux";

type Props = {}

async function retrieveNumber(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // Convert the retrieved string back to a number
      return parseInt(value, 10);
    }
    return null; // Return null if the key doesn't exist in AsyncStorage
  } catch (error) {
    // Handle any errors that may occur during AsyncStorage operations
    console.error(`Error retrieving ${key}: ${error}`);
    return null; // Return null in case of an error
  }
}

const SortingScreen = (props: Props) => {
  const navigation = useNavigation<any>()

  const dispatch = useDispatch()

  const selected_image = useSelector((state: any) => state.select_image);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const camera = useRef<Camera>(null)

  const [imageSource, setImageSource] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = React.useState(false);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);

  const device = useCameraDevice('back', {
    physicalDevices: ['wide-angle-camera']
  });
  
  const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH
  const format = useCameraFormat(device, [
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ])
  
  const onError = useCallback( async (error: CameraRuntimeError) => {
    console.error(error)
    await supabase
      .from("log_camera")
      .insert({
        bugs: `${error}`
      })
  }, [])
  const onInitialized = useCallback(() => {
    console.log('Camera initialized!')
    setIsCameraInitialized(true)
  }, [])
  
  async function startCamera() {
    if (device) {
      try {
        await Camera.requestCameraPermission(); // Request camera permissions if not granted
      } catch (error) {
        console.error('Failed to start camera:', error);
      }
    }
  }

  useEffect(() => {
    const f =
      format != null
        ? `(${format.photoWidth}x${format.photoHeight} photo)`
        : undefined
    console.log(`Camera: ${device?.name} | Format: ${f}`)
  }, [device?.name, format])

  useEffect(() => {
    checkCameraPermission();
    startCamera()
  }, []);

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    setHasPermission(status === 'granted');
  };

  const [jenisSampah, setJenisSampah] = useState<string>('')
  const [totalSampah, setTotalSampah] = useState<string>('')

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const [message, setMessage] = useState<string | null>(null)

  const padding = Platform.OS === "ios" ? 'px-4 py-4' : ''
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

  const handleSubmit = async () => {
    const OperatorID = await retrieveNumber('OperatorID');
    const TPS = await retrieveNumber('TPS');

    navigation.navigate('Confirmation', {
      tps: TPS,
      operator: OperatorID,
      evidence: imageSource,
      jenis: jenisSampah,
      tipe: 'Terpilah',
      volume: parseFloat(totalSampah),
      status: 'Approved',
      from: 'Sorting'
    })

    // tps?: any,
    // operator?: any,
    // evidence?: any,
    // jenis?: any,
    // tipe?: any,
    // total?: any,
    // status?: any,
    // from?: any,

    // setModalVisible(true)
    // setLoading(true)

    // try {
    //   const OperatorID = await retrieveNumber('OperatorID');
    //   const TPS = await retrieveNumber('TPS');

    //   const check = await supabase
    //     .from("tbl_kelola")
    //     .insert({
    //       volume: parseFloat(totalSampah),
    //       tipe: 'Terpilah',
    //       operatorId: OperatorID,
    //       tpsId: TPS,
    //       evidence: imageSource,
    //       jenis: jenisSampah,
    //       status: 'Approved'
    //     })

    //   const response = check.error;
    //   if (response == null) {
    //     setMessage(null)
    //   } else {
    //     setMessage(response.message)
    //   }
    // } catch (error: any) {
    //   setMessage(error.message)
    // } finally {
    //   setLoading(false)
    // }
  }

  const isFieldEmpty = !totalSampah || !jenisSampah || !imageSource || totalSampah === '0' || totalSampah === '0.0' || totalSampah === '0.' || totalSampah === '.0' || totalSampah === '.'

  const capturePhoto = async () => {
    if (camera.current !== null) {
      try {  
        const photo = await camera.current.takePhoto({
          flash: "off",
          enableShutterSound: false,
          qualityPrioritization: "speed"
        });

        const compressedPhoto = await img.compress(`file://${photo.path}`, {
          compressionMethod: 'auto',
          quality: 0.3,
          maxWidth: 1000,
          output: "jpg",
          returnableOutputType: "base64",
        });
  
        setImageSource(`data:image/jpeg;base64,${compressedPhoto}`);
        setIsCameraActive(false);
      } catch (error) {
        console.error('Error capturing photo:', error);
      }
    }
  };

  const handleTextChange = (text: any) => {
    // Validate the input to allow only numbers and a single period
    if (/^\d*\.?\d*$/.test(text)) {
      setTotalSampah(text);
    }
  };

  useEffect(() => {
    if (selected_image) {
      setImageSource(selected_image)
    } else {
      setImageSource(null)
    }
  }, [selected_image])

  const RenderCamera = () => {
    return(
      <View style={tw`bg-black absolute z-10 flex-1 h-full w-full bg-black overflow-hidden`}>
        <View style={[tw`absolute z-10 flex-1 h-full w-full bg-black overflow-hidden`, { borderBottomLeftRadius: 55, borderBottomRightRadius: 55 }]}>
          <TouchableOpacity onPress={() => setIsCameraActive(false)} style={tw`absolute px-4 py-4 z-50 top-4 left-4`}>
            <Solid.XMarkIcon size={34} style={tw`text-white`} />
          </TouchableOpacity>
          {device != null && hasPermission && (
            <Camera
              ref={camera}
              style={[StyleSheet.absoluteFill, tw`bg-black`]}
              device={device}
              format={format}
              isActive={true}
              onInitialized={onInitialized}
              onError={onError}
              photo={true}
              orientation="portrait"
            />
          )}
          <View style={tw`absolute flex flex-row items-center justify-center z-50 px-4 py-4 w-full bottom-8 left-0`}>
            <TouchableOpacity onPress={() => {
              if (isCameraInitialized && isCameraActive) {
                capturePhoto()
              }
            }} style={tw`p-1 rounded-full border-4 border-white shadow-xl`}>
              <View style={tw`bg-white p-8 rounded-full`} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`bg-white ${isCameraActive ? '' : 'pb-8'}`,{ flex: 1 }]}
    >
    <Modal
      transparent={false}
      animationType='slide'
      visible={modalVisible}
    >
      {
        loading ? (
          <View style={tw`flex-1 items-center justify-center gap-4`}>
            <Text style={tw`font-bold text-base`}>Menyimpan data sampah...</Text>
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) : (
          <View style={tw`flex-1 items-center justify-center gap-4`}>
            {
              message ? (
                <>
                  <Text style={tw`font-bold text-base text-gray-900`}>Login Error</Text>
                  <Text style={tw`font-medium text-sm text-gray-900`}>{message}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false)
                      setMessage(null)
                    }}
                    style={tw`px-6 py-2 rounded-full bg-green-600`}
                  >
                    <Text style={tw`font-bold text-sm text-white`}>Coba kembali</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={tw`font-bold text-base text-gray-900`}>Yeayyyy</Text>
                  <Text style={tw`font-medium text-sm text-gray-900`}>Data sampah kamu berhasil disimpan!</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false)
                      navigation.goBack()
                    }}
                    style={tw`px-6 py-2 rounded-full bg-green-600`}
                  >
                    <Text style={tw`font-bold text-sm text-white`}>Lanjutkan!</Text>
                  </TouchableOpacity>
                </>
              )
            }
          </View>
        )
      }
    </Modal>
    <View style={tw`w-full bg-gray-50 px-4 pt-16 pb-2`}>
      <TouchableOpacity onPress={() => {
        dispatch({ type: 'SELECT_IMAGE', payload: '' })
        navigation.goBack()
      }} style={tw`bg-transparent flex flex-row gap-2 items-center`}>
        <Solid.ArrowLeftIcon size={28} style={tw`text-green-600`} />
      <Text style={tw`${titleSize} font-bold text-green-600 text-center`}>Sampah Masuk</Text>
      </TouchableOpacity>
    </View>
    {
      isCameraActive && (<RenderCamera />)
    }
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {
        hasPermission ? (
          <View style={tw`flex-1 w-full bg-white px-4 gap-6 ${ Platform.OS === "android" ? 'pt-16' : 'pt-6'}`}>
            {
              imageSource === null ? (
                <></>
              ) : (
                <View style={tw`w-full h-120 rounded-3xl`}>
                  <Image
                    source={{ uri: imageSource }}
                    style={[tw`w-full h-full rounded-3xl`]}
                    resizeMode="cover"
                  />
                </View>
              )
            }
            <View style={tw`bg-transparent w-full flex flex-row items-center justify-center border border-gray-300 rounded-xl`}>
              {
                imageSource !== null ? (
                  <Pressable onPress={() => {
                    setImageSource(null)
                    dispatch({ type: 'SELECT_IMAGE', payload: '' });
                  }} style={tw`bg-white w-full flex-1 flex-col items-center px-2 py-2 rounded-r-xl`}>
                    <Solid.TrashIcon style={tw`text-gray-700`} />
                    <Text style={tw`text-xs text-center text-gray-900 font-bold`}>Hapus Gambar</Text>
                  </Pressable>
                ) : (
                  <>
                  <Pressable onPress={() => navigation.navigate("ShowGallery")} style={tw`bg-white w-full flex-1 flex-col items-center px-2 py-2 rounded-l-xl`}>
                    <Solid.PhotoIcon style={tw`text-gray-700`} />
                    <Text style={tw`text-xs text-center text-gray-900 font-bold`}>Buka Galeri</Text>
                  </Pressable>
                  <View style={tw`h-full w-0.4 bg-gray-200`} />
                  <Pressable onPress={() => setIsCameraActive(true)} style={tw`bg-white w-full flex-1 flex-col items-center px-2 py-2 rounded-r-xl`}>
                    <Solid.CameraIcon style={tw`text-gray-700`} />
                    <Text style={tw`text-xs text-center text-gray-900 font-bold`}>Buka Kamera</Text>
                  </Pressable>
                  </>
                )
              }
            </View>
            
            <View style={tw`flex flex-col gap-2 mt-6`}>
              <Text style={tw`text-gray-800`}>Pilih jenis sampah</Text>
              <View style={tw`${padding} border border-gray-300 rounded-xl`}>
                <Picker
                  selectedValue={jenisSampah}
                  onValueChange={(value) => setJenisSampah(value)}
                  style={tw`text-gray-800`}
                >
                  <Picker.Item label="Pilih Jenis" value="" />
                  <Picker.Item label="Organik" value="Organik" />
                  <Picker.Item label="Anorganik" value="Anorganik" />
                  <Picker.Item label="Residu" value="Residu" />
                </Picker>
              </View>
            </View>

            <View style={tw`flex flex-row items-center gap-2 px-4 py-4 bg-gray-100 border border-gray-300 rounded-xl`}>
              <Solid.InformationCircleIcon size={24} style={tw`text-gray-700`} />
              <Text style={tw`text-gray-700`}>Lakukan penimbangan sampah sesuai jenis yang terpilah</Text>
            </View>

            <View style={tw`flex flex-col gap-2`}>
              <Text style={tw`text-gray-800`}>Total sampah {`(Kg)`}</Text>
              <TextInput
                placeholder="Masukkan total sampah... (cth: 0.2)"
                onChangeText={(text) => handleTextChange(text)}
                value={totalSampah}
                keyboardType="numeric"
                style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
                returnKeyType="done"
                placeholderTextColor={'#9ca3af'}
              />
            </View>
          </View>
        ) : (
          <View style={tw`flex-1 w-full bg-white px-4 gap-6 ${ Platform.OS === "android" ? 'pt-16' : 'pt-6'}`}>
            <View style={tw`w-full h-120 border border-gray-300 rounded-3xl`}>
              <View style={tw`h-full flex flex-col items-center justify-center rounded-3xl gap-2 bg-white border border-gray-300`}>
                <Solid.ExclamationTriangleIcon size={32} style={tw`text-gray-600`} />
                <Text style={tw`text-gray-600 text-base`}>Aplikasi memerlukan izin akses kamera!</Text>
              </View>
            </View>
          </View>
        )
      }
    </ScrollView>
    <View style={tw`bg-white w-full px-6 py-4 border-t-2 border-green-600`}>
      {
        hasPermission ? (
          <TouchableOpacity disabled={isFieldEmpty} onPress={() => handleSubmit()} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 ${isFieldEmpty ? 'bg-gray-400' : 'bg-green-600'} rounded-full shadow-xl shadow-black/30`}>
            <Text style={tw`text-center font-bold text-base text-white`}>Simpan data sampah</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => Linking.openSettings()} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 bg-green-600 rounded-full shadow-xl shadow-black/30`}>
            <Text style={tw`text-center font-bold text-base text-white`}>Buka Pengaturan</Text>
          </TouchableOpacity>
        )
      }
    </View>
    </KeyboardAvoidingView>
  )
}

export default SortingScreen