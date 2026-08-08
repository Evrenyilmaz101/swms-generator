// PDF Procedure Table: The main SWMS table with steps, hazards, risks, controls
//
// Page-break rules: the section header + column header are wrapped with the
// FIRST row so they can never strand at a page bottom, and each row carries
// its own side borders — an outer bordered container would paint empty
// "phantom boxes" wherever the table breaks across pages.

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles, COLORS } from "../pdf-styles";
import type { ProcedureStep } from "@/types/swms";

interface ProcedureTableProps {
  steps: ProcedureStep[];
}

// Column widths as percentages
const COL = {
  step: "5%",
  activity: "17%",
  hazards: "18%",
  initialRisk: "10%",
  controls: "28%",
  residualRisk: "10%",
  responsible: "12%",
} as const;

const SIDE_BORDERS = {
  borderLeftWidth: 1,
  borderLeftColor: COLORS.gray200,
  borderRightWidth: 1,
  borderRightColor: COLORS.gray200,
} as const;

function getRiskColor(rating: string): { bg: string; text: string } {
  switch (rating) {
    case "Low":
      return { bg: COLORS.riskLowBg, text: COLORS.riskLow };
    case "Medium":
      return { bg: COLORS.riskModerateBg, text: "#B8860B" };
    case "High":
      return { bg: COLORS.riskHighBg, text: COLORS.riskHigh };
    case "Very High":
      return { bg: COLORS.riskExtremeBg, text: COLORS.riskExtreme };
    case "Extreme":
      return { bg: "#450a0a", text: COLORS.white };
    default:
      return { bg: COLORS.gray100, text: COLORS.gray700 };
  }
}

function RiskBadge({ rating }: { rating: string }) {
  const color = getRiskColor(rating);
  return (
    <View style={[styles.riskBadge, { backgroundColor: color.bg }]}>
      <Text style={[styles.riskBadgeText, { color: color.text }]}>
        {rating}
      </Text>
    </View>
  );
}

/**
 * Rough render-height estimate (pt) from content volume. Used to decide
 * page-break behaviour: short rows move to the next page as a unit, but
 * tall rows are allowed to continue across the break — an unbreakable
 * 400pt row would otherwise leave a huge blank tail on the page before.
 */
function estimateRowHeight(step: ProcedureStep): number {
  // chars-per-line calibrated against rendered output (Inter 7pt in the
  // actual column widths) — err low so tall rows are classed as breakable
  const lines = (texts: string[], charsPerLine: number) =>
    texts.reduce((n, t) => n + Math.max(1, Math.ceil(t.length / charsPerLine)), 0);
  const controlLines = lines(step.controls, 30);
  const hazardLines = lines(step.hazards, 20);
  const activityLines = Math.ceil(step.activity.length / 16);
  const maxLines = Math.max(controlLines, hazardLines, activityLines, 4);
  return maxLines * 9.4 + step.controls.length * 2 + 12;
}

const ROW_SPLIT_THRESHOLD = 220; // rows taller than this may break across pages

