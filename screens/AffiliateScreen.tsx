import React, { useState, useRef, useCallback } from "react";

import { 
  View,
  Text,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';

import { useNavigation } from "@react-navigation/native";

import tw from 'twrnc';

import AsyncStorage from "@react-native-async-storage/async-storage";

import { DbResult, supabase } from "../lib/supabase";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

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

const AffiliateScreen = (props: Props) => {
  const navigation = useNavigation()

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const [message, setMessage] = useState<string | null>(null)

  const [selectTPS, setSelectTPS] = useState<any>(null)

  const padding = Platform.OS === "ios" ? 'px-4 py-4' : ''
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

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

  const scrollViewRef = useRef<ScrollView | null>(null);

  const handleSubmit = async () => {
    setModalVisible(true)
    setLoading(true)

    try {
      const OperatorID = await retrieveNumber('OperatorID');
      const check = await supabase
        .from("tbl_operator_tps")
        .update({
          affiliate: selectTPS.id
        })
        .eq("operatorId", `${OperatorID}`)
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
    }
  }

  const RenderEmpty = () => {
    return(
      <Text style={tw`text-gray-700 p-4`}>
        Tidak ada data
      </Text>
    )
  }

  const isEmptyField = !selectTPS
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`flex-1 bg-white pb-8`]}
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
                    <Text style={tw`font-medium text-sm text-gray-900`}>Data kamu berhasil disimpan!</Text>
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
      <View style={tw`flex-1 w-full px-4 pt-16 pb-2`}>
        <View style={tw`bg-transparent flex flex-row gap-2 items-center`}>
          <Text style={tw`${titleSize} font-bold text-green-600 text-center`}>Afiliasi dengan TPS</Text>
        </View>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={tw`flex-1 w-full bg-white px-4 gap-6 ${ Platform.OS === "android" ? 'pt-16' : 'pt-6'}`}>
            <View style={tw`flex flex-col gap-2`}>
              <Text style={tw`text-gray-800`}>Tempat pembuangan sampah</Text>
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
          </View>
        </ScrollView>
      </View>
      <View style={tw`bg-white py-6 flex flex-row px-4 border-t-2 border-green-600 gap-4`}>
        <TouchableOpacity onPress={() => handleSubmit()} disabled={isEmptyField} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 ${selectTPS !== null ? 'bg-green-600' : 'bg-gray-400'} rounded-full shadow-xl shadow-black/30`}>
          <Text style={tw`text-center font-bold text-base text-white`}>Pilih TPS</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default AffiliateScreen