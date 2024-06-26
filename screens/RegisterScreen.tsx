import React, { useCallback, useEffect, useRef, useState } from "react";

import { 
  View,
  Text,
  Platform,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { useNavigation } from "@react-navigation/native";

import tw from 'twrnc';
import * as Solid from 'react-native-heroicons/solid';

import { DbResult, supabase } from "../lib/supabase";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { Image as img } from 'react-native-compressor';
import { launchCamera } from 'react-native-image-picker';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../lib/constant";

type Props = {}

const RegisterScreen = (props: Props) => {
  const navigation = useNavigation()

  const [klasifikasi, setKlasifikasi] = useState<string>('')

  const [tempat, setTempat] = useState<string>('')
  const [selectedIDSektor, setSelectedIDSektor] = useState('');
  const [selectKelKec, setSelectKelKec] = useState<any>()
  const [alamat, setAlamat] = useState<string>('')

  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [hp, setHP] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const [showPassword, setShowPassword] = useState<boolean>(true)

  const handleKlasifikasi = (choose: any) => {
    setKlasifikasi(choose)
  }

  const [loadSektor, setLoadSektor] = useState<boolean>(false)
  const [sektorList, setSektorList] = useState<any>()
  const [messageLoadSektor, setMessageLoadSektor] = useState<any>(null)

  const [suggestionsList, setSuggestionsList] = useState<any>(null)
  const [searchLoad, setSearchLoad] = useState(false)

  const dropdownController = useRef<any>()

  const [imageSource, setImageSource] = useState<any>(null);

  const isFieldEmpty = !klasifikasi || !tempat || !selectedIDSektor || !selectKelKec || !alamat || !fullName || !email || !hp || !password || !imageSource

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

  const getSuggestions = useCallback(async (q: any) => {
    const filterToken = q.toLowerCase()
    if (typeof q !== 'string' || q.length < 3) {
      setSuggestionsList(null)
      return
    }
    setSearchLoad(true)
    
    const check = supabase
      .from("tbl_kelurahan")
      .select(`id, nama, tbl_kecamatan(id, nama)`)
    const CheckUserEmailEvent: DbResult<typeof check> = await check;
    const items = CheckUserEmailEvent.data || []

    const suggestions = [
      ...items
        .filter((item: any) => item.nama.toLowerCase().includes(filterToken))
        .map((item: any, index: any) => ({
          id: index,
          id_kelurahan: item.id,
          id_kecamatan: item.tbl_kecamatan.id,
          title: `${item.nama}, ${item.tbl_kecamatan.nama}`,
        })),
      ...items
        .filter((item: any) => item.tbl_kecamatan.nama.toLowerCase().includes(filterToken))
        .map((item: any, index: any) => ({
          id: index,
          id_kelurahan: item.id,
          id_kecamatan: item.tbl_kecamatan.id,
          title: `${item.nama}, ${item.tbl_kecamatan.nama}`,
        })),
    ];

    setSuggestionsList(suggestions)
    setSearchLoad(false)
  }, [])

  const onClearPress = useCallback(() => {
    setSuggestionsList(null)
  }, [])
  const onOpenSuggestionsList = useCallback((isOpened: any) => {}, [])

  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)

  const padding = Platform.OS === "ios" ? 'px-4 py-4' : ''
  const titleSize = Platform.OS === "ios" ? 'text-lg' : 'text-3xl'

  const handleSubmitted = async () => {
    setLoading(true)
    setModalVisible(true)
    setRegistrationError(null)

    try {

      const checkEmail = supabase
        .from("tbl_operator")
        .select()
        .eq("email", email)
      const CheckUserEmailEvent: DbResult<typeof checkEmail> = await checkEmail;
      if (CheckUserEmailEvent.data?.length ?? 0 > 0) {
        setRegistrationError('Email has been registered!')
        return
      }

      const InsertOperator = supabase
        .from("tbl_operator")
        .insert({
          email: email,
          fullname: fullName,
          password: password,
          phoneNumber: hp,
        })
        .select()
      const UserEvent: DbResult<typeof InsertOperator> = await InsertOperator;
      if (UserEvent.error) {
        setRegistrationError(UserEvent.error.message)
        return
      }

      const InsertTPS = supabase
        .from("tbl_tps")
        .insert({
          subsektor_id: selectedIDSektor,
          foto: imageSource,
          alamat: alamat,
          nama_tps: tempat,
          type_tps: klasifikasi,
          id_kecamatan: selectKelKec.id_kecamatan,
          id_kelurahan: selectKelKec.id_kelurahan,
        })
        .select()
      const TPSEvent: DbResult<typeof InsertTPS> = await InsertTPS;
      if (TPSEvent.error) {
        setRegistrationError(TPSEvent.error.message)
        return
      }

      const insertOperatorTPS = supabase
        .from("tbl_operator_tps")
        .insert({
          tpsId: TPSEvent.data && TPSEvent.data[0].id,
          operatorId: UserEvent.data && UserEvent.data[0].id,
        })
      const ProfileEvent: DbResult<typeof insertOperatorTPS> = await insertOperatorTPS;
      if (ProfileEvent.error) {
        setRegistrationError(ProfileEvent.error.message)
        return
      }
    } catch (error: any) {
      setRegistrationError(error.message)
    } finally {
      setLoading(false)
    }
  }

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
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
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
              registrationError ? (
                <>
                  <Text style={tw`font-bold text-base text-gray-900`}>Registration Error</Text>
                  <Text style={tw`font-medium text-sm text-gray-900`}>{registrationError}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false)
                      setRegistrationError(null)
                    }}
                    style={tw`px-6 py-2 rounded-full bg-green-600`}
                  >
                    <Text style={tw`font-bold text-sm text-white`}>Close</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={tw`font-bold text-base text-gray-900`}>Yeayyyy</Text>
                  <Text style={tw`font-medium text-sm text-gray-900`}>Your user registration has been set!</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false)
                      navigation.navigate('Welcome' as never)
                    }}
                    style={tw`px-6 py-2 rounded-full bg-green-600`}
                  >
                    <Text style={tw`font-bold text-sm text-white`}>Let's start journey</Text>
                  </TouchableOpacity>
                </>
              )
            }
          </View>
        )
      }
      </Modal>
      <View style={tw`w-full bg-gray-50 px-4 pt-16 pb-2`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`bg-transparent flex flex-row gap-2 items-center`}>
          <Solid.ArrowLeftIcon size={28} style={tw`text-green-600`} />
        <Text style={tw`${titleSize} font-bold text-green-600 text-center`}>Daftar</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`flex-1 w-full bg-white px-4 gap-6 ${ Platform.OS === "android" ? 'pt-16 pb-26' : 'pt-6 pb-26'}`}>
        <View>
          <Text style={tw`font-bold text-xl text-gray-900`}>Masukkan Informasi KBS Anda</Text>
          <Text style={tw`text-sm text-gray-600`}>Buat masuk ke akunmu atau daftar kalau kamu baru di Bandung Waste Management.</Text>
        </View>
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
        <View style={tw`flex flex-row justify-between items-center gap-4`}>
          <TouchableOpacity onPress={() => handleKlasifikasi('TSS')} style={tw`${klasifikasi === 'TSS' ? 'bg-green-600' : 'bg-gray-200'} rounded-xl flex-1 flex-col justify-center items-center py-6 gap-2`}>
            <Text style={tw`text-base ${klasifikasi === 'TSS' ? 'text-white' : 'text-gray-600'}`}>TSS</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleKlasifikasi('TKS')} style={tw`${klasifikasi === 'TKS' ? 'bg-green-600' : 'bg-gray-200'} rounded-xl flex-1 flex-col justify-center items-center py-6 gap-2`}>
            <Text style={tw`text-base ${klasifikasi === 'TKS' ? 'text-white' : 'text-gray-600'}`}>TKS</Text>
          </TouchableOpacity>
        </View>
        {klasifikasi !== '' && (
        <View style={tw`flex w-full bg-green-50 border-2 border-green-600 rounded-xl px-4 py-3 gap-2`}>
          <Text style={tw`text-green-600 font-bold`}>
            {
              klasifikasi === 'TSS' ? 'TSS adalah Titik Sumber Sampah' : 'TKS adalah Titik Kumpul Sampah'
            }
          </Text>
        </View>
        )}
        <View style={tw`flex flex-col gap-2`}>
          <Text style={tw`text-gray-800`}>Nama Tempat</Text>
          <TextInput
            placeholder="Cth: Rumah"
            onChangeText={(text) => setTempat(text)}
            value={tempat}
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
              selectedValue={selectedIDSektor}
              onValueChange={(itemValue: any) => {
                setSelectedIDSektor(itemValue)
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
                    <Picker.Item key={subItem.id} label={subItem.subsektor} value={subItem.id} style={tw`font-bold text-base`} />
                  ))
                );
              }, [])}
            </Picker>
          </View>
        </View>
        <View style={tw`flex flex-col gap-2`}>
          <Text style={tw`text-gray-800`}>Kelurahan, Kecamatan</Text>
          <View style={tw`${padding} border border-gray-300 rounded-xl`}>
            <AutocompleteDropdown
              controller={(controller: any) => {
                dropdownController.current = controller
              }}
              // initialValue={'1'}
              direction={Platform.select({ ios: 'down' })}
              dataSet={suggestionsList}
              onChangeText={getSuggestions}
              onSelectItem={(item: any) => {
                item && setSelectKelKec(item)
              }}
              debounce={600}
              suggestionsListMaxHeight={Dimensions.get('window').height * 0.4}
              onClear={onClearPress}
              onOpenSuggestionsList={onOpenSuggestionsList}
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
              renderItem={(item, text) => <Text style={suggestionsList ? { color: '#383b42', padding: 15 } : { color: '#383b42', padding: 15 }}>
                {item.title}
              </Text>}
              inputHeight={50}
              showChevron={false}
              closeOnBlur={false}
            />
          </View>
        </View>
        <View style={tw`flex flex-col gap-2`}>
          <Text style={tw`text-gray-800`}>Alamat</Text>
          <TextInput
            placeholder="Alamat lengkap Tempat Pengelolaan..."
            onChangeText={(text) => setAlamat(text)}
            value={alamat}
            keyboardType="default"
            style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
            returnKeyType="done"
            autoCapitalize="none"
            placeholderTextColor={'#9ca3af'}
          />
        </View>
        <View style={tw`flex flex-col gap-2`}>
          <Text style={tw`text-gray-800`}>Nama Penanggung Jawab</Text>
          <TextInput
            placeholder="Cth: Irvan Gerhana"
            onChangeText={(text) => setFullName(text)}
            value={fullName}
            keyboardType="default"
            style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
            returnKeyType="done"
            autoCapitalize="none"
            placeholderTextColor={'#9ca3af'}
          />
        </View>
        <View style={tw`flex flex-col gap-2`}>
          <Text style={tw`text-gray-800`}>Email Penanggung Jawab</Text>
          <TextInput
            placeholder="example@email.com"
            onChangeText={(text) => setEmail(text)}
            value={email}
            keyboardType="email-address"
            style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
            returnKeyType="done"
            autoCapitalize="none"
            placeholderTextColor={'#9ca3af'}
          />
        </View>
        <View style={tw`flex flex-col gap-2`}>
          <Text style={tw`text-gray-800`}>No HP Penanggung Jawab</Text>
          <TextInput
            placeholder="0812xxxxxx"
            onChangeText={(text) => setHP(text)}
            value={hp}
            keyboardType="number-pad"
            style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
            returnKeyType="done"
            autoCapitalize="none"
            placeholderTextColor={'#9ca3af'}
          />
        </View>
        <View style={tw`flex flex-col gap-2`}>
          <Text style={tw`text-gray-800`}>Password</Text>
          <TextInput
            placeholder="*******"
            onChangeText={(text) => setPassword(text)}
            value={password}
            keyboardType="default"
            style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
            returnKeyType="done"
            secureTextEntry={showPassword}
            autoCapitalize="none"
            placeholderTextColor={'#9ca3af'}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={tw`px-4 leading-5 py-4 -mt-4`}>
            <Text style={tw`text-zinc-900`}>Show password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    <View style={tw`bg-white w-full px-6 py-4 border-t-2 border-green-600`}>
      <TouchableOpacity disabled={isFieldEmpty} onPress={() => handleSubmitted()} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 ${isFieldEmpty ? 'bg-gray-400' : 'bg-green-600'} rounded-full shadow-xl shadow-black/30`}>
        <Text style={tw`text-center font-bold text-base text-white`}>Daftar</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
  )
}

export default RegisterScreen