import { capitalize } from "../../src/helpers";
import PlotlyChart from "../Plotly";

const columnRenameMap = {
  y: "Actual (y)",
  yhat1: "Prediction (yhat)",
  season_daily: "Seasonality (Daily)",
  season_weekly: "Seasonality (Weekly)",
  season_yearly: "Seasonality (Yearly)",
  // residual1: "Error (Residual)",
} as Record<string, string>;
const renameColumn = (column: string) =>
  Object.keys(columnRenameMap).includes(column)
    ? columnRenameMap[column]
    : column;

const transformPredictionData = (forecast: any): Plotly.Data[] => {
  const columnHeaders = Object.keys(forecast).filter((item) => item !== "ds");
  const x = Object.values(forecast.ds);
  const quantiles = columnHeaders.filter((colName) => {
    // TODO: Make a better check for quantiles
    return (colName.at(colName.length - 1) === "%" && colName.startsWith("yhat"));
  });
  const res: Plotly.Data[] = [];

  res.push({
    type: "scattergl",
    mode: "lines",
    name: "95% Confidence Interval",
    fillcolor: "rgba(45, 146, 255, 0.2)",
    fill: "tonexty",
    line: { color: "rgba(45, 146, 255, 0.2)", width: 1 },
    y: Object.values(forecast[quantiles[0]]),
    x,
  } as Plotly.Data);

  res.push({
    type: "scattergl",
    mode: "lines",
    showlegend: false,
    fillcolor: "rgba(45, 146, 255, 0.2)",
    fill: "tonexty",
    line: { color: "rgba(45, 146, 255, 0.2)", width: 1 },
    y: Object.values(forecast[quantiles[1]]),
    x,
  } as Plotly.Data);

  res.push({
    type: "scattergl",
    mode: "lines",
    line: { color: "#2d92ff", width: 2 },
    name: capitalize(renameColumn("yhat1")),
    y: Object.values(forecast["yhat1"]),
    x: x,
  } as Plotly.Data);

  res.push({
    type: "scattergl",
    mode: "markers",
    marker: { color: "black", size: 4 },
    name: capitalize(renameColumn("y")),
    y: Object.values(forecast["y"]),
    x,
  } as Plotly.Data);

  return res;
};

const transformSeasonalityData = (forecast: any): Plotly.Data[] => {
  const columnHeaders = Object.keys(forecast).filter((item) => item !== "ds");
  const x = Object.values(forecast.ds);
  const seasonalityHeaders = columnHeaders.filter((columnName) => {
    return columnName.startsWith("season");
  });

  const res = seasonalityHeaders.map((colName) => ({
    type: "scattergl",
    mode: "lines",
    line: { color: "#2d92ff", width: 2, shape: "spline", smoothing: 1 },
    name: capitalize(renameColumn(colName)),
    y: Object.values(forecast[colName]),
    x,
  })) as Plotly.Data[];

  return res;
};

const generateHistoryMarker = (ds: any[], forecasts: number | undefined) => {
  const offset = forecasts || 0;
  return {
    layer: "below",
    type: "rect",
    yref: "paper",
    y1: 1,
    y0: 0,
    xref: "x",
    x0: ds[ds.length - 1],
    x1: ds[ds.length - offset - 1],
    opacity: 0.25,
    fillcolor: "grey",
    line: {
      width: 0,
    },
  } as any; // as Partial<Shape>;
};

const PredictionChart = ({
  targetColumn,
  predictionData,
  forecasts,
}: {
  targetColumn: string;
  predictionData: any;
  forecasts: number | undefined;
}) => (
    <PlotlyChart
      useResizeHandler
      data={transformPredictionData(predictionData.forecast)}
      layout={{
        hovermode: "x",
        showlegend: true,
        legend: { orientation: "h", y: -0.05 },
        margin: { t: 10, r: 30 }, // b: 10, l: 30, pad: 10
        shapes: [
          generateHistoryMarker(
            Object.values(predictionData.forecast.ds),
            forecasts
          ),
        ],
        yaxis: {
          title: { text: targetColumn },
        },
      }}
      config={{
        responsive: true,
      }}
      style={{ width: "100%", minHeight: "85vh" }}
    />
);

export default PredictionChart;
