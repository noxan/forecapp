import {
  CButton,
  CContainer,
  CNavbar,
  CNavbarBrand,
  CNavbarToggler,
} from "@coreui/react";
import { ReactElement, useMemo, useState } from "react";
import Validation, {
  ValidationViewMode,
} from "../components/validation/Validation";
import PredictionView from "../components/prediction/PredictionView";
import { CToaster } from "@coreui/react";
import { apiPrediction, validateModel } from "../src/store/datasets";
import { useAppDispatch, useAppSelector } from "../src/hooks";
import {
  selectDataset,
  selectModelConfiguration,
  shouldEval,
  shouldPredict,
} from "../src/store/selectors";
import { transformDataset } from "../src/helpers";
import { ModelParameters } from "../src/schemas/modelParameters";
import { ZodError } from "zod";
import { HTTPError, NeuralProphetError, ValidationError } from "../src/error";
import { errorToastWithMessage } from "../components/ErrorToast";
import ModelConfiguration, {
  modelConfigurationMenu,
} from "../components/ModelConfiguration/ModelConfiguration";
import DataSelectorPage, {
  DataSelectorPages,
} from "../components/DataSelectorPage";
import PredictionConfigCard, {
  PredictionConfig,
} from "../components/prediction/PredictionConfigCard";
import SideBar from "../components/layouts/Sidebar";
import Home, { HomeViewMode } from "../components/home/Home";
import { SELECT_STATE_INITIALIZE, isColumnValid } from "../src/definitions";
import { GetStaticProps } from "next";
import Imprint from "../components/Imprint/Imprint";

const homeSubPage: HomeViewMode[] = ["Data Upload", "Sample Data"];

const modelConfigSubPage: modelConfigurationMenu[] = [
  "prediction-configuration",
  "dataset-info",
  "underlying-trends",
  "modeling-assumptions",
  "training-configuration",
  "validation-configuration",
];

const dataSelectorSubPage: DataSelectorPages[] = [
  "data-selector",
  "data-viewer",
  "data-visualize",
  "data-table",
];

const modelEvaluationSubPage: ValidationViewMode[] = [
  "Test Train Split",
  "Model Parameters",
  "Previous Performance",
];

enum Pages {
  Home = 0,
  DataSelector = 1,
  ModelConfiguration = 2,
  ModelEvaluation = 3,
  Prediction = 4,
}

const pages = [
  "Home Page",
  "Data Selector",
  "Model Configuration",
  "Model Evaluation",
  "Prediction",
  "Imprint",
];

