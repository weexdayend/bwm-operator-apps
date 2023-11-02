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
  ScrollView, 
  TouchableOpacity 
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

async function retrieveNumber(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // Convert the retrieved string back to a number
      return parseInt(value, 10);
    }
    return null; // Return null if the key doesn't exist in AsyncStorage
  } catch (error) {
    // Handle any errors that may occur during AsyncStorage operations
    console.error(`Error retrieving ${key}: ${error}`);
    return null; // Return null in case of an error
  }
}

const HistoryScreen = () => {
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

    const OperatorID = await retrieveNumber('OperatorID');
    const TPS = await retrieveNumber('TPS');

    const setTable = selectTipe === 'Pengolahan Sampah' ? 'tbl_olah' : 'tbl_kelola'

    const check = supabase
      .from(`${setTable}`)
      .select()
      .eq("operatorId", `${OperatorID}`).eq("tpsId", `${TPS}`)
      .order("created_at", { ascending: false })
    const response = await check
    
    if (response.data !== null) {
      const newData = response.data.map((item: any, index: any) => ({
        key: String(index),
        id: item.id,
        date: item.created_at,
        totalSampah: `${item.total || item.volume}`,
        jenisSampah: `${item.jenis}`,
        klasifikasiPengolahan: `${item.klasifikasi || 'Masuk'}`,
        evidence: item.evidence,
        table: setTable,
        source: `${item.source || null}`,
        status: `${item.status_transfer || null}`,
        keterangan: `${item.keterangan || null}`
      }))

      newData.sort((a, b) => a.date - b.date);

      setData(newData);
      setRefreshing(false);
      setIsLoading(false);
    }
  }

  const [filteredData, setFilteredData] = useState<any>(data);

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
    
    return(
      <TouchableOpacity onPress={() => navigation.navigate('DetailData', {
        id: item.id,
        date: item.date,
        totalSampah: item.totalSampah,
        jenisSampah: item.jenisSampah,
        klasifikasi: item.klasifikasiPengolahan,
        evidence: item.evidence,
        table: item.table,
        source: item.source,
        status: item.status,
        keterangan: item.keterangan
      })} style={tw`border border-gray-200 rounded-xl mb-4`}>
        <View style={tw`p-4 flex flex-row items-center justify-between`}>
          <View style={tw`flex-1 flex-row items-center gap-4`}>
            <Outline.CalendarIcon size={28} style={tw`text-green-600`} />
            <View style={tw`flex flex-col`}>
              <Text style={tw`text-base text-gray-500`}>{formattedDate}</Text>
              <Text style={tw`text-lg text-gray-950 font-bold`}>{item.jenisSampah}</Text>
            </View>
          </View>
          {
            item.klasifikasiPengolahan === "Daur Ulang" && (
              <View style={tw`px-1.5 py-1 rounded-md bg-green-100`}>
                <Text style={tw`text-base text-green-800 font-bold`}>{item.klasifikasiPengolahan}</Text>
              </View>
            )
          }
          {
            item.klasifikasiPengolahan === "Kirim ke TPS" && (
              <View style={tw`px-1.5 py-1 bg-transparent`}>
                <Text style={tw`text-base text-red-500 font-bold text-right`}>{item.klasifikasiPengolahan}</Text>
                <Text style={tw`text-xs text-red-700 text-right`}>{item.status}</Text>
              </View>
            )
          }
        </View>
        <View style={tw`h-0.2 bg-gray-200 rounded-full my-2`} />
        <View style={tw`px-4 pb-4 flex flex-row items-center justify-between`}>
          <Text style={tw`text-gray-800`}>Total Sampah</Text>
          <Text style={tw`font-bold text-xl text-gray-800`}>{item.totalSampah} {selectTipe === 'Pengolahan Sampah' && item.klasifikasiPengolahan === 'Kirim ke TPS' ? '(Kg)' : selectTipe === 'Sampah Masuk' ? '(Kg)' : '(Kg)'}</Text>
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <View style={tw`flex-1 bg-white w-full h-full ${ Platform.OS === "android" ? 'pt-16' : 'pt-16' }`}>
      <View style={tw`px-4`}>
        <View style={tw`flex flex-col`}>
          <Text style={[tw`text-green-600 text-3xl font-bold`]}>Riwayat Laporan</Text>
          <Text style={[tw`text-gray-500 text-base`]}>Daftar laporan per 30 Hari.</Text>
        </View>
        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={tw`flex-1 flex-row items-center gap-2 pt-6 pb-4`}>
            {
              (selectJenis !== 'Semua Jenis' || selectKlasifikasi !== 'Semua Klasifikasi') ? (
                <TouchableOpacity 
                  onPress={() => handleFilterClear()} 
                  style={tw`px-1 border border-gray-300 py-1 rounded-lg`}
                >
                  <Outline.XMarkIcon size={26} style={tw`text-green-600`} />
                </TouchableOpacity>
              ) : null
            }

            <TouchableOpacity
              onPress={() => handleSnapPress(0, 'tipe')} 
              style={tw`rounded-xl border border-green-600 bg-green-50`}
            >
              <View style={tw`flex flex-row items-center px-2 py-2 gap-3`}>
                <Text style={tw`text-lg text-gray-500 leading-5`}>{selectTipe}</Text>
                <Outline.ChevronDownIcon style={tw`text-gray-500`} size={18} />
              </View>
            </TouchableOpacity>
            {
              selectTipe == 'Sampah Masuk' ? (<></>) : (
                <>
                  <TouchableOpacity
                    onPress={() => handleSnapPress(0, 'jenis')} 
                    style={tw`rounded-xl border ${selectJenis !== 'Semua Jenis' ? 'border-green-600 bg-green-50':'border-gray-300'}`}
                  >
                    <View style={tw`flex flex-row items-center px-2 py-2 gap-3`}>
                      <Text style={tw`text-lg text-gray-500 leading-5`}>{selectJenis ? selectJenis : 'Semua Jenis'}</Text>
                      <Outline.ChevronDownIcon style={tw`text-gray-500`} size={18} />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSnapPress(0, 'klasifikasi')} 
                    style={tw`rounded-xl border ${selectKlasifikasi !== 'Semua Klasifikasi' ? 'border-green-600 bg-green-50':'border-gray-300'}`}
                  >
                    <View style={tw`flex flex-row items-center px-2 py-2 gap-3`}>
                      <Text style={tw`text-lg text-gray-500 leading-5`}>{selectKlasifikasi ? selectKlasifikasi : 'Semua Klasifikasi'}</Text>
                      <Outline.ChevronDownIcon style={tw`text-gray-500`} size={18} />
                    </View>
                  </TouchableOpacity>
                </>
              )
            }
          </View>
        </ScrollView>
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
          ) :
          filteredData.length > 0 ? (
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
            />
          ) : (
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

export default HistoryScreen