import React, { 
  useCallback, 
  useEffect, 
  useMemo, 
  useRef, 
  useState 
} from 'react'

import { 
  View, 
  Text, 
  Pressable, 
  VirtualizedList, 
  Platform, 
  RefreshControl, 
  Modal, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
} from 'react-native'

import BottomSheet, { 
  BottomSheetScrollView, 
  BottomSheetBackdrop 
} from "@gorhom/bottom-sheet";

import { DbResult, supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

import tw from 'twrnc'
import moment from 'moment-timezone';
import 'moment/locale/id';

import * as Outline from 'react-native-heroicons/outline'
import * as Solid from 'react-native-heroicons/solid'
import Skeleton from '../components/Skeleton';
import { useNavigation } from '@react-navigation/native';

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

const RequestScreen = (props: Props) => {
  const navigation = useNavigation<any>()

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>([]);

  const [selectFilter, setSelectFilter] = useState<string>('')

  const [selectTipe, setSelectTipe] = useState<string>('Pengolahan Sampah')
  const [selectJenis, setSelectJenis] = useState<string>('Semua Jenis')
  const [selectKlasifikasi, setSelectKlasifikasi] = useState<string>('Semua Klasifikasi')

  const getOlahSampah = async () => {
    setIsLoading(true);
    const retreiveTPS = await retrieveNumber('TPS');
    const retreiveOperatorID = await retrieveNumber('OperatorID')

    const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
    const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;
    
    const check = supabase
      .from(`tbl_olah`)
      .select(`id, created_at, tpsId, tbl_tps(nama_tps), total, jenis, klasifikasi, keterangan, evidence, source, destination, status_transfer`)
      .eq("destination", `${TPS}`).eq("status_transfer", 'Pending')
      .order("created_at", { ascending: false })
    const response = await check
    
    if (response.data !== null) {
      const newData = response.data.map((item: any, index: any) => ({
        key: String(index),
        id: item.id,
        tps: item.tpsId,
        nama_tps: item.tbl_tps.nama_tps,
        operator: item.operatorId,
        evidence: item.evidence,
        source: item.source,
        date: item.created_at,
        totalSampah: `${item.total}`,
        jenisSampah: `${item.jenis}`,
        klasifikasi: `${item.klasifikasi}`,
        keterangan: item.keterangan,
        status: item.status_transfer
      }))

      newData.sort((a, b) => a.date - b.date);

      setData(newData);
      setRefreshing(false);
      setIsLoading(false);
    }
  }

  const [filteredData, setFilteredData] = useState<any>(data);

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const [message, setMessage] = useState<string | null>(null)

  const applyFilters = () => {
    const filtered = data.filter((item: any) => {
      // Check if the item matches selected filters
      const jenisMatch = !selectJenis || selectJenis === 'Semua Jenis' || item.jenisSampah === selectJenis;
      const klasifikasiMatch = !selectKlasifikasi || selectKlasifikasi === 'Semua Klasifikasi' || item.klasifikasiPengolahan === selectKlasifikasi;
      return jenisMatch && klasifikasiMatch;
    });
    setFilteredData(filtered);
  };  

  useEffect(() => {
    applyFilters();
  }, [selectJenis, selectKlasifikasi, data]);

  const handleTerima = async (item: any) => {
    setModalVisible(true)
    setLoading(true)

    try {
      const retreiveTPS = await retrieveNumber('TPS');
      const retreiveOperatorID = await retrieveNumber('OperatorID')
  
      const TPS = retreiveTPS ? JSON.parse(retreiveTPS) : null;
      const OperatorID = retreiveOperatorID ? JSON.parse(retreiveOperatorID) : null;

      // insert data untuk yang menerima request
      const submit = await supabase
        .from("tbl_kelola")
        .insert({
          volume: item.totalSampah,
          tipe: 'Terpilah',
          operatorId: OperatorID,
          tpsId: TPS,
          evidence: item.evidence,
          jenis: item.jenisSampah,
          status: 'Approved'
        })
      
      const response = submit.error;
      if (response == null) {
        setMessage(null)

        // insert data untuk data transferd dari pemohon
        await supabase
        .from("tbl_kelola")
        .insert({
          tipe: 'Terpilah',
          tpsId: item.tps,
          operatorId: OperatorID,
          status: 'Transfered',
          volume: item.totalSampah,
          evidence: item.evidence,
          jenis: item.jenisSampah,
        })
        .eq("id", item.source)

      await supabase
        .from("tbl_olah")
        .update({
          status_transfer: 'Accepted'
        }).
        eq("id", item.id)

      } else {
        setMessage('Sepertinya ada kendala di server.')
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTolak = async (item: any) => {
    setModalVisible(true)
    setLoading(true)

    try{
      const submit = await supabase
        .from("tbl_olah")
        .update({
          status_transfer: 'Declined'
        })
        .eq("id", item.id)
      
      const response = submit.error;
      if (response == null) {
        setMessage(null)
      } else {
        setMessage('Sepertinya ada kendala di server.')
      }
    } catch(e: any) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  const sheetRef = useRef<BottomSheet>(null);

  const filterTipe = ['Sampah Masuk', 'Pengolahan Sampah']
  const filterJenis = ['Semua Jenis', 'Organik', 'Anorganik', 'Residu']
  const filterKlasifikasi = ['Semua Klasifikasi', 'Daur Ulang', 'Kirim ke TPS']

  const snapPoints = useMemo(() => ["55%"], []);

  const handleSnapPress = useCallback((index: any, filter: any) => {
    setSelectFilter(filter)
    sheetRef.current?.snapToIndex(index)
  }, []);

  const handleFilterSelected = (item: any) => {
    selectFilter == "tipe" ? setSelectTipe(item) : selectFilter == "jenis" ? setSelectJenis(item) : setSelectKlasifikasi(item)
  }

  const handleFilterClear = () => {
    setSelectTipe('Pengolahan Sampah')
    setSelectJenis('Semua Jenis')
    setSelectKlasifikasi('Semua Klasifikasi')
  }

  useEffect(() => {
    getOlahSampah()
    setSelectJenis('Semua Jenis')
    setSelectKlasifikasi('Semua Klasifikasi')
  }, [selectTipe])

  useEffect(() => {
    const Kelola = supabase.channel('RequestChannel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tbl_kelola' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            getOlahSampah()
          }
          if (payload.eventType === 'UPDATE') {
            getOlahSampah()
          }
          if (payload.eventType === 'DELETE') {
            getOlahSampah()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tbl_olah' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            getOlahSampah()
          }
          if (payload.eventType === 'UPDATE') {
            getOlahSampah()
          }
          if (payload.eventType === 'DELETE') {
            getOlahSampah()
          }
        }
      )
      .subscribe()

    return (() => {
      Kelola.unsubscribe()
    })
  }, [])

  const renderFilterItem = useCallback(
    (item: any) => (
      <Pressable
        key={item}
        onPress={() => handleFilterSelected(item)}
        style={tw`w-full flex flex-row items-center justify-between py-2 my-2 px-4 border-b border-gray-200 rounded-lg`}
      >
        <Text style={tw`text-lg text-gray-800`}>{item}</Text>
        {selectJenis === item && (
          <Solid.CheckCircleIcon size={26} style={tw`text-green-600`} />
        )}
        {selectKlasifikasi === item && (
          <Solid.CheckCircleIcon size={26} style={tw`text-green-600`} />
        )}
        {selectTipe === item && (
          <Solid.CheckCircleIcon size={26} style={tw`text-green-600`} />
        )}
      </Pressable>
    ),
    [selectJenis, selectKlasifikasi, handleFilterSelected]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const groupedData: any = {};

  data.forEach((item: any) => {
    const date = item.date.split("T")[0]
    if (!groupedData[date]) {
      groupedData[date] = []
    }
    groupedData[date].push(item)
  });

  const renderItem = ({ item }: any) => {
    const dateObject = moment(item.date)

    // Extract date and time components
    const formattedDate = dateObject.format('LL');
    const formattedTime = dateObject.format('LT');
    
    return(
      <View style={tw`border border-gray-200 rounded-xl mb-4`}>
        <View style={tw`p-4 flex flex-row items-center justify-between`}>
          <View style={tw`flex-1 flex-row items-center gap-4`}>
            <Outline.CalendarIcon size={28} style={tw`text-green-600`} />
            <View style={tw`flex flex-col`}>
              <Text style={tw`text-base text-gray-500`}>{formattedDate}, {formattedTime}</Text>
              <Text style={tw`text-lg text-gray-950 font-bold`}>{item.jenisSampah}</Text>
            </View>
          </View>
          <View style={tw`absolute top-3 right-3 flex flex-row items-center gap-2`}>
            <TouchableOpacity onPress={() => {
              Alert.alert(
                'Konfirmasi',
                'Apa kamu yakin ingin menerima sampah dari KBS ini?',
                [
                  {
                    text: 'Kembali',
                    style: 'cancel'
                  },
                  {
                    text: 'Iya, Terima Permintaan!',
                    style: 'default',
                    onPress: () => {
                      handleTerima(item)
                    }
                  },
                ]
              );
            }} style={tw`px-1 py-1 rounded-xl border-2 border-green-600`}>
              <Solid.CheckIcon size={24} style={tw`text-green-600`} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              Alert.alert(
                'Konfirmasi',
                'Apa kamu yakin ingin menolak sampah dari KBS ini?',
                [
                  {
                    text: 'Kembali',
                    style: 'cancel'
                  },
                  {
                    text: 'Iya, Tolak Permintaan!',
                    style: 'default',
                    onPress: () => {
                      handleTolak(item)
                    }
                  },
                ]
              );
            }} style={tw`px-1 py-1 rounded-xl border-2 border-red-600`}>
              <Solid.XMarkIcon size={24} style={tw`text-red-600`} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`h-0.2 bg-gray-200 rounded-full my-2`} />
        <View style={tw`px-4 pb-4 flex flex-row items-center justify-between`}>
          <Text style={tw`text-gray-800`}>Total Sampah</Text>
          <Text style={tw`font-bold text-xl text-gray-800`}>{item.totalSampah} {selectTipe === 'Pengolahan Sampah' && item.klasifikasiPengolahan === 'Kirim ke TPS' ? '(Kg)' : selectTipe === 'Sampah Masuk' ? '(Kg)' : '(Kg)'}</Text>
        </View>
      </View>
    )
  };

  const RenderEmpty = () => {
    return(
      <View style={tw`flex items-center justify-center border border-gray-200 py-24 rounded-3xl`}>
        <Text style={tw`font-bold text-gray-500 text-base`}>Belum ada data.</Text>
        {
          (selectJenis !== 'Semua Jenis' || selectKlasifikasi !== 'Semua Klasifikasi') ? (

          <TouchableOpacity onPress={() => handleFilterClear()} style={tw`px-4 py-2 bg-gray-300 rounded-full mt-2`}>
            <Text style={tw`font-bold text-gray-700 text-base leading-5`}>Hapus filter</Text>
          </TouchableOpacity>
          ) : null
        }
      </View>
    )
  }

  return (
    <View style={tw`flex-1 bg-white w-full h-full ${ Platform.OS === "android" ? 'pt-16' : 'pt-16' }`}>
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
                        navigation.navigate('Home')
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
      <View style={tw`px-4`}>
        <View style={tw`flex flex-col mb-6`}>
          <Text style={[tw`text-green-600 text-3xl font-bold`]}>Daftar Permintaan</Text>
          <Text style={[tw`text-gray-500 text-base`]}>Sampah masuk dari afiliasi KBS.</Text>
        </View>
        {
          isLoading ? (
            <View style={tw`border border-gray-200 rounded-xl mb-4`}>
              <View style={tw`p-4 flex flex-row items-center justify-between`}>
                <View style={tw`flex-1 flex-row items-center gap-4`}>
                  <Skeleton width={'flex-1'} height={'h-6'} />
                  <Skeleton width={'flex-1'} height={'h-6'} />
                  <View style={tw`flex flex-col`}>
                    <Skeleton width={'flex-1'} height={'h-6'} />
                    <Skeleton width={'flex-1'} height={'h-6'} />
                  </View>
                </View>
                <Skeleton width={'flex-1'} height={'h-6'} />
              </View>
              <View style={tw`h-0.2 bg-gray-200 rounded-full my-2`} />
              <View style={tw`px-4 pb-4 flex flex-row items-center justify-between gap-4 mt-2`}>
                <Skeleton width={'flex-1'} height={'h-6'} />
              </View>
            </View>
          ) : (
            <VirtualizedList
              showsVerticalScrollIndicator={false}
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item: any) => item.key}
              getItemCount={() => filteredData.length}
              getItem={(data, index) => data[index]}
              contentContainerStyle={{paddingBottom: 200}}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    getOlahSampah();
                  }}
                  title="Tarik untuk Refresh"
                  titleColor="#555"
                  tintColor="#555"
                />
              }
              ListEmptyComponent={<RenderEmpty />}
            />
          )
        }
      </View>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <Text style={tw`font-bold text-xl px-4 pb-2 text-gray-800`}>Mau lihat { selectFilter == "jenis" ? "Jenis Sampah" : "Klasifikasi Pengolahan" } apa?</Text>
        <View style={tw`h-0.2 w-full bg-gray-300 rounded-full`} />
        <BottomSheetScrollView contentContainerStyle={tw`flex-1 py-4`}>
          {
            selectFilter == 'tipe' ? (filterTipe.map(renderFilterItem)) : selectFilter == 'jenis' ? (filterJenis.map(renderFilterItem)) : (filterKlasifikasi.map(renderFilterItem))
          }
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  )
}

export default RequestScreen