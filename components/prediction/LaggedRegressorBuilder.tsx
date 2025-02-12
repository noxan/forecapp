import { CBadge, CFormSelect } from "@coreui/react";
import { capitalize } from "../../src/helpers";

type LaggedRegressorBuilderProps = {
  laggedRegressorColumns: string[];
  modelConfiguration: any;
  updateConfig: (config: any) => void;
};

const LaggedRegressorBuilder = ({
  laggedRegressorColumns,
  modelConfiguration,
  updateConfig,
}: LaggedRegressorBuilderProps) => (
  <>
    <div>
      {modelConfiguration?.laggedRegressors.map(
        (laggedRegressor: any, index: number) => (
          <CBadge
            key={`${laggedRegressor.name}-${index}`}
            color="secondary"
            style={{ cursor: "not-allowed", marginRight: "0.25rem" }}
            onClick={() =>
              updateConfig({
                laggedRegressors: (
                  modelConfiguration?.laggedRegressors || []
                ).filter((item: any) => item.name !== laggedRegressor.name),
              })
            }
          >
            {capitalize(laggedRegressor.name)}
          </CBadge>
        )
      )}
    </div>
    <CFormSelect
      className="mt-2"
      onChange={async (evt) => {
        const value = evt.target.value;
        if (value !== "Add regressor column") {
          if (!modelConfiguration?.laggedRegressors.includes(value)) {
            await updateConfig({
              laggedRegressors: [
                { name: value },
                ...(modelConfiguration?.laggedRegressors || []),
              ],
            });
          }
          evt.target.value = "Add regressor column";
        }
      }}
    >
      <option>Add regressor column</option>
      {laggedRegressorColumns.map((column: any) => (
        <option key={column} value={column}>
          {capitalize(column)}
        </option>
      ))}
    </CFormSelect>
  </>
);

export default LaggedRegressorBuilder;

{
  /* <CFormSelect>
  <option value="0">Select a column...</option>
  {columnHeaders
    .filter((column) => column !== timeColumn && column !== targetColumn)
    .map((column) => (
      <option key={column} value={column}>
        {column}
      </option>
    ))}
</CFormSelect>; */
}