function StepRow({ step, index, isLast }: { step: ProcedureStep; index: number; isLast: boolean }) {
  return (
    <View
      style={[
        index % 2 === 0 ? styles.tableRow : styles.tableRowAlt,
        SIDE_BORDERS,
        isLast ? { borderBottomWidth: 1, borderBottomColor: COLORS.gray200 } : {},
      ]}
      // minPresenceAhead must stay SMALL here: it forbids breaks within N pts
      // of the row's top, so a large value forbids a tall row's own split and
      // shoves it whole to the next page (the blank-tail bug). 36pt only
      // stops a row starting as a sub-3-line sliver at the page bottom.
      minPresenceAhead={36}
      wrap={estimateRowHeight(step) > ROW_SPLIT_THRESHOLD}
    >
      <View style={[styles.tableCell, { width: COL.step }]}>
        <Text style={[styles.tableCellText, { fontWeight: "bold" }]}>
          {step.step_number}
        </Text>
      </View>

      <View style={[styles.tableCell, { width: COL.activity }]}>
        <Text style={styles.tableCellText}>{step.activity}</Text>
      </View>

      <View style={[styles.tableCell, { width: COL.hazards }]}>
        {step.hazards.map((hazard, i) => (
          <Text key={i} style={[styles.tableCellText, { marginBottom: 2 }]}>
            • {hazard}
          </Text>
        ))}
      </View>

      <View style={[styles.tableCell, { width: COL.initialRisk }]}>
        <Text style={[styles.tableCellText, { fontSize: 6, marginBottom: 2 }]}>
          {step.initial_risk.likelihood} / {step.initial_risk.consequence}
        </Text>
        <RiskBadge rating={step.initial_risk.rating} />
      </View>

      <View style={[styles.tableCell, { width: COL.controls }]}>
        {step.controls.map((control, i) => (
          <Text key={i} style={[styles.tableCellText, { marginBottom: 2 }]}>
            {control}
          </Text>
        ))}
      </View>

      <View style={[styles.tableCell, { width: COL.residualRisk }]}>
        <Text style={[styles.tableCellText, { fontSize: 6, marginBottom: 2 }]}>
          {step.residual_risk.likelihood} / {step.residual_risk.consequence}
        </Text>
        <RiskBadge rating={step.residual_risk.rating} />
      </View>

      <View style={[styles.tableCell, { width: COL.responsible }]}>
        <Text style={styles.tableCellText}>{step.responsible}</Text>
      </View>
    </View>
  );
}

function ColumnHeader() {
  return (
    <View style={[styles.tableHeaderRow, SIDE_BORDERS, { borderLeftColor: COLORS.navy, borderRightColor: COLORS.navy }]}>
      <View style={[styles.tableHeaderCell, { width: COL.step }]}>
        <Text style={styles.tableHeaderText}>No.</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COL.activity }]}>
        <Text style={styles.tableHeaderText}>Work Activity</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COL.hazards }]}>
        <Text style={styles.tableHeaderText}>Hazards</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COL.initialRisk }]}>
        <Text style={styles.tableHeaderText}>Initial Risk</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COL.controls }]}>
        <Text style={styles.tableHeaderText}>Control Measures</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COL.residualRisk }]}>
        <Text style={styles.tableHeaderText}>Residual Risk</Text>
      </View>
      <View style={[styles.tableHeaderCell, { width: COL.responsible }]}>
        <Text style={styles.tableHeaderText}>Responsible</Text>
      </View>
    </View>
  );
}

export function PdfProcedureTable({ steps }: ProcedureTableProps) {
  const [first, ...rest] = steps;
  const firstIsTall = first ? estimateRowHeight(first) > ROW_SPLIT_THRESHOLD : false;

  const headers = (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>
          JOB STEPS — HAZARDS, RISKS & CONTROLS
        </Text>
        <Text style={styles.sectionHeaderNote}>
          IR = Initial Risk  |  RR = Residual Risk
        </Text>
      </View>
      <ColumnHeader />
    </>
  );

  return (
    <View style={{ marginBottom: 10 }}>
      {/* A header with no rows under it is never acceptable at a page bottom.
          Short first row: glue it to the headers as one unbreakable unit.
          Tall first row: it may split across pages, so instead demand enough
          space below the headers that the row visibly starts beneath them. */}
      {firstIsTall ? (
        <>
          <View wrap={false} minPresenceAhead={160}>{headers}</View>
          {first && <StepRow step={first} index={0} isLast={rest.length === 0} />}
        </>
      ) : (
        <View wrap={false}>
          {headers}
          {first && <StepRow step={first} index={0} isLast={rest.length === 0} />}
        </View>
      )}
      {rest.map((step, i) => (
        <StepRow
          key={step.step_number}
          step={step}
          index={i + 1}
          isLast={i === rest.length - 1}
        />
      ))}
    </View>
  );
}
