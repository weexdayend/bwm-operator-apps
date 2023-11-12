import React, { useEffect, useState } from "react";

import { 
  View,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import tw from 'twrnc';
import * as Solid from 'react-native-heroicons/solid';

import { Picker } from '@react-native-picker/picker';
import { DbResult, supabase } from "../lib/supabase";
import { Image as img } from 'react-native-compressor';
import { launchCamera } from 'react-native-image-picker';

type UpdateCollectionType = {
  UpdateProfile: { 
    id?: any,
    subsektor_id?: any,
    name?: any,
    alamat?: any,
    photo?: any,
  };
};

type UpdateCollectionProps = RouteProp<UpdateCollectionType, 'UpdateProfile'>;

type Props = {}

const UpdateCollectionScreen = (props: Props) => {
  const navigation = useNavigation<any>()
  const route = useRoute<UpdateCollectionProps>();
  
  const [subsektor, setSubsektor] = useState<any>(null)
  const [name, setName] = useState<any>(null)
  const [alamat, setAlamat] = useState<any>(null)
  const [imageSource, setImageSource] = useState<any>(null)

  const [location, setLocation] = useState<any>(false);

  const [latitude, setLatitude] = useState<any>()
  const [longitude, setLongitude] = useState<any>()

  const [dataChanged, setDataChanged] = useState<boolean>(false)

  const [message, setMessage] = useState<string | null>(null)

  const padding = Platform.OS === "ios" ? 'px-4 py-4' : ''
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

  useEffect(() => {
    if (route) {
      const hasChanged = 
        route.params?.name !== name ||
        route.params?.subsektor_id !== subsektor ||
        route.params?.alamat !== alamat ||
        route.params?.photo !== imageSource;

      setDataChanged(hasChanged)

    }
  }, [route, name, subsektor, alamat, imageSource])

  useEffect(() => {
    if (route) {
      setName(route.params?.name || null)
      setSubsektor(route.params?.subsektor_id || null)
      setAlamat(route.params?.alamat || null)
      setImageSource(route.params?.photo || null)
    }
  }, [route])

  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const [loadSektor, setLoadSektor] = useState<boolean>(false)
  const [sektorList, setSektorList] = useState<any>()
  const [messageLoadSektor, setMessageLoadSektor] = useState<any>(null)
  
  const getListSektor = async () => {
    setLoadSektor(true)

    try {
      const check = supabase
        .from("tbl_subsektor")
        .select()
        .neq("nama_sektor", "OPD")
      const ChecKEvent: DbResult<typeof check> = await check;
      const items = ChecKEvent.data || []
      
      const groupedData = new Map();
      items.forEach((item: any) => {
        const sektor = item.nama_sektor;
        const subsektor = item.subsektor;

        if (!groupedData.has(sektor)) {
          // Initialize the group for the "sektor"
          groupedData.set(sektor, { sektor, sub: [] });
        }

        // Add the "subsektor" to the group
        groupedData.get(sektor).sub.push({ id: item.id, subsektor });
      });

      // Convert the Map to an array of grouped objects
      const result = [...groupedData.values()];

      setSektorList(result)
    } catch (error: any) {
      setLoadSektor(false)
      setMessageLoadSektor(error)
    } finally {
      setLoadSektor(false)
    }
  }

  useEffect(() => {
    getListSektor()
  }, [])

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

  const handleSubmitted = async () => {
    setLoading(true)
    setModalVisible(true)
    setMessage(null)

    try {
      const InsertTPS = supabase
        .from("tbl_tps")
        .update({
          subsektor_id: subsektor.id,
          nama_subsektor: subsektor.subsektor,
          foto: imageSource,
          alamat: alamat,
          nama_tps: name,
        })
        .eq("id", route.params?.id)
      const TPSEvent: DbResult<typeof InsertTPS> = await InsertTPS;
      if (TPSEvent.error) {
        setMessage(TPSEvent.error.message)
        return
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`bg-white`,{ flex: 1 }]}
    >
      <Modal
        transparent={false}
        animationType='slide'
        visible={modalVisible}
      >
        {
          loading ? (
            <View style={tw`flex-1 items-center justify-center gap-4`}>
              <Text style={tw`font-bold text-base text-green-600`}>Checking your data...</Text>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <View style={tw`flex-1 items-center justify-center gap-4`}>
              {
                updateError ? (
                  <>
                    <Text style={tw`font-bold text-base text-gray-900`}>Update Error</Text>
                    <Text style={tw`font-medium text-sm text-gray-900`}>{updateError}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false)
                        setUpdateError(null)
                      }}
                      style={tw`px-6 py-2 rounded-full bg-green-600`}
                    >
                      <Text style={tw`font-bold text-sm text-white`}>Close</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={tw`font-bold text-base text-gray-900`}>Yeayyyy</Text>
                    <Text style={tw`font-medium text-sm text-gray-900`}>Data baru kamu berhasil di simpan!</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false)
                        navigation.goBack()
                      }}
                      style={tw`px-6 py-2 rounded-full bg-green-600`}
                    >
                      <Text style={tw`font-bold text-sm text-white`}>Lanjutkan beberish!</Text>
                    </TouchableOpacity>
                  </>
                )
              }
            </View>
          )
        }
      </Modal>
      <View style={tw`flex flex-col px-4 pt-16 pb-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`bg-transparent flex flex-row gap-2 items-center`}>
          <Solid.ArrowLeftIcon size={28} style={tw`text-green-600`} />
          <Text style={tw`text-xl font-bold text-green-600 text-center`}>Update Data TKS/TSS</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={tw`flex-1 w-full bg-white px-4 gap-6 ${ Platform.OS === "android" ? 'pt-14 pb-26' : 'pt-6 pb-26'}`}>
          <View style={tw`flex flex-col gap-2`}>
            <Text style={tw`text-gray-800`}>Foto TSS/TKS</Text>
            <TouchableOpacity onPress={() => handleCameraLaunch()} style={tw`w-full h-120 border border-gray-300 rounded-3xl`}>
            {
              imageSource === null ? (
                <TouchableOpacity onPress={() => handleCameraLaunch()} style={tw`h-full flex flex-col items-center justify-center rounded-3xl gap-2 bg-white border border-gray-300`}>
                  <Solid.CameraIcon size={32} style={tw`text-gray-600`} />
                  <Text style={tw`text-gray-600 text-base`}>Ambil foto Tempat Pengelolaan Sampah KBS</Text>
                </TouchableOpacity>
              ) : (
                <Image
                  source={{ uri: imageSource }}
                  style={[tw`w-full h-full rounded-3xl`]}
                  resizeMode="cover"
                />
              )
            }
            </TouchableOpacity>
          </View>

          <View style={tw`flex flex-col gap-2`}>
            <Text style={tw`text-gray-800`}>Nama TSS/TKS</Text>
            <TextInput
              placeholder="example@email.com"
              onChangeText={(text) => setName(text)}
              value={name}
              keyboardType="default"
              style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
              returnKeyType="done"
              autoCapitalize="none"
              placeholderTextColor={'#9ca3af'}
            />
          </View>

          <View style={tw`flex flex-col gap-2`}>
            <Text style={tw`text-gray-800`}>Sektor</Text>
            <View style={tw`${padding} border border-gray-300 rounded-xl`}>
              <Picker
                selectedValue={subsektor}
                onValueChange={(itemValue: any) => {
                  setSubsektor(itemValue)
                }}
                style={tw`text-gray-900`}
              >
                <Picker.Item style={tw`font-bold text-base`} label="Pilih sektor KBS" value="" />
                {sektorList && sektorList.reduce((acc: any, item: any) => {
                  acc.push(
                    <Picker.Item style={tw`font-bold text-base`} enabled={false} key={item.sektor} label={item.sektor} value="header" />
                  );
                  return acc.concat(
                    item.sub.map((subItem: any) => (
                      <Picker.Item key={subItem.id} label={subItem.subsektor} value={subItem} style={tw`font-bold text-base`} />
                    ))
                  );
                }, [])}
              </Picker>
            </View>
          </View>

          <View style={tw`flex flex-col gap-2`}>
            <Text style={tw`text-gray-800`}>Alamat TSS/TKS</Text>
            <TextInput
              placeholder="Alamat lengkap...."
              onChangeText={(text) => setAlamat(text)}
              value={alamat}
              keyboardType="number-pad"
              style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
              returnKeyType="done"
              autoCapitalize="none"
              placeholderTextColor={'#9ca3af'}
            />
          </View>
        </View>
      </ScrollView>
      <View style={tw`bg-white w-full px-6 py-4 border-t-2 border-green-600`}>
        <TouchableOpacity onPress={() => handleSubmitted()} disabled={!dataChanged} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 ${dataChanged === true ? 'bg-green-600' : 'bg-gray-400'} rounded-full shadow-xl shadow-black/30`}>
          <Text style={tw`text-center font-bold text-base text-white`}>Perbaharui Data</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default UpdateCollectionScreen