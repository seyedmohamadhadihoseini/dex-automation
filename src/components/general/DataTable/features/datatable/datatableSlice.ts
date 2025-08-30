import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface datatableState {
    columnSort: {
        columnNameSort: string,
        columnSortIsAsc: boolean
    },
    forceUpdate: boolean,
    tableName:string
}

const initialState: datatableState = {
    columnSort: {
        columnNameSort: "Name",
        columnSortIsAsc: true
    },
    forceUpdate: true,
    tableName:"r1"
}

export const datatableSlice = createSlice({
    name: 'datatable',
    initialState,
    reducers: {

        changeColumnSort: (state, action: PayloadAction<{
            name: string, isAsc: boolean
        }>) => {
            state.columnSort.columnNameSort = action.payload.name
            state.columnSort.columnSortIsAsc = action.payload.isAsc
        },
        changeTableName: (state, action: PayloadAction<string>) => {
            state.tableName = action.payload;
        },
        ForceUpdate: (state) => {
            state.forceUpdate = !state.forceUpdate;
        },

    },
})

// Action creators are generated for each case reducer function
export const { changeColumnSort ,ForceUpdate} = datatableSlice.actions

export default datatableSlice.reducer