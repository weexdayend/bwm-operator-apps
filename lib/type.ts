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
          nama_jenis: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          idjenis?: string | null
          nama?: string | null
          nama_jenis?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          idjenis?: string | null
          nama?: string | null
          nama_jenis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_daurulang_idjenis_fkey"
            columns: ["idjenis"]
            isOneToOne: false
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
          id: string
          jenis: string | null
          nama_operator: string | null
          nama_tps: string | null
          operatorId: string | null
          status: string | null
          tipe: string | null
          tpsId: string | null
          transfered: number | null
          volume: number | null
        }
        Insert: {
          created_at?: string
          evidence?: string | null
          id?: string
          jenis?: string | null
          nama_operator?: string | null
          nama_tps?: string | null
          operatorId?: string | null
          status?: string | null
          tipe?: string | null
          tpsId?: string | null
          transfered?: number | null
          volume?: number | null
        }
        Update: {
          created_at?: string
          evidence?: string | null
          id?: string
          jenis?: string | null
          nama_operator?: string | null
          nama_tps?: string | null
          operatorId?: string | null
          status?: string | null
          tipe?: string | null
          tpsId?: string | null
          transfered?: number | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_kelola_operatorId_fkey"
            columns: ["operatorId"]
            isOneToOne: false
            referencedRelation: "tbl_operator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_kelola_tpsId_fkey"
            columns: ["tpsId"]
            isOneToOne: false
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
            isOneToOne: false
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
          id: string
          jenis: string | null
          keterangan: string | null
          klasifikasi: string | null
          nama_operator: string | null
          nama_tps: string | null
          operatorId: string | null
          source: string | null
          status_transfer: string | null
          total: number | null
          tpsId: string | null
        }
        Insert: {
          created_at?: string
          destination?: number | null
          evidence?: string | null
          id?: string
          jenis?: string | null
          keterangan?: string | null
          klasifikasi?: string | null
          nama_operator?: string | null
          nama_tps?: string | null
          operatorId?: string | null
          source?: string | null
          status_transfer?: string | null
          total?: number | null
          tpsId?: string | null
        }
        Update: {
          created_at?: string
          destination?: number | null
          evidence?: string | null
          id?: string
          jenis?: string | null
          keterangan?: string | null
          klasifikasi?: string | null
          nama_operator?: string | null
          nama_tps?: string | null
          operatorId?: string | null
          source?: string | null
          status_transfer?: string | null
          total?: number | null
          tpsId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_olah_operatorId_fkey"
            columns: ["operatorId"]
            isOneToOne: false
            referencedRelation: "tbl_operator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_olah_source_fkey"
            columns: ["source"]
            isOneToOne: false
            referencedRelation: "tbl_kelola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_olah_tpsId_fkey"
            columns: ["tpsId"]
            isOneToOne: false
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
          id: string
          password: string | null
          phoneNumber: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          fullname?: string | null
          id?: string
          password?: string | null
          phoneNumber?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          fullname?: string | null
          id?: string
          password?: string | null
          phoneNumber?: string | null
          role?: string | null
        }
        Relationships: []
      }
      tbl_operator_tps: {
        Row: {
          affiliate: string | null
          created_at: string
          id: string
          latitude: string | null
          longitude: string | null
          nama_affiliate: string | null
          nama_operator: string | null
          nama_tps: string | null
          operatorId: string | null
          tpsId: string | null
        }
        Insert: {
          affiliate?: string | null
          created_at?: string
          id?: string
          latitude?: string | null
          longitude?: string | null
          nama_affiliate?: string | null
          nama_operator?: string | null
          nama_tps?: string | null
          operatorId?: string | null
          tpsId?: string | null
        }
        Update: {
          affiliate?: string | null
          created_at?: string
          id?: string
          latitude?: string | null
          longitude?: string | null
          nama_affiliate?: string | null
          nama_operator?: string | null
          nama_tps?: string | null
          operatorId?: string | null
          tpsId?: string | null
        }
        Relationships: []
      }
      tbl_penanggung_jawab: {
        Row: {
          created_at: string | null
          id: string
          nama: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nama: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nama?: string
        }
        Relationships: []
      }
      tbl_sektor: {
        Row: {
          created_at: string | null
          id: string
          nama_sektor: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nama_sektor?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nama_sektor?: string
        }
        Relationships: []
      }
      tbl_subsektor: {
        Row: {
          created_at: string | null
          id: string
          nama_penanggung_jawab: string | null
          nama_sektor: string | null
          penanggungjawab_id: string | null
          sektor_id: string | null
          subsektor: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nama_penanggung_jawab?: string | null
          nama_sektor?: string | null
          penanggungjawab_id?: string | null
          sektor_id?: string | null
          subsektor?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nama_penanggung_jawab?: string | null
          nama_sektor?: string | null
          penanggungjawab_id?: string | null
          sektor_id?: string | null
          subsektor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_subsektor_penanggungjawab_id_fkey"
            columns: ["penanggungjawab_id"]
            isOneToOne: false
            referencedRelation: "tbl_penanggung_jawab"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tbl_subsektor_sektor_id_fkey"
            columns: ["sektor_id"]
            isOneToOne: false
            referencedRelation: "tbl_sektor"
            referencedColumns: ["id"]
          }
        ]
      }
      tbl_tps: {
        Row: {
          alamat: string | null
          created_at: string | null
          foto: string | null
          id: string
          id_fasilitas: string | null
          id_kecamatan: number | null
          id_kelurahan: string | null
          id_wilayah: number | null
          kepemilikan_lahan: string | null
          latitude: string | null
          lebar_lb: string | null
          longitude: string | null
          luas_lahan: string | null
          nama_subsektor: string | null
          nama_tps: string
          panjang_lb: string | null
          peruntukan: string | null
          sampah_diangkut: string | null
          sampah_masuk: string | null
          sisa_lahan_tidak_ada_bangunan: string | null
          status_tps: string | null
          subsektor_id: string | null
          sumber_sampah: string | null
          type_tps: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          foto?: string | null
          id?: string
          id_fasilitas?: string | null
          id_kecamatan?: number | null
          id_kelurahan?: string | null
          id_wilayah?: number | null
          kepemilikan_lahan?: string | null
          latitude?: string | null
          lebar_lb?: string | null
          longitude?: string | null
          luas_lahan?: string | null
          nama_subsektor?: string | null
          nama_tps?: string
          panjang_lb?: string | null
          peruntukan?: string | null
          sampah_diangkut?: string | null
          sampah_masuk?: string | null
          sisa_lahan_tidak_ada_bangunan?: string | null
          status_tps?: string | null
          subsektor_id?: string | null
          sumber_sampah?: string | null
          type_tps?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          foto?: string | null
          id?: string
          id_fasilitas?: string | null
          id_kecamatan?: number | null
          id_kelurahan?: string | null
          id_wilayah?: number | null
          kepemilikan_lahan?: string | null
          latitude?: string | null
          lebar_lb?: string | null
          longitude?: string | null
          luas_lahan?: string | null
          nama_subsektor?: string | null
          nama_tps?: string
          panjang_lb?: string | null
          peruntukan?: string | null
          sampah_diangkut?: string | null
          sampah_masuk?: string | null
          sisa_lahan_tidak_ada_bangunan?: string | null
          status_tps?: string | null
          subsektor_id?: string | null
          sumber_sampah?: string | null
          type_tps?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tbl_tps_id_wilayah_fkey"
            columns: ["id_wilayah"]
            isOneToOne: false
            referencedRelation: "tbl_wilayah"
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
