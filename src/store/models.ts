import { createSlice } from "@reduxjs/toolkit";
import merge from "lodash.merge";

import { forecappApi } from "./forecappApi";
import { HistoricModel, selectModel } from "./history";
import { apiPrediction, parseDataset, validateModel } from "./datasets";

forecappApi.endpoints.predictionPredictionPost.useMutation;

export type event = {
  dates: string[];
  regularization: number;
  lowerWindow: number;
  upperWindow: number;
  mode: "additive" | "multiplicative";
};

export type ModelState = {
  forecasts: number;
  trend: {
    growth: "off" | "linear";
    numberOfChangepoints: number;
  };
  autoregression: {
    lags: number;
    regularization: number;
  };
  seasonality: {
    daily: any;
    weekly: any;
    yearly: any;
  };
  events: {
    [key: string]: event[];
  };
  training: {
    earlyStopping: boolean;
    epochs?: any;
    batchSize?: any;
    learningRate?: any;
  };
  validation: {
    testSplit: number;
    confidenceLevel: number;
  };
  laggedRegressors: any[];
  holidays: string[];
  shouldPredict: boolean;
  shouldEval: boolean;
};

const initConfig = {
  forecasts: 168,
  trend: {
    growth: "linear",
    numberOfChangepoints: 0,
  },
  autoregression: {
    lags: 0,
    regularization: 0,
  },
  seasonality: {
    mode: "additive",
    daily: true,
    weekly: false,
    yearly: false,
  },
  events: {},
  training: {
    learningRate: null,
    epochs: 10,
    batchSize: null,
    earlyStopping: true,
  },
  validation: {
    testSplit: 20,
    confidenceLevel: 95,
  },
  laggedRegressors: [],
  holidays: [],
  shouldPredict: true,
  shouldEval: true,
} as ModelState;

export const modelSlice = createSlice({
  name: "models",
  initialState: initConfig,
  reducers: {
    editModelConfig: (state: ModelState, { payload }) => {
      state.shouldEval = true;
      state.shouldPredict = true;
      const keys = Object.keys(payload);
      if (keys.includes("laggedRegressors")) {
        const { laggedRegressors } = payload;
        state.laggedRegressors = laggedRegressors;
      } else if (keys.includes("holidays")) {
        const { holidays } = payload;
        state.holidays = holidays;
      } else {
        return merge(state, payload);
      }
    },
    applyPrevModel: (state, action: { payload: HistoricModel }) => {  
      state = {...action.payload.modelConfig, shouldPredict: true, shouldEval: true};
    },
    editModelConfigJsonView: (_, { payload: { updated_src: newState } }: any) =>
      newState,
    removeEvent: (state: ModelState, { payload: { eventKey } }) => {
      const { [eventKey]: _, ...newEvents } = state.events;
      state.events = newEvents;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(apiPrediction.fulfilled, (state, _) => {
      state.shouldPredict = false;
    });
    builder.addCase(validateModel.fulfilled, (state, _) => {
      state.shouldEval = false;
    });
    builder.addCase(parseDataset.fulfilled, (state, _) => {
      state = initConfig;
    });
    builder.addCase(selectModel, (state, _) => {
      state.shouldEval = true;
      state.shouldPredict = true;
    })
  }
});

export const { editModelConfig, editModelConfigJsonView, removeEvent, applyPrevModel } =
  modelSlice.actions;

export default modelSlice.reducer;
