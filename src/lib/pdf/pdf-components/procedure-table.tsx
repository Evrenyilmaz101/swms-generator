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

function StepRow({ step, index, isLast }: { step: ProcedureStep; index: number; isLast: boolean }) {
  return (
    <View
      style={[
        index % 2 === 0 ? styles.tableRow : styles.tableRowAlt,
        SIDE_BORDERS,
        isLast ? { borderBottomWidth: 1, borderBottomColor: COLORS.gray200 } : {},
      ]}
      wrap={false}
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
  return (
    <View style={{ marginBottom: 10 }}>
      {/* Section header + column header + first row stay together — a header
          with no rows under it is never acceptable at a page bottom */}
      <View wrap={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>
            JOB STEPS — HAZARDS, RISKS & CONTROLS
          </Text>
          <Text style={styles.sectionHeaderNote}>
            IR = Initial Risk  |  RR = Residual Risk
          </Text>
        </View>
        <ColumnHeader />
        {first && <StepRow step={first} index={0} isLast={rest.length === 0} />}
      </View>
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
