import React, { useCallback, useEffect, useState } from "react";

import { 
  Image, 
  ScrollView,
  Platform, 
  SafeAreaView,
  Dimensions, 
  useColorScheme,
  View,
  Text,
  Pressable,
  BackHandler,
  Alert,
  RefreshControl,
  Linking, 
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { DbResult, supabase } from "../lib/supabase";

import StatusBarPercentage from "../components/ProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Permissions, { PERMISSIONS } from 'react-native-permissions';

import tw from 'twrnc'
import moment from 'moment-timezone';
import 'moment/locale/id';

import * as Solid from 'react-native-heroicons/solid'
import Skeleton from "../components/Skeleton"
import LinearGradient from "react-native-linear-gradient";
import { useDispatch } from "react-redux";
import VersionCheck from "react-native-version-check";

type Props = {}

async function retrieveNumber(key: string) {
  try {
    const value = await AsyncStorage.getItem(key)
    if (value !== null) {
      return parseInt(value, 10)
    }
    return null
  } catch (error) {
    console.error(`Error retrieving ${key}: ${error}`)
    return null
  }
}

const HomeScreen = (props: Props) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const openSettingsAlert = useCallback(({title}: {title: string}) => {
    Alert.alert(title, '', [
      {
        isPreferred: true,
        style: 'default',
        text: 'Open Settings',
        onPress: () => Linking?.openSettings(),
      },
    ],{cancelable: false});
  }, []);

  const checkAndroidPermissions = useCallback(async () => {
    if (parseInt(Platform.Version as string, 10) >= 33) {
      const permissions = await Permissions.checkMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      ]);
      if (
        permissions[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
          Permissions.RESULTS.GRANTED &&
        permissions[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] ===
          Permissions.RESULTS.GRANTED
      ) {
        setHasPermission(true);
        return;
      }
      const res = await Permissions.requestMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      ]);
      if (
        res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
          Permissions.RESULTS.GRANTED &&
        res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] ===
          Permissions.RESULTS.GRANTED
      ) {
        setHasPermission(true);
      }
      if (
        res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
          Permissions.RESULTS.DENIED ||
        res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === Permissions.RESULTS.DENIED
      ) {
        checkAndroidPermissions();
      }
      if (
        res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
          Permissions.RESULTS.BLOCKED ||
        res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] ===
          Permissions.RESULTS.BLOCKED
      ) {
        openSettingsAlert({
          title: 'Izinkan akses galeri hp anda di settings',
        });
      }
    } else {
      const permission = await Permissions.check(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );
      if (permission === Permissions.RESULTS.GRANTED) {
        setHasPermission(true);        
        return;
      }
      const res = await Permissions.request(
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );
      if (res === Permissions.RESULTS.GRANTED) {
        setHasPermission(true);
      }
      if (res === Permissions.RESULTS.DENIED) {
        checkAndroidPermissions();
      }
      if (res === Permissions.RESULTS.BLOCKED) {
        openSettingsAlert({
          title: 'Izinkan akses galeri hp anda di settings',
        });
      }
    }
  }, [openSettingsAlert]);

  const checkPermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      const permission = await Permissions.check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (permission === Permissions.RESULTS.GRANTED ||
          permission === Permissions.RESULTS.LIMITED) {
        setHasPermission(true);
        return;
      }
      const res = await Permissions.request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (res === Permissions.RESULTS.GRANTED ||
          res === Permissions.RESULTS.LIMITED) {
        setHasPermission(true);
      }
      if (res === Permissions.RESULTS.BLOCKED) {
        openSettingsAlert({
          title: 'Izinkan akses galeri hp anda di settings',
        });
      }
    } else if (Platform.OS === 'android') {
      checkAndroidPermissions();
    }
  }, [checkAndroidPermissions, openSettingsAlert]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);
  
  const navigation = useNavigation<any>()

  const [refreshing, setRefreshing] = useState(false);

  const { width } = Dimensions.get('window')

  const responsiveWidth = width * 0.8
  const columnWidth = width / 5

  const colorScheme = useColorScheme()
  const backgroundColor = colorScheme === 'dark' ? 'bg-blue-950' : 'bg-blue-200'

  const currentLocalizedDate = moment()
  const formattedDate = currentLocalizedDate.format('LL')

  const handleBackButton = () => {
    // Prevent the default back button behavior (e.g., navigating back)
    return true; // Return true to indicate that you've handled the back button
  };

  useEffect(() => {
    // Add an event listener for the back button press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  
    // Clean up the event listener when the component unmounts
    return () => {
      backHandler.remove();
    };
  }, []);

  const [kelolaSampah, setKelolaSampah] = useState<any>([])
  const [olahSampah, setOlahSampah] = useState<any>([])
  const [transferedSampah, setTransferedSampah] = useState<any>([])
  const [profileData, setProfileData] = useState<any>([])

  const [loadSkeleton, setLoadSkeleton] = useState<boolean>(false)

  const getTotalSampah = async (TPS: any, OperatorID: any) => {
    const check = supabase
      .from("tbl_kelola")
      .select()
      .eq("tpsId", `${TPS}`)
      .eq("status", 'Approved')
    const response = await check;
    
    return response.data
  }

  const getTransferedSampah = async (TPS: any, OperatorID: any) => {
    const check = supabase
      .from("tbl_kelola")
      .select()
      .eq("tpsId", `${TPS}`)
      .eq("status", 'Transfered')
    const response = await check;
    
    return response.data
  }

  const getOlahSampah = async (TPS: any, OperatorID: any) => {
    const check = supabase
      .from("tbl_olah")
      .select()
      .eq("tpsId", `${TPS}`)
    const response = await check;
    
    return response.data
  }

  const getProfile = async (TPS: any, OperatorID: any) => {
    const check = supabase
      .from("tbl_operator")
      .select()
      .eq("id", `${OperatorID}`)
    const response = await check;
    
    return response.data
  }

  const getRequestData = async (TPS: any, OperatorID: any) => {
    const check = supabase
      .from(`tbl_olah`)
      .select(`id, created_at, tpsId, tbl_tps(nama_tps), total, jenis, klasifikasi, keterangan, evidence, source, destination, status_transfer`)
      .eq("destination", `${TPS}`).eq("status_transfer", 'Pending')
      .order("created_at", { ascending: false })
    const response = await check

    const totalRequest = (response.data?.length ?? 0);
    return totalRequest
  }

  const dispatch = useDispatch()

  const prom = async () => {
    const TPS = await retrieveNumber('TPS');
    const OperatorID = await retrieveNumber('OperatorID')

    setLoadSkeleton(true)
    Promise.all([
      getProfile(TPS, OperatorID), 
      getTotalSampah(TPS, OperatorID), 
      getOlahSampah(TPS, OperatorID), 
      getTransferedSampah(TPS, OperatorID), 
      getRequestData(TPS, OperatorID)
    ])
      .then(([profileData, totalSampah, olahSampah, transferedSampah, requestData]) => {
        setProfileData(profileData)
        setKelolaSampah(totalSampah)
        setOlahSampah(olahSampah)
        setTransferedSampah(transferedSampah)

        dispatch({ type: 'SAVE_REQUESTTOTAL', payload: requestData });

        setLoadSkeleton(false)
        setRefreshing(false);
      })
      .catch((error) => {
        console.error('An error occurred:', error);
        setLoadSkeleton(false)
        setRefreshing(false);
      });
  }

  useEffect(() => {
    const Kelola = supabase.channel('KelolaChannel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tbl_kelola' },
        async (payload) => {
          const TPS = await retrieveNumber('TPS');
          if (payload.eventType === 'INSERT' && payload.new.tpsId === TPS) {
            prom()
          }
          if (payload.eventType === 'UPDATE' && payload.new.tpsId === TPS) {
            prom()
          }
          if (payload.eventType === 'DELETE') {
            prom()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tbl_olah' },
        async (payload) => {
          const TPS = await retrieveNumber('TPS');
          if (payload.eventType === 'INSERT' && payload.new.tpsId === TPS) {
            prom()
          }
          if (payload.eventType === 'UPDATE' && payload.new.tpsId === TPS) {
            prom()
          }
          if (payload.eventType === 'DELETE') {
            prom()
          }
          if (payload.eventType === 'INSERT' && payload.new.destination === TPS) {
            prom()
          }
          if (payload.eventType === 'UPDATE' && payload.new.destination === TPS) {
            prom()
          }
          if (payload.eventType === 'DELETE') {
            prom()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tbl_operator_tps' },
        async (payload) => {
          const TPS = await retrieveNumber('TPS');
          if (payload.eventType === 'INSERT' && payload.new.tpsId === TPS) {
            prom()
          }
          if (payload.eventType === 'UPDATE' && payload.new.tpsId === TPS) {
            prom()
          }
          if (payload.eventType === 'DELETE') {
            prom()
          }
        }
      )
      .subscribe()

    return (() => {
      Kelola.unsubscribe()
    })
  }, [])

  useEffect(() => {
    prom()
  }, []);

  const totalSampah = kelolaSampah && kelolaSampah.reduce((total: any, item: any) => total + parseFloat(item.volume), 0)
  const transferSampah = transferedSampah && transferedSampah.reduce((total: any, item: any) => total + parseFloat(item.volume), 0)

  const fixedTotal = (totalSampah).toFixed(1) - (transferSampah).toFixed(1)

  const olahanSampah = olahSampah && olahSampah.reduce((total: number, item: any) => {
    if (item.klasifikasi != "Kirim ke TPS") {
      return total + parseFloat(item.total);
    }
    return total;
  }, 0);

  const groupedData = olahSampah
  ? olahSampah.reduce((result: any, item: any) => {
      const existingItem = result.find((group: any) => group.klasifikasi === item.klasifikasi);
      if (existingItem) {
        existingItem.total += item.total;
      } else {
        result.push({ klasifikasi: item.klasifikasi, total: item.total });
      }
      return result;
    }, [])
  : [];

  const groupedDaurUlang = olahSampah
  ? olahSampah.reduce((result: any, item: any) => {
      const existingItem = result.find((group: any) => group.keterangan === item.keterangan);
      if (existingItem) {
        existingItem.total += item.total;
      } else {
        result.push({ keterangan: item.keterangan, total: item.total });
      }
      return result;
    }, [])
  : [];

  const groupedAndSummedData = olahSampah
  ? olahSampah.reduce((result: any, item: any) => {
      const existingItem = result.find((group: any) => group.jenis === item.jenis);
      if (existingItem) {
        existingItem.total += item.total;
      } else {
        result.push({ jenis: item.jenis, total: item.total });
      }
      return result;
    }, [])
  : [];

  const checkUpdateNeeded = async () => {
    let updateNeeded = await VersionCheck.needUpdate();
    if (updateNeeded && updateNeeded.isNeeded) {
        Alert.alert('Ada update', 'Ada aplikasi versi terbaru update dulu yuk!',
        [
          {
            text: 'Update',
            onPress: () => {
              BackHandler.exitApp();
              Linking.openURL(updateNeeded.storeUrl)
            }
          }
        ],
        {cancelable: false}
        )
    }
  }

  useEffect(() => {
    checkUpdateNeeded();
  }, []);

  return (
    <SafeAreaView
      style={tw`flex-1`}
    >
    <LinearGradient
      colors={['#374151', '#111827']} // Set your gradient colors here
      start={{ x: 0, y: 0.5 }} // Adjust start point as needed
      end={{ x: 1, y: 0.5 }} // Adjust end point as needed
      style={tw`flex-1`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              prom()
            }}
            title="Tarik untuk Refresh"
            titleColor="#555"
            tintColor="#555"
          />
        }
      >
        <View style={tw`bg-transparent w-full ${ Platform.OS === "android" ? 'pt-10' : 'pt-0' }`}>
          <View style={[tw`z-10 w-full h-${responsiveWidth * 0.30} bg-transparent items-center`]}>
            <View style={tw`absolute -z-10 w-full py-8`}>
              <View style={tw`px-4`}>
                <View style={tw`bg-white shadow-xl flex px-4 py-4 flex-col rounded-3xl`}>
                  {
                    profileData ? profileData.map((item: any) => (
                      <View key={1} style={tw`flex flex-col px-4 py-4`}>
                        <Text style={tw`text-sm text-gray-950`}>Wilujeng Sumping,</Text>
                        <Text style={tw`font-bold text-gray-950`}>{item.fullname}</Text>
                      </View>
                    )) : (<></>)
                  }
                  <View style={tw`bg-transparent mt-4`}>
                    <View style={tw`bg-transparent w-full flex flex-row items-center justify-center border border-gray-300 rounded-xl`}>
                      <Pressable onPress={() => navigation.navigate('Sorting')} style={tw`bg-white w-full flex-1 flex-col items-center px-2 py-2 rounded-l-xl`}>
                        <Solid.TrashIcon style={tw`text-green-600`} />
                        <Text style={tw`text-xs text-center text-gray-900 font-bold`}>Sampah Masuk</Text>
                      </Pressable>
                      <View style={tw`h-full w-0.4 bg-gray-200`} />
                      <Pressable onPress={() => navigation.navigate('Processing')} style={tw`bg-white w-full flex-1 flex-col items-center px-2 py-2 rounded-r-xl`}>
                        <Solid.ArchiveBoxIcon style={tw`text-green-600`} />
                        <Text style={tw`text-xs text-center text-gray-900 font-bold`}>Olah Sampah</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
              <ScrollView
                horizontal
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <View style={tw`flex-1 flex-row items-center pb-4 mx-4 gap-4 mt-4`}>
                  <LinearGradient
                    colors={['#fafafa', '#f3f4f6']} // Set your gradient colors here
                    start={{ x: 0, y: 0.5 }} // Adjust start point as needed
                    end={{ x: 1, y: 0.5 }} // Adjust end point as needed
                    style={tw`bg-white px-4 py-8 shadow-xl rounded-2xl w-44 flex flex-col items-center`}
                  >
                    {kelolaSampah && (
                      <View style={tw`flex-1 flex-row`}>
                        <Text style={tw`font-bold text-gray-700 text-3xl`}>{(fixedTotal).toFixed(1)}</Text>
                        <Text style={tw`text-gray-700 text-xs`}>(Kg)</Text>
                      </View>
                    )}
                    <Text style={tw`text-gray-700 font-bold`}>SAMPAH MASUK</Text>
                  </LinearGradient>
                  <LinearGradient
                    colors={['#22c55e', '#15803d']} // Set your gradient colors here
                    start={{ x: 0, y: 0.5 }} // Adjust start point as needed
                    end={{ x: 1, y: 0.5 }} // Adjust end point as needed
                    style={tw`bg-white px-4 py-8 shadow-xl rounded-2xl w-44 flex flex-col items-center`}
                  >
                    {kelolaSampah && (
                      <View style={tw`flex-1 flex-row`}>
                        <Text style={tw`font-bold text-white text-3xl`}>{(olahanSampah).toFixed(1)}</Text>
                        <Text style={tw`text-white text-xs`}>(Kg)</Text>
                      </View>
                    )}
                    <Text style={tw`text-white font-bold`}>SAMPAH DIOLAH</Text>
                  </LinearGradient>
                  <LinearGradient
                    colors={['#fbbf24', '#f59e0b']} // Set your gradient colors here
                    start={{ x: 0, y: 0.5 }} // Adjust start point as needed
                    end={{ x: 1, y: 0.5 }} // Adjust end point as needed
                    style={tw`bg-white px-4 py-8 shadow-xl rounded-2xl w-44 flex flex-col items-center`}
                  >
                    {kelolaSampah && (
                      <View style={tw`flex-1 flex-row`}>
                        <Text style={tw`font-bold text-white text-3xl`}>{(fixedTotal-olahanSampah).toFixed(1)}</Text>
                        <Text style={tw`text-white text-xs`}>(Kg)</Text>
                      </View>
                    )}
                    <Text style={tw`text-white font-bold`}>SISA SAMPAH</Text>
                  </LinearGradient>
                </View>
              </ScrollView>
            </View>
          </View>
          <View style={tw`z-50 bg-white h-full rounded-t-3xl px-2 py-6 gap-4 -top-4`}>
            {/* Widget untuk button kelola dan olah sampah */}
            <View style={tw`w-full flex flex-col py-4`}>
              {
                (
                  <View style={tw`w-full flex flex-col justify-between py-4 gap-2`}>
                    <View style={tw`bg-transparent px-4`}>
                      <View style={tw`bg-red-500 px-4 py-4 shadow-xl shadow-blue-600/30 rounded-xl flex flex-col`}>
                        <View style={tw`flex flex-row items-center justify-between`}>
                          <View style={tw`flex-1 flex-col`}>
                            <Text style={tw`text-white font-bold`}>SAMPAH DI KIRIM / TRANSFER</Text>
                            <Text style={tw`text-xs text-white`}>Sampah masuk yang kemudian di kirim ke afiliasi KBS/TPS</Text>
                          </View>
                          {olahSampah && (
                            <View style={tw`flex-1 flex-row justify-end`}>
                              <Text style={tw`font-bold text-white text-5xl`}>{(transferSampah).toFixed(1)}</Text>
                              <Text style={tw`text-white text-xs`}>(Kg)</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )
              }
            </View>
            <View style={tw`bg-white w-full px-4 py-6 rounded-3xl shadow-xl shadow-blue-600/30`}>
              <View style={tw`flex`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>Jenis Sampah</Text>
              </View>
              <View style={tw`flex flex-col justify-between items-center gap-6 mt-4`}>
                {
                loadSkeleton ? (
                  <View style={tw`w-full flex flex-col justify-between gap-2`}>
                    <Skeleton width={'w-full'} height={'h-5'} />
                    <Skeleton width={'w-full'} height={'h-5'} />
                    <Skeleton width={'w-full'} height={'h-5'} />
                  </View>
                ) : groupedAndSummedData.length > 0 ? (
                  groupedAndSummedData.map((item: any, index: any) => (
                    <View key={index + 1} style={tw`w-full flex flex-col justify-between gap-2`}>
                      <View style={tw`flex flex-row justify-between`}>
                        <Text style={tw`text-gray-800 font-bold`}>{item.jenis}</Text>
                        <Text style={tw`text-sm text-gray-800`}>
                          <Text style={tw`font-bold text-base`}>{(item.total).toFixed(1)}</Text> {`(Kg)`}
                        </Text>
                      </View>
                      <StatusBarPercentage color={item.jenis == 'Organik' ? 'bg-green-600' : item.jenis == 'Anorganik' ? 'bg-yellow-500' : 'bg-red-600'} percentage={(item.total / totalSampah) * 100} />
                    </View>
                  ))
                ) : (
                  <Text style={tw`w-full flex items-center py-8 text-gray-900 text-center py-4 px-2 rounded-xl border border-gray-200`}>
                    Belum ada data.
                  </Text>
                )}
              </View>
            </View>
            <View style={tw`bg-white w-full px-4 py-6 rounded-3xl shadow-xl shadow-blue-600/30`}>
              <View style={tw`flex`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>Hasil Pengolahan</Text>
              </View>
              <View style={tw`flex flex-row justify-between items-center gap-6 mt-4`}>
                {
                loadSkeleton ? (
                  <View style={tw`flex flex-row justify-between gap-4`}>
                    <Skeleton width={'flex-1'} height={'h-5'} />
                    <Skeleton width={'flex-1'} height={'h-5'} />
                  </View>
                ) : groupedData.length > 0 ? (
                  groupedData.map((item: any, index: any) => (
                    <View key={index + 1} style={tw`flex-1 flex-col justify-between gap-2`}>
                      <View style={tw`flex flex-row justify-between`}>
                        <Text style={tw`text-gray-800 font-bold`}>{item.klasifikasi === 'Kirim ke TPS' ? 'Kirim / Transfer' : 'Daur Ulang'}</Text>
                        <Text style={tw`text-sm text-gray-800`}>
                          <Text style={tw`font-bold text-base`}>{(item.total).toFixed(1)}</Text> {`(Kg)`}
                        </Text>
                      </View>
                      <StatusBarPercentage color={item.klasifikasi === 'Kirim ke TPS' ? 'bg-red-600' : 'bg-green-600'} percentage={(item.total / totalSampah) * 100} />
                    </View>
                  ))
                ) : (
                  <Text style={tw`w-full flex items-center py-8 text-gray-900 text-center py-4 px-2 rounded-xl border border-gray-200`}>
                    Belum ada data.
                  </Text>
                )}
              </View>
            </View>
            <View style={tw`bg-white w-full px-4 py-6 rounded-3xl shadow-xl shadow-blue-600/30`}>
              <View style={tw`flex`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>Daur Ulang Sampah</Text>
              </View>
              <View style={tw`flex flex-col justify-between items-center gap-6 mt-4`}>
                {
                loadSkeleton ? (
                  <View style={tw`w-full flex flex-col justify-between gap-2`}>
                    <Skeleton width={'w-full'} height={'h-5'} />
                    <Skeleton width={'w-full'} height={'h-5'} />
                    <Skeleton width={'w-full'} height={'h-5'} />
                  </View>
                ) : groupedDaurUlang.length > 0 ? (
                  groupedDaurUlang
                  .filter((item: any) => item.keterangan !== 'Buang' && item.keterangan !== 'Kirim ke TPS')
                  .map((item: any, index: any) => (
                    <View key={index + 1} style={tw`w-full flex flex-col justify-between gap-2`}>
                      <View style={tw`flex flex-row justify-between`}>
                        <Text style={tw`text-gray-800 font-bold`}>{item.keterangan}</Text>
                        <Text style={tw`text-sm text-gray-800`}>
                          <Text style={tw`font-bold text-base`}>{(item.total).toFixed(1)}</Text> {`(Kg)`}
                        </Text>
                      </View>
                      <StatusBarPercentage color={'bg-green-600'} percentage={(item.total / totalSampah) * 100} />
                    </View>
                  ))
                ) : (
                  <Text style={tw`w-full flex items-center py-8 text-gray-900 text-center py-4 px-2 rounded-xl border border-gray-200`}>
                    Belum ada data.
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default HomeScreen