import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CButton,
  CCollapse,
  CNavGroup,
  CNavItem,
  CNavLink,
  CSidebar,
  CSidebarNav,
} from "@coreui/react";
import HomeIcon from "@mui/icons-material/Home";
import PredictionConfigCard, {
  PredictionConfig,
} from "../prediction/PredictionConfigCard";
import { useState } from "react";

export type SideBarProps = {
  activePageInd: number;
  activeSubPageInd: number;
  chartConfig: PredictionConfig;
  onNavClick: (
    pageInd: number,
    subPageInd: number,
    event: React.MouseEvent<HTMLElement>
  ) => void;
  onPredictionConfigChange: (newConfig: PredictionConfig) => void;
};

export default function SideBar(props: SideBarProps) {
  return (
    <CSidebar position="sticky">
      <CSidebarNav>
        <CNavItem href="/">
          <HomeIcon
            sx={{
              width: "2em",
              alignContent: "center",
              justifyContent: "flex-start",
              display: "flex",
            }}
          />
          Home
        </CNavItem>
        <CNavGroup toggler={"Data Selector"} key="Data Selector">
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 0 && props.activeSubPageInd === 0}
              onClick={(event) => {
                props.onNavClick(0, 0, event);
              }}
            >
              Data Selector
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 0 && props.activeSubPageInd === 1}
              onClick={(event) => {
                props.onNavClick(0, 1, event);
              }}
            >
              View Data
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 0 && props.activeSubPageInd === 2}
              onClick={(event) => {
                props.onNavClick(0, 2, event);
              }}
            >
              Visualize Data
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 0 && props.activeSubPageInd === 3}
              onClick={(event) => {
                props.onNavClick(0, 3, event);
              }}
            >
              Table View
            </CNavLink>
          </CNavItem>
        </CNavGroup>
        <CNavGroup toggler={"Model Configuration"} key="Model Configuration">
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 1 && props.activeSubPageInd === 0}
              onClick={(event) => {
                props.onNavClick(1, 0, event);
              }}
            >
              Prediction Configuration
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 1 && props.activeSubPageInd === 1}
              onClick={(event) => {
                props.onNavClick(1, 1, event);
              }}
            >
              Dataset Info
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 1 && props.activeSubPageInd === 2}
              onClick={(event) => {
                props.onNavClick(1, 2, event);
              }}
            >
              Underlying Trends
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 1 && props.activeSubPageInd === 3}
              onClick={(event) => {
                props.onNavClick(1, 3, event);
              }}
            >
              Modeling Assumptions
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 1 && props.activeSubPageInd === 4}
              onClick={(event) => {
                props.onNavClick(1, 4, event);
              }}
            >
              Training Configuration
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 1 && props.activeSubPageInd === 5}
              onClick={(event) => {
                props.onNavClick(1, 5, event);
              }}
            >
              Validation Configuration
            </CNavLink>
          </CNavItem>
        </CNavGroup>
        <CNavGroup toggler={"Model Evaluation"} key="Model Evaluation">
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 2 && props.activeSubPageInd === 1}
              onClick={(event) => {
                props.onNavClick(2, 1, event);
              }}
            >
              Test Train Split
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={props.activePageInd === 2 && props.activeSubPageInd === 2}
              onClick={(event) => {
                props.onNavClick(2, 2, event);
              }}
            >
              Previous Performance
            </CNavLink>
          </CNavItem>
        </CNavGroup>
        <CNavItem>
          <CNavLink
            active={props.activePageInd === 3}
            onClick={(event) => {
              props.onNavClick(3, -1, event);
            }}
          >
            Prediction
          </CNavLink>
        </CNavItem>
        <CCollapse visible={props.activePageInd === 3}>
          <PredictionConfigCard
            key="prediction-card"
            config={props.chartConfig}
            updateConfig={props.onPredictionConfigChange}
          />
        </CCollapse>
      </CSidebarNav>
    </CSidebar>
  );
}
