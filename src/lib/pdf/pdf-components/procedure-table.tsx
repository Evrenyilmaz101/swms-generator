// PDF Procedure Table: The main SWMS table with steps, hazards, risks, controls

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles, COLORS } from "../pdf-styles";
import type { ProcedureStep, RiskRating } from "@/types/swms";

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
    <View
      style={[
        styles.riskBadge,
        { backgroundColor: color.bg },
      ]}
    >
      <Text style={[styles.riskBadgeText, { color: color.text }]}>
        {rating}
      </Text>
    </View>
  );
}

export function PdfProcedureTable({ steps }: ProcedureTableProps) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>
          Work Procedure — Hazards, Risk Assessment & Control Measures
        </Text>
      </View>

      <View style={styles.table}>
        {/* Table header */}
        <View style={styles.tableHeaderRow} wrap={false}>
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

        {/* Table rows */}
        {steps.map((step, index) => (
          <View
            key={step.step_number}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
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
              <Text
                style={[
                  styles.tableCellText,
                  { fontSize: 6, marginBottom: 2 },
                ]}
              >
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
              <Text
                style={[
                  styles.tableCellText,
                  { fontSize: 6, marginBottom: 2 },
                ]}
              >
                {step.residual_risk.likelihood} /{" "}
                {step.residual_risk.consequence}
              </Text>
              <RiskBadge rating={step.residual_risk.rating} />
            </View>

            <View style={[styles.tableCell, { width: COL.responsible }]}>
              <Text style={styles.tableCellText}>{step.responsible}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}
