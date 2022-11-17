import {
  CCard,
  CCardBody,
  CCardText,
  CCardTitle,
  CCol,
  CContainer,
  CFormSelect,
  CRow,
} from "@coreui/react";
import Layout from "../components/Layout";
import { SELECT_STATE_NONE } from "../src/definitions";
import { useAppDispatch, useAppSelector } from "../src/hooks";
import { editModelConfig } from "../src/store/models";

export default function ModelConfig() {
  const modelConfig = useAppSelector((state) => state.models);
  const dispatch = useAppDispatch();

  return (
    <Layout>
      <CContainer>
        <CRow className="my-2">
          <CCol>
            <h1>Model</h1>
          </CCol>
        </CRow>

        <CRow xs={{ cols: 1, gutter: 4 }} md={{ cols: 2 }}>
          <CCol xs>
            <CCard className="mb-3">
              <CCardBody>
                <CCardTitle>Country holidays</CCardTitle>
                <CCardText>
                  <CFormSelect
                    key={modelConfig.countryHolidays}
                    label="Country holidays"
                    defaultValue={modelConfig.countryHolidays}
                    onChange={(e) => {
                      const newValue =
                        SELECT_STATE_NONE !== e.target.value
                          ? [e.target.value]
                          : [];
                      dispatch(editModelConfig({ countryHolidays: newValue }));
                    }}
                    options={[
                      { value: SELECT_STATE_NONE, label: "None" },
                      { value: "US", label: "United States" },
                      { value: "DE", label: "Germany" },
                    ]}
                  />
                </CCardText>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs>
            <CCard className="mb-3">
              <CCardBody>
                <CCardTitle>Lagged regressors</CCardTitle>
                <CCardText></CCardText>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs>
            <CCard className="mb-3">
              <CCardBody>
                <CCardTitle>Events</CCardTitle>
                <CCardText></CCardText>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </Layout>
  );
}
