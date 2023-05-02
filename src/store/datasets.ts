import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  COLUMN_PRIMARY_TARGET,
  COLUMN_PRIMARY_TIME,
  SELECT_STATE_INITIALIZE,
} from "../definitions";
import { autodetectColumn } from "../helpers";
import { parse, parseErrorLevel } from "../parser";
import { ParseError, ParseResult } from "papaparse";
import { ValidationSettings, validate } from "../data-validator";

export type ErrorLevel = "Info" | "Warning" | "Error";

export function errorLevelColor(level: ErrorLevel) {
  if (level === "Error") {
    return "danger";
  } else if (level === "Warning") {
    return "warning";
  } else {
    return "info";
  }
}

export type DataValidationError = {
  level: ErrorLevel;
  message: string;
  row?: number;
};

export type DataError =
  | (ParseError & { level: ErrorLevel })
  | DataValidationError;

export const parseDataset = createAsyncThunk<
  ParseResult<{ [key: string]: any }>,
  string | File
>("datasets/parseDataset", async (source, { rejectWithValue }) => {
  // TODO : Check file extension is actual a csv
  if (source instanceof File) {
    const text = await source.text();
    return await parse(text.trim());
  }
  return await parse(source, true);
});

const defaultValidationSettings: ValidationSettings = {
  cutToSize: true,
  strictDateTime: true,
  minCols: 2,
};

type PredictionQueryArg = { dataset: any[]; configuration: object };

export const apiPrediction = createAsyncThunk<any, PredictionQueryArg>(
  "datasets/apiPrediction",
  async (payload, { rejectWithValue }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prediction`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resJSON = await res.json();
    if (resJSON.status !== "ok") {
      return rejectWithValue(resJSON);
    }
    return resJSON;
  }
);

export interface DatasetsState {
  status: "idle" | "loading";
  dataErrors: DataError[];
  error?: any;
  raw?: { [key: string]: any }[];
  columns: {
    timeColumn: string;
    targetColumn: string;
  };
  prediction?: object; // results dataset, alias predictions
}

const initialState = {
  status: "idle",
  columns: {
    timeColumn: SELECT_STATE_INITIALIZE,
    targetColumn: SELECT_STATE_INITIALIZE,
  },
  dataErrors: [],
} as DatasetsState;

export const datasetSlice = createSlice({
  name: "datasets",
  initialState,
  reducers: {
    // TODO: reset column configuration on new dataset import
    detectColumnConfig: (state, action: { payload: string[] }) => {
      const columnHeaders = action.payload;
      autodetectColumn(
        COLUMN_PRIMARY_TIME,
        columnHeaders,
        (timeColumn: string) => {
          state.columns.timeColumn = timeColumn;
        }
      );
      autodetectColumn(
        COLUMN_PRIMARY_TARGET,
        columnHeaders,
        (targetColumn: string) => {
          state.columns.targetColumn = targetColumn;
        }
      );
    },
    resetColumnConfig: (state) => {
      state.columns = initialState.columns;
    },
    setTimeColumn: (state, action: { payload: string }) => {
      state.columns.timeColumn = action.payload;
    },
    setTargetColumn: (state, action) => {
      state.columns.targetColumn = action.payload;
    },
    validateData: (state) => {
      if (state.raw)
        state.dataErrors.concat(validate(state.raw, defaultValidationSettings));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(parseDataset.fulfilled, (state, { payload }) => {
      state.status = "idle";
      state.raw = payload.data;
      state.dataErrors = payload.errors.map((e, _) => {
        const castedError: DataError = e as DataError;
        castedError.level = parseErrorLevel(e);
        return castedError;
      });
    });
    builder.addCase(parseDataset.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(parseDataset.rejected, (state, action) => {
      state.error = action.error;
      state.status = "idle";
    });
    builder.addCase(apiPrediction.fulfilled, (state, { payload }) => {
      state.status = "idle";
      state.error = null;
      state.prediction = payload as any;
    });
    builder.addCase(apiPrediction.pending, (state) => {
      state.error = null;
      state.status = "loading";
    });
    builder.addCase(apiPrediction.rejected, (state, action) => {
      state.error = action.error;
      state.status = "idle";
    });
  },
});

export const { detectColumnConfig, setTimeColumn, setTargetColumn } =
  datasetSlice.actions;

export default datasetSlice.reducer;
