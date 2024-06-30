import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { DataLayer } from './DataLayers/DataLayer';
import { Patch } from './DataLayers/Patch';

interface MapState {
  layers: { [key: string]: DataLayer }
}

const initialState: MapState = {
  layers: {}
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    addLayer: (state, action: PayloadAction<DataLayer>) => {
      const id = action.payload.id;
      state.layers[id] = action.payload;
    },
    removeLayer: (state, action: PayloadAction<DataLayer>) => {
      const id = action.payload.id;
      delete state.layers[id];
    },
    toggleLayer: (state, action: PayloadAction<DataLayer>) => {
      const id = action.payload.id;
      const layer = state.layers[id];
      layer.active = !layer.active;
    },
    addPatch: (state, action: PayloadAction<Patch>) => {
      const id = action.payload.header.name;
      state.layers[id].patches.push(action.payload);
    }
  }
})

export const { addLayer, removeLayer, toggleLayer, addPatch } = mapSlice.actions

export default mapSlice.reducer
