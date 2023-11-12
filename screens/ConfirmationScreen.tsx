import React, { useEffect, useRef, useState } from 'react'

import { View, Text, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, TouchableOpacity, ScrollView, Image } from 'react-native'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { DbResult, supabase } from "../lib/supabase";

import tw from 'twrnc'

import * as Solid from 'react-native-heroicons/solid';

import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from "lottie-react-native";
import yourAnimation from '../assets/images/trash-animation.json';
import { useDispatch } from 'react-redux';

type RootStackParamList = {
  ConfirmationDetail: { 
    tps?: any,
    nama_tps?: any,
    operator?: any,
    evidence?: any,
    jenis?: any,
    tipe?: any,
    status?: any,
    from?: any,
    volume?: any,
    klasifikasi?: any,
    keterangan?: any,
    source?: any,
    destination?: any,
  };
};

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

type ConfirmationDetailProps = RouteProp<RootStackParamList, 'ConfirmationDetail'>;

const ConfirmationScreen = () => {
  const dispatch = useDispatch()

  const navigation = useNavigation<any>();
  const route = useRoute<ConfirmationDetailProps>();

  // ref state goes here
  const scrollViewRef = useRef<ScrollView | null>(null);
  
  // modal state goes here
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)

  // persetujuan state
  const [setuju, setSetuju] = useState<boolean>(false)

  // trigger
  const [trigger, setTrigger] = useState<boolean>(false)

  // responsive platform here
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

  const handleSorting = async () => {
    setModalVisible(true)
    setLoading(true)

    try {
      const retreiveTPS = await retrieveNumber('TPS');
      const retreiveOperatorID = await retrieveNumber('OperatorID')
  
      const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
      const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;

      const check = await supabase
        .from("tbl_kelola")
        .insert({
          volume: route.params?.volume,
          tipe: 'Terpilah',
          operatorId: OperatorID,
          tpsId: TPS,
          evidence: route.params?.evidence,
          jenis: route.params?.jenis,
          status: 'Approved'
        })

      const response = check.error;
      if (response == null) {
        setMessage(null)
      } else {
        setMessage(response.message)
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
      setTrigger(true)

      dispatch({ type: 'SELECT_IMAGE', payload: '' });
    }
  }

  const handleProcessing = async () => {
    setModalVisible(true)
    setLoading(true)

    try {
      const retreiveTPS = await retrieveNumber('TPS');
      const retreiveOperatorID = await retrieveNumber('OperatorID')
  
      const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
      const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;

      const check = await supabase
        .from("tbl_olah")
        .insert({
          tpsId: TPS,
          jenis: route.params?.jenis,
          klasifikasi: route.params?.klasifikasi,
          total: route.params?.volume,
          keterangan: route.params?.keterangan,
          operatorId: OperatorID,
          evidence: route.params?.evidence,
          source: route.params?.source,
          destination: route.params?.destination,
          status_transfer: route.params?.status
        })

      const response = check.error;
      if (response == null) {
        setMessage(null)
      } else {
        setMessage(response.message)
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
      setTrigger(true)

      dispatch({ type: 'SELECT_IMAGE', payload: '' });
    }
  }

  useEffect(() => {
    if(trigger === true){
      setTimeout(() => {
        navigation.navigate('Home')
        setTrigger(false)
      }, 3000)
    }
  }, [trigger])

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
              <Text style={tw`font-bold text-base`}>Menyimpan data sampah...</Text>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <View style={tw`flex-1 items-center justify-center gap-4`}>
              {
                message ? (
                  <>
                    <Text style={tw`font-bold text-base text-gray-900`}>Aduh ada error!</Text>
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
                    <LottieView
                      source={yourAnimation} // JSON animation file
                      autoPlay
                      speed={1} // Adjust the animation speed
                      style={{ width: 200, height: 200 }} // Set the animation dimensions
                    />
                    <Text style={tw`font-bold text-base text-gray-900`}>Yeayyyy</Text>
                    <Text style={tw`font-medium text-sm text-gray-900`}>Data sampah kamu berhasil disimpan!</Text>
                  </>
                )
              }
            </View>
          )
        }
      </Modal>
      <View style={tw`w-full bg-gray-100 px-4 pt-16 pb-2 border-b-2 border-green-600`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`bg-transparent flex flex-row gap-2`}>
          <Solid.ArrowLeftIcon size={28} style={tw`text-green-600 mt-1`} />
          <View style={tw`flex flex-col pb-4`}>
            <Text style={[tw`text-green-600 ${titleSize} font-bold`]}>Konfirmasi</Text>
            <Text style={[tw`text-gray-500 text-base`]}>Data {route.params?.from === 'Sorting' ? 'Sampah Masuk' : 'Pengolahan Sampah'}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={tw`w-full h-120`}>
          {/* <TouchableOpacity style={tw`absolute z-50 top-4 right-4 px-4 py-2 bg-white rounded-xl`}>
            <Text style={tw`text-gray-800`}>Lihat gambar</Text>
          </TouchableOpacity> */}
          <Image
            source={{ uri: route.params?.evidence }}
            style={[tw`w-full h-full`]}
            resizeMode="cover"
          />
        </View>
        <View style={tw`-top-28 flex-1 w-full bg-white px-4 gap-6 rounded-3xl ${ Platform.OS === "android" ? 'pt-8' : 'pt-6'}`}>
          <View style={tw`border-b border-gray-200 pb-6`}>
            <Text style={tw`text-gray-950 text-base`}>Cek kembali ringkasan data kamu!</Text>
          </View>
          <View style={tw`border border-gray-300 py-4 px-4 rounded-xl flex flex-row items-center justify-between`}>
            <Text style={tw`text-gray-800 text-base`}>{route.params?.from === 'Sorting' ? 'Sampah' : route.params?.klasifikasi === 'Kirim ke TPS' ? 'Kirim ke' : 'Daur Ulang'}</Text>
            {
              route.params?.from === 'Processing' && (<Text style={tw`text-gray-800 text-xl font-bold`}>{route.params?.nama_tps}</Text>)
            }
            {
              route.params?.from === 'Sorting' && (<Text style={tw`text-gray-800 text-xl font-bold`}>{route.params?.tipe}</Text>)
            }
          </View>
          <View style={tw`border border-gray-300 py-4 px-4 rounded-xl flex flex-row items-center justify-between`}>
            <Text style={tw`text-gray-800 text-base`}>Jenis</Text>
            <Text style={tw`text-gray-800 text-xl font-bold`}>{route.params?.jenis}</Text>
          </View>
          <View style={tw`border border-gray-300 py-4 px-4 rounded-xl flex flex-row items-center justify-between`}>
            <Text style={tw`text-gray-800 text-base`}>Keterangan</Text>
            <Text style={tw`text-gray-800 text-xl font-bold`}>{route.params?.keterangan}</Text>
          </View>
          <View style={tw`border border-gray-300 py-4 px-4 rounded-xl flex flex-row items-center justify-between`}>
            <Text style={tw`text-gray-800 text-base`}>Total</Text>
            <Text style={tw`text-gray-800`}><Text style={tw` text-xl font-bold`}>{route.params?.volume} </Text>(Kg)</Text>
          </View>
        </View>
      </ScrollView>
      <View style={tw`bg-white w-full px-6 py-4 border-t-2 border-green-600 gap-4 flex items-center`}>
        <TouchableOpacity onPress={() => setSetuju(!setuju)} style={tw`flex flex-row items-center gap-2`}>
          {
            setuju ? (
              <Solid.CheckCircleIcon size={24} style={tw`${!setuju ? 'text-gray-400' : 'text-green-600'}`} />
            ) : (
              <Solid.XCircleIcon size={24} style={tw`${!setuju ? 'text-gray-400' : 'text-green-600'}`} />
            )
          }
          <Text style={tw`text-gray-950 text-xs`}>Klik disini jika sudah yakin dengan data kamu, silahkan lanjutkan menyimpan data.</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          if (route.params?.from === 'Sorting') {
            handleSorting()
          } else {
            handleProcessing()
          }
        }} disabled={!setuju} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 ${!setuju ? 'bg-gray-400' : 'bg-green-600'} rounded-full shadow-xl shadow-black/30`}>
          <Text style={tw`text-center font-bold text-base text-white`}>Simpan data sampah</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ConfirmationScreen