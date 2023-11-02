import React, { useEffect, useRef, useState } from 'react'

import { 
  View, 
  Text, 
  KeyboardAvoidingView, 
  Platform, 
  Modal, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView, 
  Image, 
  TextInput,
  Alert
} from 'react-native'

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { DbResult, supabase } from "../lib/supabase";
import { Picker } from '@react-native-picker/picker';

import tw from 'twrnc'
import moment from 'moment-timezone';
import 'moment/locale/id';

import * as Solid from 'react-native-heroicons/solid';

import LottieView from "lottie-react-native";
import yourAnimation from '../assets/images/trash-animation.json';

type RootStackParamList = {
  Detail: { 
    id?: any,
    date?: any,
    totalSampah?: any,
    jenisSampah?: any,
    klasifikasi?: any,
    evidence?: any,
    table?: any,
    source?: any,
    status?: any,
    keterangan?: any,
  };
};

type DetailProps = RouteProp<RootStackParamList, 'Detail'>;

const DetailDataScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<DetailProps>();

  // ref state goes here
  const scrollViewRef = useRef<ScrollView | null>(null);
  
  // modal state goes here
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)

  const [totalSampah, setTotalSampah] = useState<string>('')
  const [listKlasifikasi, setListKlasifikasi] = useState<any>([])
  const [selectedKlasifikasi, setSelectedKlasifikasi] = useState<any>(route.params?.keterangan)

  useEffect(() => {
    if (route) {
      setTotalSampah(route.params?.totalSampah)
    }
  }, [route])

  // state edit data
  const [editData, setEditData] = useState<boolean>(false)
  const [hasChanged, setHasChanged] = useState<boolean>(false)

  // trigger
  const [trigger, setTrigger] = useState<boolean>(false)

  useEffect(() => {
    const dataChange = route.params?.totalSampah !== totalSampah || route.params?.keterangan !== selectedKlasifikasi
    setHasChanged(dataChange)
  }, [totalSampah, selectedKlasifikasi])

  // responsive platform here
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

  const dateObject = moment(route.params?.date)

  // Extract date and time components
  const formattedDate = dateObject.format('LL');

  const handleTextChange = (text: any) => {
    // Validate the input to allow only numbers and a single period
    if (/^\d*\.?\d*$/.test(text)) {
      setTotalSampah(text);
    }
  };

  const getListKlasifikasi = async () => {
    const check = supabase
      .from("tbl_jenis")
      .select()
      .eq("nama", route.params?.jenisSampah)
      .single()
    const CheckKlasifikasi: DbResult<typeof check> = await check;
    const response = CheckKlasifikasi.data

    if (response) {
      const get = supabase
        .from("tbl_daurulang")
        .select("nama")
        .eq("idjenis", response?.id)
      const getKlasifikasi: DbResult<typeof get> = await get;
      const final = getKlasifikasi.data

      setListKlasifikasi(final)
    }

  }

  useEffect(() => {
    getListKlasifikasi()
  }, [])

  const handleEditData = async() => {
    setModalVisible(true)
    setLoading(true)

    try {
      let column;
      if (route.params?.table === 'tbl_olah') {
        column = 'total';
      } else {
        column = 'volume';
      }
      
      const updates = {
        [column]: parseFloat(totalSampah),
        ...(route.params?.table === 'tbl_olah' ? { keterangan: selectedKlasifikasi } : {})
      };

      const update = await supabase
        .from(route.params?.table)
        .update(updates)
        .eq("id", route.params?.id)

      const response = update.error;
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
      setEditData(!editData)
    }
  }

  const handleDeleteData = async() => {
    setModalVisible(true)
    setLoading(true)

    try {
      const update = await supabase
        .from(route.params?.table)
        .delete()
        .eq("id", route.params?.id)

      const response = update.error;
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
      setEditData(!editData)
    }
  }

  useEffect(() => {
    if(trigger === true){
      setTimeout(() => {
        navigation.goBack()
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
            <Text style={[tw`text-green-600 ${titleSize} font-bold`]}>Detail</Text>
            <Text style={[tw`text-gray-500 text-base`]}>{editData ? 'Edit Data' : 'Ringkasan Data'}</Text>
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
            <Text style={tw`text-gray-800 text-base`}>{formattedDate}</Text>
            {
              route.params?.status !== 'Accepted' && route.params?.status !== 'Declined' && (
              <TouchableOpacity onPress={() => {
                if (editData) {
                  if (hasChanged) {
                    Alert.alert(
                      'Hmmm',
                      'Apakah kamu yakin ingin merubah data berikut?',
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel', // This will make the button look like a "Cancel" button
                          onPress: () => {
                            setTotalSampah(route.params?.totalSampah)
                            setEditData(!editData)
                          },
                        },
                        {
                          text: 'Confirm',
                          onPress: () => {
                            handleEditData()
                          },
                        },
                      ]
                    )
                  } else {
                    setEditData(!editData)
                  }
                } else {
                  setEditData(!editData)
                }
              }}>
                <Text style={tw`text-green-600 font-bold text-base`}>
                  {editData ? (hasChanged ? 'Simpan Data' : 'Batal Edit Data') : 'Edit Data'}
                </Text>
              </TouchableOpacity>
              )
            }
          </View>
          {
            route.params?.status !== 'null' && (
              <View style={tw`border border-gray-300 py-4 px-4 rounded-xl flex flex-row items-center justify-between`}>
                <Text style={tw`text-gray-800 text-base`}>Status</Text>
                <Text style={tw`text-gray-800 text-base`}>{route.params?.status}</Text>
              </View>
            )
          }
          <View style={tw`border border-gray-300 py-4 px-4 rounded-xl flex flex-row items-center justify-between`}>
            <Text style={tw`text-gray-800 text-base`}>{route.params?.jenisSampah}</Text>
            <Text style={tw`text-gray-800 text-base`}>{route.params?.klasifikasi}</Text>
          </View>
          {
            route.params?.klasifikasi !== 'Kirim ke TPS' && (
              <View style={tw`border border-gray-300 rounded-xl flex flex-row items-center justify-between`}>
                {
                  editData ? (
                    <Picker
                      selectedValue={selectedKlasifikasi}
                      onValueChange={(value) => setSelectedKlasifikasi(value)}
                      style={tw`flex-1 rounded-xl text-gray-800`}
                    >
                      <Picker.Item label="Tekan untuk ganti" value="" />
                      {
                        listKlasifikasi.map((item: any, index: any) => (
                          <Picker.Item key={index} label={item.nama} value={item.nama} />
                        ))
                      }
                    </Picker>
                  ) : (
                    <Text style={tw`text-gray-800 py-4 px-4 text-base`}>{route.params?.keterangan}</Text>
                  )
                }
              </View>
            )
          }
          <View style={tw`border border-gray-300 py-4 px-4 rounded-xl flex flex-row items-center justify-between`}>
            <Text style={tw`mr-4 text-gray-800 text-base`}>Total</Text>
            {
              editData ? (
                <TextInput
                  placeholder="Masukkan total sampah... (cth: 0.2)"
                  onChangeText={(text) => handleTextChange(text)}
                  value={totalSampah}
                  keyboardType="numeric"
                  style={tw`flex-1 px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
                  returnKeyType="done"
                  placeholderTextColor={'#9ca3af'}
                />
              ) : (
                <Text style={tw`text-gray-800`}><Text style={tw` text-xl font-bold`}>{route.params?.totalSampah} </Text>(Kg)</Text>
              )
            }
          </View>

          {
            route.params?.status !== 'Accepted' && route.params?.status !== 'Declined' && (
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Hmmm',
                  'Apakah kamu yakin ingin menghapus data berikut?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    {
                      text: 'Confirm',
                      onPress: () => {
                        handleDeleteData()
                      },
                    },
                  ]
                )
              }} style={tw`flex-1 px-4 py-4 bg-white`}>
                <Text style={tw`text-red-500 font-bold text-center`}>Hapus data sampah?!</Text>
              </TouchableOpacity>
            )
          }
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default DetailDataScreen