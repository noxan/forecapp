import ConfigurationCard from "./ConfigurationCard";
import {
  predictionHorizonExplanation,
  predictionHorizonDocumentationLink,
} from "./ConfigExplanations";
import { CFormInput } from "@coreui/react";
import { useAppDispatch, useAppSelector } from "../../src/hooks";
import {
  selectModelConfiguration,
  selectDataset,
  selectTimeColumn,
} from "../../src/store/selectors";
import { editModelConfig } from "../../src/store/models";
import { detectResolution } from "../../src/helpers";
import { validateModelParameterSection } from "../../src/schemas/modelParameters";

const parseStringToNumber = (value: string) =>
  value === "" ? null : Number(value);

export default function PredictionConfiguration() {
  const modelConfiguration = useAppSelector(selectModelConfiguration);
  const dispatch = useAppDispatch();
  const dataset = useAppSelector(selectDataset);
  const timeColumn = useAppSelector(selectTimeColumn);
  const resolution = detectResolution(dataset, timeColumn);
  const { forecasts } = validateModelParameterSection(
    modelConfiguration,
    "prediction-configuration"
  );
  return (
    <div data-section id="prediction-configuration">
      <h2 className="mb-4">Prediction Configuration</h2>
      <ConfigurationCard
        explanation={predictionHorizonExplanation}
        title="Prediction Horizon"
        documentationLink={predictionHorizonDocumentationLink}
      >
        How far should the model predict into the future? The unit is based on
        your dataset in <b>{resolution}</b>.
        <CFormInput
          type="number"
          defaultValue={modelConfiguration.forecasts}
          placeholder="Number of values to forecast ..."
          onChange={(e) =>
            dispatch(
              editModelConfig({
                forecasts: parseStringToNumber(e.target.value),
              })
            )
          }
          valid={forecasts.valid}
          invalid={!forecasts.valid}
          feedbackValid=""
          feedbackInvalid={forecasts.error}
        />
      </ConfigurationCard>
    </div>
  );
}
