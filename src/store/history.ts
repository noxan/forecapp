import { createSlice } from "@reduxjs/toolkit";
import { ModelState, editModelConfig } from "./models";
import { apiPrediction, parseDataset, validateModel } from "./datasets";

export type HistoricModel = {
  modelConfig: ModelState;
  metrics: any;
  testMetrics: {Loss_test : {[key : number] : number}, RegLoss_test : {[key : number] : number}};
  time: number;
};

export function getLatestTestLoss(model : HistoricModel) {
  const lossTestArr = Object.values(model.testMetrics.Loss_test);
  return lossTestArr[lossTestArr.length - 1];
}

export function getLatestTrainMAE(model : HistoricModel) {
  const trainMAEArr = Object.values(model.metrics.MAE) as number[];
  return trainMAEArr[trainMAEArr.length - 1];
}

export type ModelHistoryState = {
  models: HistoricModel[];
  currentModel?: number;
};

export const historySlice = createSlice({
  name: "history",
  initialState: {
    models: [],
  } as ModelHistoryState,
  reducers: {
    addModel: (state, action: { payload: HistoricModel }) => {
      state.models.push(action.payload);
    },
    removeModel: (state, action: { payload: number }) => {
      state.models.splice(action.payload, 1);
    },
    selectModel: (state, action: { payload: number }) => {
      state.currentModel = action.payload;
    },
  },
  extraReducers: (builder) => {
    /*
    builder.addCase(apiPrediction.fulfilled, (state, { payload }) => {
      if (state.currentModel === undefined) {
        state.models.push({
          modelConfig: payload.configuration,
          metrics: payload.metrics,
          time: Date.now(),
        });
        state.currentModel = state.models.length - 1;
      }
    });
    */
    builder.addCase(editModelConfig, (state, _) => {
      state.currentModel = undefined;
    });
    builder.addCase(validateModel.fulfilled, (state, {payload}) => {
      if (state.currentModel === undefined) {
        state.models.push({
          modelConfig: {...payload.configuration, shouldEval: false, shouldPredict: true},
          metrics: payload.trainMetrics,
          testMetrics : payload.testMetrics,
          time : Date.now(),
        });
        state.currentModel = state.models.length - 1;
      }
    })
    builder.addCase(parseDataset.fulfilled, (state, _) => {
      state.currentModel = undefined;
      state.models = [];
    })
  },
});

export const { addModel, removeModel, selectModel } = historySlice.actions;

export default historySlice.reducer;
