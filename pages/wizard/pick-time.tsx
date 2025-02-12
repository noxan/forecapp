import {
  CAlert,
  CButton,
  CCol,
  CCollapse,
  CContainer,
  CRow,
} from "@coreui/react";
import { useMemo, useState } from "react";
import DatasetExplorer from "../../components/DatasetExplorer";
import LinkButton from "../../components/LinkButton";
import MissingDatasetPlaceholder from "../../components/MissingDatasetPlaceholder";
import PrimaryColumnConfig from "../../components/PrimaryColumnConfig";
import { isColumnValid } from "../../src/definitions";
import { useAppSelector } from "../../src/hooks";
import { setTimeColumn } from "../../src/store/datasets";
import { selectDataset, selectTimeColumn } from "../../src/store/selectors";
import { useRouter } from "next/router";
import { isColumnDateTime } from "../../src/data-validator";

export default function WizardTimeColumnPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [columnWarningVisible, setColumnWarningVisible] = useState(false);
  const timeColumn = useAppSelector(selectTimeColumn);
  const dataset = useAppSelector(selectDataset);
  const router = useRouter();

  const isValid = isColumnValid(timeColumn);
  const isTimeCol = useMemo(() => {
    if (!isColumnValid) return true;
    const res = isColumnDateTime(dataset, timeColumn);
    if (!res) setColumnWarningVisible(true);
    return res;
  }, [dataset, timeColumn]);

  if (!dataset) {
    return <MissingDatasetPlaceholder />;
  }

  const columns = Object.keys(dataset[0]);

  return (
    <main>
      <DatasetExplorer
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <CContainer className="mt-5">
        <CRow className="my-2">
          <CCol>
            <h2>Pick the column containing the time information.</h2>
          </CCol>
        </CRow>
        <CRow className="my-2">
          <CCol>
            <p>
              {`Info: To pick the primary time series column from a dataset, you can first identify which column contains the time series data. This can typically be done by looking at the column headers and identifying the one that represents the time variable. Once you have identified the time series column, you can select it for further analysis or visualization. Some common names for time series columns in a dataset are "time", "date", "timestamp", and "datetime."`}
            </p>
          </CCol>
        </CRow>
        <CRow className="my-2">
          <CCol>
            <PrimaryColumnConfig
              columns={columns}
              label="time"
              defaultValue={timeColumn}
              setAction={setTimeColumn}
            />
          </CCol>
        </CRow>
        <CAlert
          dismissible
          color="danger"
          visible={columnWarningVisible}
          onClose={() => setColumnWarningVisible(false)}
        >
          The selected column isn&apos;t a valid time column. Choose another, or
          try editing the dataset!
        </CAlert>
        <CRow className="my-2">
          <CCol>
            <LinkButton
              color="primary"
              disabled={!isValid}
              href="/wizard/pick-target"
            >
              Confirm
            </LinkButton>

            <CButton
              color="primary"
              variant="ghost"
              onClick={() => router.back()}
              className="mx-2"
            >
              Back
            </CButton>
          </CCol>
        </CRow>
        <CRow className="my-4">
          <CCol>
            <div>You can also explore the dataset in detail.</div>
            <CButton onClick={() => setModalVisible(true)} variant="outline">
              Browse dataset
            </CButton>
          </CCol>
        </CRow>
      </CContainer>
    </main>
  );
}