export default function Layout() {
  const dispatch = useAppDispatch();
  const modelConfiguration = useAppSelector(selectModelConfiguration);
  const dataset = useAppSelector(selectDataset);
  const columns = useAppSelector((state) => state.datasets.columns);
  const shouldRunPred = useAppSelector(shouldPredict);

  const [activePageInd, setActivePageInd] = useState(0);
  const [activeSubPageInd, setActiveSubPageInd] = useState(0);

  const [errorMessage, setErrorMessage] = useState<ReactElement>();

  const [currChartConfig, setCurrChartConfig] = useState<PredictionConfig>({
    showUncertainty: true,
    showTrend: false,
    showEvents: false,
    showHistory: true,
  });

  const [configured, setConfigured] = useState<boolean>(false);

  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);

  const processError = (err: any) => {
    if (err instanceof ZodError) {
      setErrorMessage(
        errorToastWithMessage("The model configuration was invalid.")
      );
    } else if (err.message) {
      const error = err as HTTPError;
      setErrorMessage(
        errorToastWithMessage("Something went wrong: " + error.message)
      );
    } else if (err.detail) {
      if (err.detail instanceof Array) {
        const error = err as ValidationError;
        setErrorMessage(
          errorToastWithMessage("The model configuration was invalid.")
        );
      } else {
        const error = err as NeuralProphetError;
        setErrorMessage(
          errorToastWithMessage("Neural Prophet failed: " + error.detail)
        );
      }
    } else {
      setErrorMessage(errorToastWithMessage("An unknown error occured."));
    }
  };

  const predict = async () => {
    try {
      await dispatch(
        apiPrediction({
          dataset: transformDataset(dataset, modelConfiguration, columns),
          configuration: modelConfiguration,
        })
      ).unwrap();
    } catch (err: any) {
      console.log(err);
      processError(err);
    }
  };

  const validate = async () => {
    try {
      await dispatch(
        validateModel({
          dataset: transformDataset(dataset, modelConfiguration, columns),
          configuration: modelConfiguration,
        })
      ).unwrap();
    } catch (err: any) {
      processError(err);
    }
  };

  function getPageComponent(pageInd: number, subPageInd: number) {
    const pageName = pages[pageInd];
    switch (pageName) {
      case "Home Page":
        return (
          <Home
            view={homeSubPage[subPageInd]}
            onDataUpload={() => {
              setActivePageInd(Pages.DataSelector);
              setActiveSubPageInd(0);
            }}
          />
        );
      case "Model Evaluation":
        return (
          <Validation
            view={modelEvaluationSubPage[subPageInd]}
            validate={validate}
          />
        );
      case "Prediction":
        return (
          <PredictionView
            chartConfig={currChartConfig}
            stalePrediction={shouldRunPred}
            predict={predict}
            exportModal={subPageInd === 0}
            onCloseModal={() => setActiveSubPageInd(-1)}
          />
        );
      case "Model Configuration":
        return (
          <ModelConfiguration
            onSelectionChange={(newSelection) => {
              const newInd = modelConfigSubPage.findIndex(
                (val) => val === newSelection
              );
              setActiveSubPageInd(newInd);
            }}
          />
        );
      case "Data Selector":
        return (
          <DataSelectorPage selectedSubPage={dataSelectorSubPage[subPageInd]} />
        );
      case "Imprint":
        return <Imprint />;
    }
  }

  const handleNavClick = (
    pageInd: number,
    subPageInd: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.preventDefault();

    if (
      event.target instanceof Element &&
      event.target.className.split(" ")[1] === "nav-group-toggle"
    ) {
      if (event.target.parentElement) {
        if (event.target.parentElement.classList.contains("show")) {
          event.target.parentElement.classList.remove("show");
        } else {
          event.target.parentElement.classList.add("show");
        }
      }
    }

    console.log("Click event : " + "(" + pageInd + ", " + subPageInd + ")");
    if (pageInd === Pages.ModelConfiguration) {
      setConfigured(true);
      location.href = `#${modelConfigSubPage[subPageInd]}`;
    }

    if (dataset === undefined) {
      if (pageInd === Pages.Home) {
        setActiveSubPageInd(subPageInd);
      }
      return;
    } else if (
      !(
        isColumnValid(columns.timeColumn) && isColumnValid(columns.targetColumn)
      )
    ) {
      if (pageInd === Pages.Home || pageInd === Pages.DataSelector) {
        setActivePageInd(pageInd);
        setActiveSubPageInd(subPageInd);
        return;
      }
    } else if (!configured) {
      if (pageInd === Pages.Prediction || pageInd === Pages.ModelEvaluation) {
        return;
      }
    }

    setActivePageInd(pageInd);
    setActiveSubPageInd(subPageInd);
  };

  return (
    <>
      <CNavbar colorScheme="dark" className="background-color-dark-blue">
        <CContainer fluid>
          <CNavbarToggler
            className="np-sidebar-toggle"
            onClick={(_) => {
              setSidebarVisible(!sidebarVisible);
            }}
          />
          <CNavbarBrand onClick={() => setActivePageInd(5)}>
            Forecapp
          </CNavbarBrand>
        </CContainer>
      </CNavbar>
      <div className="row align-items-start">
        <div className="np-sidebar">
          <SideBar
            visible={sidebarVisible}
            activePageInd={activePageInd}
            activeSubPageInd={activeSubPageInd}
            chartConfig={currChartConfig}
            onNavClick={handleNavClick}
            onPredictionConfigChange={setCurrChartConfig}
            onHide={() => setSidebarVisible(false)}
            configured={configured}
            dataUploaded={dataset !== undefined}
            columnsChosen={
              isColumnValid(columns.timeColumn) &&
              isColumnValid(columns.targetColumn)
            }
          />
        </div>
        <div className="np-side-content">
          {getPageComponent(activePageInd, activeSubPageInd)}
        </div>
        <CToaster push={errorMessage} placement="bottom-end" />
      </div>
    </>
  );
}
