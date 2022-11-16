import { CBadge, CButton, CCol, CFormInput, CRow } from "@coreui/react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../src/store";
import { importDatasetWithReset } from "../src/store/datasets";

const examplePath = "datasets/";
const exampleDatasets = ["energy_dataset_small.csv", "air_passengers.csv"];

const DatasetImporter = () => {
  const status = useSelector((state: RootState) => state.datasets.status);
  const dispatch = useDispatch<AppDispatch>();
  return (
    <CRow>
      {exampleDatasets.map((exampleDatasetUrl) => (
        <CCol key={exampleDatasetUrl}>
          <CButton
            onClick={() =>
              dispatch(
                importDatasetWithReset({
                  source: examplePath + exampleDatasetUrl,
                })
              )
            }
            disabled={status === "loading"}
            className="m-1"
          >
            Import {exampleDatasetUrl}
          </CButton>
        </CCol>
      ))}
      <CCol>
        <CFormInput
          type="file"
          onChange={(evt) => {
            if (evt.target.files && evt.target.files.length > 0) {
              return dispatch(
                importDatasetWithReset({ source: evt.target.files[0] })
              );
            }
          }}
        />
      </CCol>
      <CCol>
        <CBadge color="dark">{status}</CBadge>
      </CCol>
    </CRow>
  );
};

export default DatasetImporter;
