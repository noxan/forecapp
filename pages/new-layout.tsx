import AccordionSideBar, {
  AccordionSideBarGroupProps,
} from "../components/layouts/AccordionSidebar";
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
} from "../src/store/selectors";
import { transformDataset } from "../src/helpers";
import { ModelParameters } from "../src/schemas/modelParameters";
import { ZodError } from "zod";
import { HTTPError, NeuralProphetError, ValidationError } from "../src/error";
import { errorToastWithMessage } from "../components/ErrorToast";

function getPageComponent(pageInd: number, subPageInd: number) {
  console.log("Get page called");
  const pageName = pages[pageInd].pageName;
  const subPageName =
    subPageInd >= 0 ? (pages[pageInd].subPages[subPageInd] as string) : "";
  switch (pageName) {
    case "Model Evaluation":
      return <Validation view={subPageName as ValidationViewMode} />;
    case "Prediction":
      return <PredictionView />;
    default:
      return <></>;
  }
}

enum Pages {
  DataSelector = 0,
  ModelConfiguration = 1,
  ModelEvaluation = 2,
  Prediction = 3,
}

const pages = [
  { pageName: "Data Selector", subPages: [] },
  {
    pageName: "Model Configuration",
    subPages: [
      "Underlying Trends",
      "Training Configuration",
      "Modeling Assumptions",
      "Dataset Info",
    ],
  },
  {
    pageName: "Model Evaluation",
    subPages: ["Test Train Split", "Previous Performance"],
  },
  { pageName: "Prediction", subPages: [] },
] as AccordionSideBarGroupProps[];

export default function Layout() {
  const dispatch = useAppDispatch();
  const modelConfiguration = useAppSelector(selectModelConfiguration);
  const dataset = useAppSelector(selectDataset);
  const columns = useAppSelector((state) => state.datasets.columns);

  const [activePageInd, setActivePageInd] = useState(0);
  const [activeSubPageInd, setActiveSubPageInd] = useState(-1);

  const [errorMessage, setErrorMessage] = useState<ReactElement>();

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
      processError(err);
    }
  };

  const validate = async () => {
    try {
      await dispatch(
        validateModel({
          dataset: transformDataset(dataset, modelConfiguration, columns),
          validationConfig: {
            split: 0.2,
            modelConfig: modelConfiguration,
          },
        })
      ).unwrap();
    } catch (err: any) {
      processError(err);
    }
  };

  const handleNavClick = (
    pageInd: number,
    subPageInd: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.preventDefault();

    if (
      activePageInd !== Pages.ModelEvaluation &&
      pageInd === Pages.ModelEvaluation
    ) {
      predict();
    }

    if (activePageInd !== Pages.Prediction && subPageInd === Pages.Prediction) {
      validate();
    }

    setActivePageInd(pageInd);
    setActiveSubPageInd(subPageInd);
  };

  return (
    <div className="row align-items-start">
      <div className="col-2 sidebar--div">
        <AccordionSideBar
          content={pages}
          activePageInd={activePageInd}
          activeSubPageInd={activeSubPageInd}
          onNavClick={handleNavClick}
        />
      </div>
      <div className="col-10">
        {getPageComponent(activePageInd, activeSubPageInd)}
      </div>
      <CToaster push={errorMessage} placement="bottom-end" />
    </div>
  );
}
