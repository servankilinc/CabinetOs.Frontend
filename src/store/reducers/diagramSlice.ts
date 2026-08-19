import { createSlice } from '@reduxjs/toolkit';

export interface NodePosition {
    x: number;
    y: number;
}

interface StateUI {
}

const initialState: StateUI = {
};

export const diagramSlice = createSlice({
    name: 'diagramSlice',
    initialState,
    reducers: {
    }
});

export const { } = diagramSlice.actions;
export default diagramSlice.reducer;
