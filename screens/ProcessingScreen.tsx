import React, { useRef, useEffect, useState, useCallback } from "react";

import { 
  View,
  Text,
  Platform,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Linking,
  Dimensions,
  Pressable,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image as img } from 'react-native-compressor';

import tw from 'twrnc';
import * as Solid from 'react-native-heroicons/solid';

import AsyncStorage from "@react-native-async-storage/async-storage";

import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { DbResult, supabase } from "../lib/supabase";
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

const ProcessingScreen = (props: Props) => {
  const navigation = useNavigation<any>()

  const dispatch = useDispatch()

  const selected_image = useSelector((state: any) => state.select_image);
  
  const route = useRoute<any>();

  const scrollViewRef = useRef<ScrollView | null>(null);

  const [imageSource, setImageSource] = useState<any>(null);

  const [baseSampah, setBaseSampah] = useState<any>([])
  const [klasifikasi, setKlasifikasi] = useState<string | null>(null)
  
  const [selectTPS, setSelectTPS] = useState<any>(null)
  const [searchLoad, setSearchLoad] = useState(false)
  const [suggestionTPS, setSuggestionTPS] = useState<any>(null)
  const dropdownController = useRef<any>()

  const getSuggestTPS = useCallback(async (q: any) => {
    const filterToken = q.toLowerCase()
    if (typeof q !== 'string' || q.length < 3) {
      setSuggestionTPS(null)
      return
    }
    setSearchLoad(true)
    
    const check = supabase
      .from("tbl_tps")
      .select(`id, nama_tps, type_tps`)
    const CheckUserEmailEvent: DbResult<typeof check> = await check;
    const items = CheckUserEmailEvent.data || []

    if (items.length > 0) {
      const suggestions = items
        .filter(item => item.nama_tps.toLowerCase().includes(filterToken))
        .map(item => ({
          id: item.id,
          title: `${item.nama_tps}`,
        }))
      setSuggestionTPS(suggestions)
      setSearchLoad(false)
    } else {
      setSuggestionTPS([])
      setSearchLoad(false)
    }
  }, [])

  const onClearPressTPS = useCallback(() => {
    setSuggestionTPS(null)
  }, [])

  const onOpenSuggestionTPS = useCallback((isOPened: any) => {}, [])

  const [selectedSampah, setSelectedSampah] = useState<any>({
    id: '', 
    tpsId: '', 
    operatorId: '', 
    tipe: '', 
    jenis: '', 
    volume: 0.0,
    total: 0.0
  })

  const [selectedClasify, setSelectedClasify] = useState<string>('')
  const [totalSampah, setTotalSampah] = useState<string>('')

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const [message, setMessage] = useState<string | null>(null)
  const [loadSkeleton, setLoadSkeleton] = useState<boolean>(false)

  const padding = Platform.OS === "ios" ? 'px-4 py-4' : ''
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

  const getBaseSampah = async () => {
    const retreiveTPS = await retrieveNumber('TPS');
    const retreiveOperatorID = await retrieveNumber('OperatorID')

    const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
    const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;

    const check = supabase
      .from("tbl_kelola")
      .select(`id, tpsId, volume, operatorId, tipe, jenis, status, tbl_olah(source, jenis, total, destination)`)
      .eq("tpsId", `${TPS}`)
      .eq("status", "Approved")
    const response = await check;
    
    return response.data
  }

  const prom = () => {
    setLoadSkeleton(true)
    Promise.all([getBaseSampah()])
      .then(([totalSampah]) => {
        setBaseSampah(totalSampah)

        setLoadSkeleton(false)
      })
      .catch((error) => {
        console.error('An error occurred:', error);
        setLoadSkeleton(false)
      });
  }

  useEffect(() => {
    prom()
  }, []);

  const handleKlasifikasi = (choose: any) => {
    setKlasifikasi(choose)
    if(choose === 'Transfer'){
      setSelectedClasify('Kirim ke TPS')
    }
  }

  const getOlahSampah = async () => {
    const retreiveTPS = await retrieveNumber('TPS');
    const retreiveOperatorID = await retrieveNumber('OperatorID')

    const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
    const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;

    const check = supabase
      .from("tbl_olah")
      .select(`source, jenis, total`)
      .eq("tpsId", `${TPS}`).eq("source", selectedSampah.id)
    const response = await check;
    
    return response.data
  }

  useEffect(() => {
    if(selectedSampah.id !== null){
      getOlahSampah()
    }
  }, [selectedSampah]);

  const groupedData = baseSampah
  ? baseSampah
    .filter((olah: any) => olah.status !== 'Transfered')
    .reduce((result: any, item: any) => {
      const existingItem = result.find((group: any) => group.jenis === item.jenis);
      if (existingItem) {
        existingItem.volume += item.volume;
        existingItem.total += item.tbl_olah
        .reduce((acc: any, olahItem: any) => acc + olahItem.total, 0);
      } else {
        const totalFromOlahSampah = item.tbl_olah
        .reduce((acc: any, olahItem: any) => acc + olahItem.total, 0);
        result.push({ 
          id: item.id, 
          tpsId: item.tpsId, 
          operatorId: item.operatorId, 
          tipe: item.tipe, 
          jenis: item.jenis, 
          volume: item.volume,
          total: totalFromOlahSampah
        });
      }
      return result;
    }, [])
  : [];

  const handleSelect = (item: any) => {
    setSelectedSampah(item)
  }

  const handleSubmit = async () => {
    const retreiveTPS = await retrieveNumber('TPS');
    const retreiveOperatorID = await retrieveNumber('OperatorID')

    const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
    const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;
      
    let masuk;
    let clasify;
    let ket;
    let status;

    if (klasifikasi === 'Transfer') {
      masuk = selectTPS.id
      clasify = 'Kirim ke TPS'
      ket = 'Kirim ke TPS'
      status = 'Pending'
    } else {
      masuk = null;
      clasify = selectedClasify
      ket = 'Daur Ulang'
      status = null
    }

    const tpsIdValue = typeof masuk === 'number' ? masuk : null;

    navigation.navigate('Confirmation', {
      tps: TPS,
      nama_tps: `${ket === 'Kirim ke TPS' ? selectTPS.title : 'Sampah'}`,
      operator: OperatorID,
      evidence: imageSource,
      jenis: selectedSampah.jenis,
      klasifikasi: ket,
      keterangan: clasify,
      source: selectedSampah.id,
      destination: tpsIdValue,
      status: status,
      volume: parseFloat(totalSampah),
      from: 'Processing'
    })
  }
  
  const isFieldEmpty = !imageSource || !selectedSampah || !selectedClasify || !totalSampah || (klasifikasi === 'transfer' && !selectTPS)

  const handleTextChange = (text: any) => {
    // Validate the input to allow only numbers and a single period
    if (/^\d*\.?\d*$/.test(text)) {
      setTotalSampah(text);
    }
  };

  const [listKlasifikasi, setListKlasifikasi] = useState<any>()

  const getListKlasifikasi = async () => {
    const check = supabase
      .from("tbl_jenis")
      .select()
      .eq("nama", selectedSampah.jenis)
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
    if (selectedSampah) {
      getListKlasifikasi()
    }
  }, [selectedSampah])

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

  const RenderEmpty = () => {
    return(
      <Text style={tw`text-gray-700 p-4`}>
        Tidak ada data
      </Text>
    )
  }

  useEffect(() => {
    if (selected_image) {
      setImageSource(selected_image)
    } else {
      setImageSource(null)
    }
  }, [selected_image])

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
              <Text style={tw`font-bold text-base text-green-600`}>Menyimpan data sampah...</Text>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <View style={tw`flex-1 items-center justify-center gap-4`}>
              {
                message ? (
                  <>
                    <Text style={tw`font-bold text-base text-gray-900`}>Waduhhh</Text>
                    <Text style={tw`font-medium text-sm text-gray-900`}>{message}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false)
                        setMessage(null)
                      }}
                      style={tw`px-6 py-2 rounded-full bg-green-600`}
                    >
                      <Text style={tw`font-bold text-sm text-white`}>Dicoba lagi yuk</Text>
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
        <Text style={tw`${titleSize} font-bold text-green-600 text-center`}>Olah Sampah</Text>
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
          
          <Text style={tw`text-gray-700 mt-4`}>Sampah Tersedia :</Text>
          <View style={tw`flex flex-row justify-between items-center gap-4`}>
          {
            groupedData.length > 0 ? (
              groupedData.map((item: any, index: any) => {
                return(
                  <TouchableOpacity disabled={(item.volume - item.total) === 0 ? true : false} onPress={() => handleSelect(item)} key={index + 1} style={tw`border-2 ${item.id === selectedSampah.id ? 'bg-green-50 border-green-600' : 'bg-gray-100 border-gray-200'} rounded-xl flex-1 flex-col justify-center items-center py-6 gap-2`}>
                    <View style={tw`flex`}>
                      <Text style={tw`text-base font-bold ${item.id === selectedSampah.id ? 'text-green-600' : 'text-gray-600'}`}>{item.jenis}</Text>
                    </View>
                    <Text style={tw`text-sm ${item.id === selectedSampah.id ? 'text-green-600' : 'text-gray-600'}`}>

                      <Text style={tw`font-bold text-base`}> {(item.volume - item.total).toFixed(1)}</Text> {`(Kg)`}
                    </Text>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View>
                <Text style={tw`text-gray-700`}>Belum ada data.</Text>
              </View>
            )
          }
          </View>

          <View style={tw`flex flex-row justify-between items-center gap-4`}>
            <TouchableOpacity onPress={() => handleKlasifikasi('Daur Ulang')} style={tw`${klasifikasi === 'Daur Ulang' ? 'bg-green-600' : 'bg-gray-200'} rounded-xl flex-1 flex-col justify-center items-center py-6 gap-2`}>
              <Text style={tw`text-base ${klasifikasi === 'Daur Ulang' ? 'text-white' : 'text-gray-600'}`}>Daur Ulang</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleKlasifikasi('Transfer')} style={tw`${klasifikasi === 'Transfer' ? 'bg-green-600' : 'bg-gray-200'} rounded-xl flex-1 flex-col justify-center items-center py-6 gap-2`}>
              <Text style={tw`text-base ${klasifikasi === 'Transfer' ? 'text-white' : 'text-gray-600'}`}>Transfer</Text>
            </TouchableOpacity>
          </View>
          
          {
            klasifikasi === 'Daur Ulang' && selectedSampah.id !== '' && (
              <>
              <View style={tw`flex flex-col gap-2`}>
                <Text style={tw`text-gray-800`}>Pilih keterangan pengolahan</Text>
                <View style={tw`${padding} border border-gray-300 rounded-xl`}>
                  <Picker
                    selectedValue={selectedClasify}
                    onValueChange={(itemValue: any) => {
                      setSelectedClasify(itemValue)
                    }}
                    style={tw`text-gray-900`}
                  >
                    <Picker.Item style={tw`font-bold text-base`} label="Pilih Keterangan Pengolahan" value="" />
                    {
                      listKlasifikasi && listKlasifikasi.map((item: any, index: any) => (
                        <Picker.Item key={index} label={item.nama} value={item.nama} style={tw`font-bold text-base`} />
                      ))
                    }
                  </Picker>
                </View>
              </View>
              <View style={tw`flex flex-col gap-2`}>
                <Text style={tw`text-gray-800`}>Total Sampah {`(Kg)`}</Text>
                <TextInput
                  placeholder="Masukkan total sampah... (cth: 0.1)"
                  onChangeText={(text) => setTotalSampah(text)}
                  value={totalSampah}
                  keyboardType="number-pad"
                  style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
                  returnKeyType="done"
                  placeholderTextColor={'#9ca3af'}
                />
              </View>
              </>
            )
          }

          {
            klasifikasi === 'Transfer' && selectedSampah.id !== '' && (
              <>
              <View style={tw`flex flex-col gap-2`}>
                <Text style={tw`text-gray-800`}>Total Sampah {`(Kg)`}</Text>
                <TextInput
                  placeholder="Masukkan total sampah... (cth: 0.1)"
                  onChangeText={(text) => handleTextChange(text)}
                  value={totalSampah}
                  keyboardType="numeric"
                  style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
                  returnKeyType="done"
                  placeholderTextColor={'#9ca3af'}
                />
              </View>
              <View style={tw`flex flex-col gap-2`}>
                <Text style={tw`text-gray-800`}>Transfer kemana?</Text>
                <Text style={tw`text-gray-600 text-xs`}>Langsung cari dengan nama daerah (min 3 huruf)</Text>
                <View style={tw`${padding} border border-gray-300 rounded-xl`}>
                  <AutocompleteDropdown
                    controller={(controller: any) => {
                      dropdownController.current = controller
                    }}
                    // initialValue={'1'}
                    direction={Platform.select({ ios: 'down' })}
                    dataSet={suggestionTPS}
                    onChangeText={getSuggestTPS}
                    onSelectItem={(item: any) => {
                      item && setSelectTPS(item)
                    }}
                    debounce={600}
                    suggestionsListMaxHeight={Dimensions.get('window').height * 0.4}
                    onClear={onClearPressTPS}
                    onOpenSuggestionsList={onOpenSuggestionTPS}
                    loading={loading}
                    useFilter={false}
                    textInputProps={{
                      placeholder: 'Ketik minimal 3 huruf...',
                      placeholderTextColor: '#6b7280',
                      autoCorrect: false,
                      autoCapitalize: 'none',
                      style: {
                        borderRadius: 10,
                        backgroundColor: '#fff',
                        color: '#383b42',
                        paddingLeft: 18,
                      },
                    }}
                    rightButtonsContainerStyle={{
                      right: 8,
                      height: 30,
                      alignSelf: 'center',
                    }}
                    inputContainerStyle={{
                      backgroundColor: '#fff',
                      borderRadius: 10,
                    }}
                    suggestionsListContainerStyle={{
                      backgroundColor: '#f3f4f6',
                      borderColor: '#4b5563'
                    }}
                    containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                    renderItem={(item, text) => {
                      return(
                        <>
                        {
                          item ? (
                            <Text style={tw`text-gray-700 p-4`}>
                              {item.title}
                            </Text>
                          ) : (
                            <Text style={tw`text-gray-700 p-4`}>
                              Tidak ada data
                            </Text>
                          )
                        }
                        </>
                      )
                    }}
                    inputHeight={50}
                    showChevron={false}
                    closeOnBlur={false}
                    EmptyResultComponent={<RenderEmpty />}
                  />
                </View>
              </View>
              </>
            )
          }
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

export default ProcessingScreen