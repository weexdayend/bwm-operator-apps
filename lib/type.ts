export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      log_camera: {
        Row: {
          bugs: string | null
          created_at: string
          id: number
        }
        Insert: {
          bugs?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          bugs?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      tbl_daurulang: {
        Row: {
          created_at: string
          id: string
          idjenis: string | null
          nama: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          idjenis?: string | null
          nama?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          idjenis?: string | null
          nama?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_daurulang_idjenis_fkey"
            columns: ["idjenis"]
            referencedRelation: "tbl_jenis"
            referencedColumns: ["id"]
          }
        ]
      }
      tbl_jenis: {
        Row: {
          created_at: string
          id: string
          nama: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nama?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string | null
        }
        Relationships: []
      }
      tbl_kecamatan: {
        Row: {
          id: number
          nama: string | null
        }
        Insert: {
          id: number
          nama?: string | null
        }
        Update: {
          id?: number
          nama?: string | null
        }
        Relationships: []
      }
      tbl_kelola: {
        Row: {
          created_at: string
          evidence: string | null
          id: number
          jenis: string | null
          operatorId: number | null
          status: string | null
          tipe: string | null
          tpsId: number | null
          transfered: number | null
          volume: number | null
        }
        Insert: {
          created_at?: string
          evidence?: string | null
          id?: number
          jenis?: string | null
          operatorId?: number | null
          status?: string | null
          tipe?: string | null
          tpsId?: number | null
          transfered?: number | null
          volume?: number | null
        }
        Update: {
          created_at?: string
          evidence?: string | null
          id?: number
          jenis?: string | null
          operatorId?: number | null
          status?: string | null
          tipe?: string | null
          tpsId?: number | null
          transfered?: number | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_kelola_operatorId_fkey"
            columns: ["operatorId"]
            referencedRelation: "tbl_operator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_kelola_tpsId_fkey"
            columns: ["tpsId"]
            referencedRelation: "tbl_tps"
            referencedColumns: ["id"]
          }
        ]
      }
      tbl_kelurahan: {
        Row: {
          id: number
          kecamatan_id: number | null
          nama: string
        }
        Insert: {
          id?: number
          kecamatan_id?: number | null
          nama?: string
        }
        Update: {
          id?: number
          kecamatan_id?: number | null
          nama?: string
        }
        Relationships: [
          {
            foreignKeyName: "tbl_kelurahan_kecamatan_id_fkey"
            columns: ["kecamatan_id"]
            referencedRelation: "tbl_kecamatan"
            referencedColumns: ["id"]
          }
        ]
      }
      tbl_olah: {
        Row: {
          created_at: string
          destination: number | null
          evidence: string | null
          id: number
          jenis: string | null
          keterangan: string | null
          klasifikasi: string | null
          operatorId: number | null
          source: number | null
          status_transfer: string | null
          total: number | null
          tpsId: number | null
        }
        Insert: {
          created_at?: string
          destination?: number | null
          evidence?: string | null
          id?: number
          jenis?: string | null
          keterangan?: string | null
          klasifikasi?: string | null
          operatorId?: number | null
          source?: number | null
          status_transfer?: string | null
          total?: number | null
          tpsId?: number | null
        }
        Update: {
          created_at?: string
          destination?: number | null
          evidence?: string | null
          id?: number
          jenis?: string | null
          keterangan?: string | null
          klasifikasi?: string | null
          operatorId?: number | null
          source?: number | null
          status_transfer?: string | null
          total?: number | null
          tpsId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_olah_operatorId_fkey"
            columns: ["operatorId"]
            referencedRelation: "tbl_operator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_olah_source_fkey"
            columns: ["source"]
            referencedRelation: "tbl_kelola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_olah_tpsId_fkey"
            columns: ["tpsId"]
            referencedRelation: "tbl_tps"
            referencedColumns: ["id"]
          }
        ]
      }
      tbl_operator: {
        Row: {
          created_at: string
          email: string | null
          fullname: string | null
          id: number
          password: string | null
          phoneNumber: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          fullname?: string | null
          id?: number
          password?: string | null
          phoneNumber?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          fullname?: string | null
          id?: number
          password?: string | null
          phoneNumber?: string | null
          role?: string | null
        }
        Relationships: []
      }
      tbl_operator_tps: {
        Row: {
          affiliate: number | null
          created_at: string
          latitude: string | null
          longitude: string | null
          operatorId: number | null
          tpsId: number | null
          unique_key: string
        }
        Insert: {
          affiliate?: number | null
          created_at?: string
          latitude?: string | null
          longitude?: string | null
          operatorId?: number | null
          tpsId?: number | null
          unique_key?: string
        }
        Update: {
          affiliate?: number | null
          created_at?: string
          latitude?: string | null
          longitude?: string | null
          operatorId?: number | null
          tpsId?: number | null
          unique_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "tbl_operator_tps_affiliate_fkey"
            columns: ["affiliate"]
            referencedRelation: "tbl_tps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_operator_tps_operatorId_fkey"
            columns: ["operatorId"]
            referencedRelation: "tbl_operator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_operator_tps_tpsId_fkey"
            columns: ["tpsId"]
            referencedRelation: "tbl_tps"
            referencedColumns: ["id"]
          }
        ]
      }
      tbl_penanggung_jawab: {
        Row: {
          id: number
          nama: string
        }
        Insert: {
          id?: number
          nama: string
        }
        Update: {
          id?: number
          nama?: string
        }
        Relationships: []
      }
      tbl_sektor: {
        Row: {
          id: number
          nama_sektor: string
        }
        Insert: {
          id?: number
          nama_sektor?: string
        }
        Update: {
          id?: number
          nama_sektor?: string
        }
        Relationships: []
      }
      tbl_subsektor: {
        Row: {
          id: number
          penanggungjawab_id: number | null
          sektor_id: number | null
          subsektor: string | null
        }
        Insert: {
          id?: number
          penanggungjawab_id?: number | null
          sektor_id?: number | null
          subsektor?: string | null
        }
        Update: {
          id?: number
          penanggungjawab_id?: number | null
          sektor_id?: number | null
          subsektor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_subsektor_penanggungjawab_id_fkey"
            columns: ["penanggungjawab_id"]
            referencedRelation: "tbl_penanggung_jawab"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_subsektor_sektor_id_fkey"
            columns: ["sektor_id"]
            referencedRelation: "tbl_sektor"
            referencedColumns: ["id"]
          }
        ]
      }
      tbl_tps: {
        Row: {
          alamat: string | null
          foto: string | null
          id: number
          id_fasilitas: string | null
          id_kecamatan: number | null
          id_kelurahan: string | null
          id_wilayah: number | null
          kepemilikan_lahan: string | null
          latitude: string | null
          lebar_lb: string | null
          longitude: string | null
          luas_lahan: string | null
          nama_tps: string
          panjang_lb: string | null
          peruntukan: string | null
          sampah_diangkut: string | null
          sampah_masuk: string | null
          sisa_lahan_tidak_ada_bangunan: string | null
          subsektor_id: number | null
          sumber_sampah: string | null
          type_tps: string | null
        }
        Insert: {
          alamat?: string | null
          foto?: string | null
          id?: number
          id_fasilitas?: string | null
          id_kecamatan?: number | null
          id_kelurahan?: string | null
          id_wilayah?: number | null
          kepemilikan_lahan?: string | null
          latitude?: string | null
          lebar_lb?: string | null
          longitude?: string | null
          luas_lahan?: string | null
          nama_tps?: string
          panjang_lb?: string | null
          peruntukan?: string | null
          sampah_diangkut?: string | null
          sampah_masuk?: string | null
          sisa_lahan_tidak_ada_bangunan?: string | null
          subsektor_id?: number | null
          sumber_sampah?: string | null
          type_tps?: string | null
        }
        Update: {
          alamat?: string | null
          foto?: string | null
          id?: number
          id_fasilitas?: string | null
          id_kecamatan?: number | null
          id_kelurahan?: string | null
          id_wilayah?: number | null
          kepemilikan_lahan?: string | null
          latitude?: string | null
          lebar_lb?: string | null
          longitude?: string | null
          luas_lahan?: string | null
          nama_tps?: string
          panjang_lb?: string | null
          peruntukan?: string | null
          sampah_diangkut?: string | null
          sampah_masuk?: string | null
          sisa_lahan_tidak_ada_bangunan?: string | null
          subsektor_id?: number | null
          sumber_sampah?: string | null
          type_tps?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_tps_id_wilayah_fkey"
            columns: ["id_wilayah"]
            referencedRelation: "tbl_wilayah"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_tps_subsektor_id_fkey"
            columns: ["subsektor_id"]
            referencedRelation: "tbl_subsektor"
            referencedColumns: ["id"]
          }
        ]
      }
      tbl_wilayah: {
        Row: {
          id: number
          nama_wilayah: string
        }
        Insert: {
          id?: number
          nama_wilayah?: string
        }
        Update: {
          id?: number
          nama_wilayah?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
