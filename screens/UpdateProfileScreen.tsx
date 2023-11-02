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
} from 'react-native';

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import tw from 'twrnc';
import * as Solid from 'react-native-heroicons/solid';

import { DbResult, supabase } from "../lib/supabase";

type UpdateProfileType = {
  UpdateProfile: { 
    id?: any,
    name?: any,
    email?: any,
    phone?: any,
    password?: any,
  };
};

type UpdateProfileProps = RouteProp<UpdateProfileType, 'UpdateProfile'>;

const UpdateProfileScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<UpdateProfileProps>();
  
  const [id, setID] = useState<any>()
  const [name, setName] = useState<any>()
  const [email, setEmail] = useState<any>()
  const [phone, setPhone] = useState<any>()

  const [passwordLama, setPasswordLama] = useState<any>()
  const [password, setPassword] = useState<any>()
  const [passwordBaru, setPasswordBaru] = useState<any>()
  const [konfirmasiPassword, setKonfirmasiPassword] = useState<any>()
  
  const [showPassword, setShowPassword] = useState<boolean>(true)

  const [dataChanged, setDataChanged] = useState<boolean>(false)

  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (route) {
      const hasChanged = 
        route.params?.name !== name ||
        route.params?.email !== email ||
        route.params?.phone !== phone;

      setDataChanged(hasChanged)

    }
  }, [route, name, email, phone])

  useEffect(() => {
    if (route) {
      setName(route.params?.name || null)
      setEmail(route.params?.email || null)
      setPhone(route.params?.phone || null)
      setPasswordLama(route.params?.password || null)
    }
  }, [route])

  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const handleUpdateProfile = async () => {
    setLoading(true)
    setModalVisible(true)
    setUpdateError(null)

    try {

      const update = await supabase
        .from("tbl_operator")
        .update({
          fullname: name,
          email: email,
          phoneNumber: phone,
        })
        .eq("id", route.params?.id)

      const response = update.error;
      if (response == null) {
        setMessage(null)
      } else {
        setMessage(response.message)
      }
    } catch(e: any) {
      setUpdateError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    setLoading(true)
    setModalVisible(true)
    setUpdateError(null)

    try {

      const update = await supabase
        .from("tbl_operator")
        .update({
          password: passwordBaru,
        })
        .eq("id", route.params?.id)

      const response = update.error;
      if (response == null) {
        setMessage(null)
      } else {
        setMessage(response.message)
      }
    } catch(e: any) {
      setUpdateError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const [passwordLamaSalah, setPasswordLamaSalah] = useState<any>(null)

  useEffect(() => {
    if (passwordLama === password) {
      setPasswordLamaSalah(null)
    } else {
      setPasswordLamaSalah('Password yang kamu masukkan salah!')
    }
  }, [passwordLama, password])

  const [passwordBaruSalah, setPasswordBaruSalah] = useState<any>(null)

  useEffect(() => {
    if (passwordBaru === konfirmasiPassword) {
      setPasswordBaruSalah(null)
    } else {
      setPasswordBaruSalah('Password yang kamu masukkan tidak sama!')
    }
  }, [passwordBaru, konfirmasiPassword])

  const [passwordChange, setPasswordChange] = useState<boolean>(false)

  useEffect(() => {
    if (password && passwordBaru && konfirmasiPassword) {
      const changePassword = 
        route.params?.password !== passwordLama ||
        passwordBaru !== null ||
        konfirmasiPassword !== null;

      setPasswordChange(changePassword)
    }
  }, [password, passwordBaru, konfirmasiPassword])

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
          <Text style={tw`text-xl font-bold text-green-600 text-center`}>Update Profile</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={tw`flex-1 w-full bg-white px-4 gap-6 ${ Platform.OS === "android" ? 'pt-14 pb-26' : 'pt-6 pb-26'}`}>
          <View style={tw`flex flex-col gap-2`}>
            <Text style={tw`text-gray-800`}>Nama</Text>
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
            <Text style={tw`text-gray-800`}>Email</Text>
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
            <Text style={tw`text-gray-800`}>No Telepon</Text>
            <TextInput
              placeholder="example@email.com"
              onChangeText={(text) => setPhone(text)}
              value={phone}
              keyboardType="number-pad"
              style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
              returnKeyType="done"
              autoCapitalize="none"
              placeholderTextColor={'#9ca3af'}
            />
          </View>
          <TouchableOpacity onPress={() => handleUpdateProfile()} disabled={!dataChanged} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 ${dataChanged === true ? 'bg-green-600' : 'bg-gray-400'} rounded-full shadow-xl shadow-black/30`}>
            <Text style={tw`text-center font-bold text-base text-white`}>Update Profile</Text>
          </TouchableOpacity>
          <View style={tw`mt-8`}>
            <Text style={tw`font-bold text-xl text-gray-900`}>Perbaharui password kamu</Text>
            <Text style={tw`text-sm text-gray-600`}>Buatlah password kamu dengan kombinasi huruf, angka, dan special karakter.</Text>
          </View>
          <View style={tw`flex flex-col gap-2`}>
            <Text style={tw`text-gray-800`}>Password Lama</Text>
            <TextInput
              placeholder=""
              onChangeText={(text) => setPassword(text)}
              value={password}
              keyboardType="default"
              style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
              returnKeyType="done"
              secureTextEntry={showPassword}
              autoCapitalize="none"
              placeholderTextColor={'#9ca3af'}
            />
            {
              password && passwordLamaSalah && (
                <Text style={tw`text-red-500`}>{passwordLamaSalah}</Text>
              )
            }
          </View>
          <View style={tw`flex flex-col gap-2`}>
            <Text style={tw`text-gray-800`}>Password Baru</Text>
            <TextInput
              placeholder=""
              onChangeText={(text) => setPasswordBaru(text)}
              value={passwordBaru}
              keyboardType="default"
              style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
              returnKeyType="done"
              secureTextEntry={showPassword}
              autoCapitalize="none"
              placeholderTextColor={'#9ca3af'}
            />
          </View>
          <View style={tw`flex flex-col gap-2`}>
            <Text style={tw`text-gray-800`}>Konfirmasi Password</Text>
            <TextInput
              placeholder=""
              onChangeText={(text) => setKonfirmasiPassword(text)}
              value={konfirmasiPassword}
              keyboardType="default"
              style={tw`px-4 py-4 border border-gray-300 rounded-xl text-gray-800`}
              returnKeyType="done"
              secureTextEntry={showPassword}
              autoCapitalize="none"
              placeholderTextColor={'#9ca3af'}
            />
            {
              passwordBaruSalah && (
                <Text style={tw`text-red-500`}>{passwordBaruSalah}</Text>
              )
            }
          </View>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={tw`px-4 leading-5 py-4 -mt-4`}>
            <Text style={tw`text-zinc-900`}>Show password</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePasswordChange()} disabled={passwordBaru === konfirmasiPassword ? false : true} style={tw`w-full flex flex-row items-center justify-center gap-1 px-6 py-4 ${passwordChange === true && passwordBaru === konfirmasiPassword ? 'bg-green-600' : 'bg-gray-400'} rounded-full shadow-xl shadow-black/30`}>
            <Text style={tw`text-center font-bold text-base text-white`}>Ganti Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default UpdateProfileScreen