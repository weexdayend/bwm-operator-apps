// reducers.ts

import { AppAction, AppState } from "./actionType";

const initialState: AppState = {
  select_image: '',
  requestTotal: 0
};

const reducer = (state = initialState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SELECT_IMAGE':
      return { ...state, select_image: action.payload };
    case 'SAVE_REQUESTTOTAL':
      return { ...state, requestTotal: action.payload };
    default:
      return state;
  }
};

export default reducer;
