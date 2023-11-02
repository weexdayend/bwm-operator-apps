// types.ts

export interface AppState {
  select_image: string;
  requestTotal: number;
  
}

export type AppAction =
  | { type: 'SELECT_IMAGE'; payload: string }
  | { type: 'SAVE_REQUESTTOTAL'; payload: number };

export type RootState = ReturnType<typeof import('./reducers').default>;
