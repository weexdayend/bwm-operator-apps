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
import { Image as img } from 'react-native-compressor';

import tw from 'twrnc';
import * as Solid from 'react-native-heroicons/solid';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

type Props = {}

async function retrieveNumber(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // Convert the retrieved string back to a number
      return value
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

  const [imageSource, setImageSource] = useState<any>(null);

  const [jenisSampah, setJenisSampah] = useState<string>('')
  const [totalSampah, setTotalSampah] = useState<string>('')

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const [message, setMessage] = useState<string | null>(null)

  const padding = Platform.OS === "ios" ? 'px-4 py-4' : ''
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

  const handleSubmit = async () => {
    const retreiveTPS = await retrieveNumber('TPS');
    const retreiveOperatorID = await retrieveNumber('OperatorID')

    const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
    const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;

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
  }

  const isFieldEmpty = !totalSampah || !jenisSampah || !imageSource || totalSampah === '0' || totalSampah === '0.0' || totalSampah === '0.' || totalSampah === '.0' || totalSampah === '.'

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

  const openImagePicker = () => {
    launchImageLibrary({mediaType: 'photo'}, async (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;

        const compressedPhoto = await img.compress(`${imageUri}`, {
          compressionMethod: 'auto',
          quality: 0.3,
          maxWidth: 1000,
          output: "jpg",
          returnableOutputType: "base64",
        });
        
        setImageSource(`data:image/jpeg;base64,${compressedPhoto}`);
      }
    });
  };

  const handleCameraLaunch = () => {  
    launchCamera({mediaType: 'photo'}, async (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        
        const compressedPhoto = await img.compress(`${imageUri}`, {
          compressionMethod: 'auto',
          quality: 0.3,
          maxWidth: 1000,
          output: "jpg",
          returnableOutputType: "base64",
        });
        
        setImageSource(`data:image/jpeg;base64,${compressedPhoto}`);
      }
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`bg-white pb-8`,{ flex: 1 }]}
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
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
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
              <Pressable onPress={() => openImagePicker()} style={tw`bg-white w-full flex-1 flex-col items-center px-2 py-2 rounded-l-xl`}>
                <Solid.PhotoIcon style={tw`text-gray-700`} />
                <Text style={tw`text-xs text-center text-gray-900 font-bold`}>Buka Galeri</Text>
              </Pressable>
              <View style={tw`h-full w-0.4 bg-gray-200`} />
              <Pressable onPress={() => handleCameraLaunch()} style={tw`bg-white w-full flex-1 flex-col items-center px-2 py-2 rounded-r-xl`}>
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
    </ScrollView>
    <View style={tw`bg-white w-full px-6 py-4 border-t-2 border-green-600`}>
      <TouchableOpacity disabled={isFieldEmpty} onPress={() => handleSubmit()} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 ${isFieldEmpty ? 'bg-gray-400' : 'bg-green-600'} rounded-full shadow-xl shadow-black/30`}>
        <Text style={tw`text-center font-bold text-base text-white`}>Simpan data sampah</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
  )
}

export default SortingScreen