import React, { useEffect, useState } from 'react'

import { 
  View, 
  Text,
  Platform, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native'

import { useNavigation } from '@react-navigation/native';
import { DbResult, supabase } from "../lib/supabase";

import AsyncStorage from "@react-native-async-storage/async-storage";

import tw from 'twrnc'

import * as Solid from 'react-native-heroicons/solid'
import VersionCheck from 'react-native-version-check';

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

const ProfileScreen = (props: Props) => {
  const navigation = useNavigation<any>()

  const [refreshing, setRefreshing] = useState(false);
  const [TPS, setTPS] = useState<number | null>(null)
  const [OperatorID, setOperatorID] = useState<number | null>(null)
  const [profileData, setProfileData] = useState<any>([])
  const [TPSData, setTPSData] = useState<any>([])

  const getStorage = async () => {
    const retreiveTPS = await retrieveNumber('TPS');
    const retreiveOperatorID = await retrieveNumber('OperatorID')

    const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
    const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;

    setTPS(TPS)
    setOperatorID(OperatorID)
  }

  const getProfile = async () => {
    const check = supabase
      .from("tbl_operator")
      .select()
      .eq("id", `${OperatorID}`)
    const response = await check;
    
    setRefreshing(false);
    setProfileData(response.data)
  }

  const getTPSData = async () => {
    const check = supabase
      .from("tbl_tps")
      .select()
      .eq("id", `${TPS}`)
    const response = await check;

    setRefreshing(false)
    setTPSData(response.data)
  }

  useEffect(() => {
    getStorage()
  }, [])
  
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getProfile(), getTPSData()]);
    };

    fetchData()
  }, [])

  const [version, setVersion] = useState<any>()

  const checkUpdateNeeded = async () => {
    let updateNeeded = await VersionCheck.needUpdate();
    setVersion(updateNeeded.latestVersion)
  }

  useEffect(() => {
    checkUpdateNeeded()
  }, [])

  return (
    <SafeAreaView
      style={tw`flex-1 bg-white`}
    >
      <View style={tw`flex flex-col px-4 pt-16 pb-4`}>
        <Text style={[tw`text-green-600 text-3xl font-bold`]}>Profile</Text>
        <Text style={[tw`text-gray-500 text-base`]}>Data dan setting aplikasi.</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              getProfile()
              getTPSData()
            }}
            title="Tarik untuk Refresh"
            titleColor="#555"
            tintColor="#555"
          />
        }
      >
        <View style={tw`flex-1 w-full px-4 ${ Platform.OS === "android" ? 'pt-10 pb-26' : 'pt-16 pb-26' }`}>
          <View style={tw`w-full flex flex-col px-4 py-4 border border-gray-100 rounded-xl bg-gray-50`}>
            <Text style={tw`font-bold text-gray-300`}>Data User</Text>
            {
              profileData ? profileData.map((item: any, index: any) => (
                <View key={index} style={tw`flex-1 flex-col gap-1.5`}>
                  <Text style={tw`font-bold text-base text-gray-800`}>{item.fullname}</Text>
                  <Text style={tw`text-sm text-gray-400`}>{item.email}</Text>
                  <Text style={tw`text-sm text-gray-400`}>{item.phoneNumber}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('UpdateProfile', {
                    id: item.id,
                    name: item.fullname,
                    email: item.email,
                    phone: item.phoneNumber,
                    password: item.password
                  })} style={tw`absolute bottom-0 right-0 px-2.5 py-1.5 bg-white rounded-lg border border-gray-300`}>
                    <Text style={tw`text-gray-900 text-xs`}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>)
              ) : (<></>)
            }

            <View style={tw`w-full flex h-0.4 rounded-full bg-gray-400 my-6`} />

            <Text style={tw`font-bold text-gray-300`}>Data TSS/TKS</Text>
            {
              TPSData ? TPSData.map((item: any, index: any) => (
                <View key={index} style={tw`flex-1 flex-col gap-1.5`}>
                  <Text style={tw`font-bold text-base text-gray-800`}>{item.nama_tps}</Text>
                  <Text style={tw`text-sm text-gray-400`}>{item.nama_subsektor}</Text>
                  <Text style={tw`text-sm text-gray-400`}>{item.alamat}</Text>
                  <TouchableOpacity onPress={() => 
                    navigation.navigate('UpdateCollection', {
                      id: item.id,
                      subsektor_id: item.subsektor_id,
                      name: item.nama_tps,
                      alamat: item.alamat,
                      photo: item.foto
                    })
                  } style={tw`absolute bottom-0 right-0 px-2.5 py-1.5 bg-white rounded-lg border border-gray-300`}>
                    <Text style={tw`text-gray-900 text-xs`}>Edit TSS/TKS</Text>
                  </TouchableOpacity>
                </View>)
              ) : (<></>)
            }
            </View>

            <View style={tw`w-full flex flex-col mt-12`}>
            {TPSData &&
              TPSData.map((item: any, index: any) => {
                return item.subsektor_id !== null ? (
                  <View
                    key={index}
                    style={tw`flex flex-row px-4 py-4 items-center gap-2 bg-green-100 rounded-xl border-2 border-green-600`}
                  >
                    <Solid.CheckCircleIcon style={tw`text-green-600`} />
                    <Text style={tw`text-green-600 font-medium`}>
                      Data TSS/TKS Kamu Sudah Lengkap
                    </Text>
                  </View>
                ) : (
                  <View
                    key={index}
                    style={tw`flex flex-row px-4 py-4 items-center gap-2 bg-red-100 rounded-xl border-2 border-red-600`}
                  >
                    <Solid.XCircleIcon style={tw`text-red-600`} />
                    <Text style={tw`text-red-600 font-medium`}>
                      Lengkapi Data TSS/TKS, di Bagian Sektor!
                    </Text>
                  </View>
                );
              })}
          </View>

          <View style={tw`w-full flex flex-col mt-12`}>
            <Text style={tw`text-sm text-gray-700 mb-4`}>Account</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MapScreen')} style={tw`flex flex-row px-4 py-4 border-b border-gray-200 items-center justify-between`}>
              <View style={tw`flex flex-row gap-4 items-center`}>
                <Solid.MapIcon size={24} style={tw`text-gray-800`} />
                <Text style={tw`text-base font-medium text-gray-800`}>Titik Kordinat</Text>
              </View>
              <Solid.ChevronRightIcon size={24} style={tw`text-green-950`} />
            </TouchableOpacity>
            {/* <View style={tw`flex flex-row px-4 py-4 border-b border-gray-200 items-center justify-between`}>
              <View style={tw`flex flex-row gap-4 items-center`}>
                <Solid.BellIcon size={24} style={tw`text-gray-800`} />
                <Text style={tw`text-base font-medium text-gray-800`}>Notifikasi</Text>
              </View>
              <Solid.ChevronRightIcon size={24} style={tw`text-green-950`} />
            </View>
            <View style={tw`flex flex-row px-4 py-4 border-b border-gray-200 items-center justify-between`}>
              <View style={tw`flex flex-row gap-4 items-center`}>
                <Solid.ShieldExclamationIcon size={24} style={tw`text-gray-800`} />
                <Text style={tw`text-base font-medium text-gray-800`}>Keamanan Akun</Text>
              </View>
              <Solid.ChevronRightIcon size={24} style={tw`text-green-950`} />
            </View> */}
            <TouchableOpacity onPress={() => navigation.navigate('ManageAccount' as never)} style={tw`flex flex-row px-4 py-4 border-b border-gray-200 items-center justify-between`}>
              <View style={tw`flex flex-row gap-4 items-center`}>
                <Solid.Cog6ToothIcon size={24} style={tw`text-gray-800`} />
                <Text style={tw`text-base font-medium text-gray-800`}>Pengaturan Akun</Text>
              </View>
              <Solid.ChevronRightIcon size={24} style={tw`text-green-950`} />
            </TouchableOpacity>
          </View>

          <View style={tw`w-full flex flex-col mt-12`}>
            <Text style={tw`text-sm text-gray-700 mb-4`}>General</Text>
            <View style={tw`flex flex-row px-4 py-4 border-b border-gray-200 items-center justify-between`}>
              <View style={tw`flex flex-row gap-4 items-center`}>
                <Solid.ShieldExclamationIcon size={24} style={tw`text-gray-800`} />
                <Text style={tw`text-base font-medium text-gray-800`}>Kebijakan Privasi</Text>
              </View>
              <Solid.ChevronRightIcon size={24} style={tw`text-green-950`} />
            </View>
            <View style={tw`flex flex-row px-4 py-4 border-b border-gray-200 items-center justify-between`}>
              <View style={tw`flex flex-row gap-4 items-center`}>
                <Solid.ClipboardDocumentListIcon size={24} style={tw`text-gray-800`} />
                <Text style={tw`text-base font-medium text-gray-800`}>Ketentuan Layanan</Text>
              </View>
              <Solid.ChevronRightIcon size={24} style={tw`text-green-950`} />
            </View>
            <View style={tw`flex flex-row px-4 py-4 border-b border-gray-200 items-center justify-between`}>
              <View style={tw`flex flex-row gap-4 items-center`}>
                <Solid.MapPinIcon size={24} style={tw`text-gray-800`} />
                <Text style={tw`text-base font-medium text-gray-800`}>Atribusi Data</Text>
              </View>
              <Solid.ChevronRightIcon size={24} style={tw`text-green-950`} />
            </View>
            <View style={tw`flex flex-row px-4 py-4 border-b border-gray-200 items-center justify-between`}>
              <View style={tw`flex flex-row gap-4 items-center`}>
                <Solid.StarIcon size={24} style={tw`text-gray-800`} />
                <Text style={tw`text-base font-medium text-gray-800`}>Bandung Waste Management App</Text>
              </View>
              <Text style={tw`text-base font-medium text-gray-500`}>{version}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen