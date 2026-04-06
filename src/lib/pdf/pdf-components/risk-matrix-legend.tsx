// PDF Risk Matrix Legend: 5x5 matrix showing how risk ratings are calculated

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { COLORS } from "../pdf-styles";

const LIKELIHOODS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
const CONSEQUENCES = ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"];

// Same matrix as risk-matrix.ts
const MATRIX: Record<string, Record<string, string>> = {
  Rare: { Insignificant: "Low", Minor: "Low", Moderate: "Low", Major: "Medium", Catastrophic: "Medium" },
  Unlikely: { Insignificant: "Low", Minor: "Low", Moderate: "Medium", Major: "High", Catastrophic: "High" },
  Possible: { Insignificant: "Low", Minor: "Medium", Moderate: "High", Major: "High", Catastrophic: "Very High" },
  Likely: { Insignificant: "Low", Minor: "Medium", Moderate: "High", Major: "Very High", Catastrophic: "Extreme" },
  "Almost Certain": { Insignificant: "Medium", Minor: "High", Moderate: "Very High", Major: "Extreme", Catastrophic: "Extreme" },
};

function getCellColor(rating: string) {
  switch (rating) {
    case "Low": return { bg: COLORS.riskLowBg, text: COLORS.riskLow };
    case "Medium": return { bg: COLORS.riskModerateBg, text: "#B8860B" };
    case "High": return { bg: COLORS.riskHighBg, text: COLORS.riskHigh };
    case "Very High": return { bg: COLORS.riskExtremeBg, text: COLORS.riskExtreme };
    case "Extreme": return { bg: "#450a0a", text: COLORS.white };
    default: return { bg: COLORS.gray100, text: COLORS.gray700 };
  }
}

const s = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 4 },
  title: { fontSize: 8, fontWeight: "bold", color: COLORS.navy, marginBottom: 4 },
  table: { borderWidth: 0.5, borderColor: COLORS.gray200 },
  row: { flexDirection: "row" },
  headerCell: {
    width: "16.6%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    backgroundColor: COLORS.navy,
    justifyContent: "center",
    alignItems: "center",
  },
  labelCell: {
    width: "16.6%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    width: "16.6%",
    paddingVertical: 3,
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: COLORS.gray200,
  },
  headerText: { fontSize: 5.5, fontWeight: "bold", color: COLORS.white, textAlign: "center" },
  labelText: { fontSize: 5.5, fontWeight: "semibold", color: COLORS.gray700, textAlign: "center" },
  cellText: { fontSize: 5, fontWeight: "bold", textAlign: "center" },
  legend: { flexDirection: "row", marginTop: 4, gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  legendDot: { width: 6, height: 6, borderRadius: 1 },
  legendText: { fontSize: 5.5, color: COLORS.gray500 },
});

export function PdfRiskMatrixLegend() {
  return (
    <View style={s.container}>
      <Text style={s.title}>Risk Assessment Matrix (5×5) — Likelihood × Consequence</Text>
      <View style={s.table}>
        {/* Header row */}
        <View style={s.row}>
          <View style={s.headerCell}>
            <Text style={s.headerText}>Likelihood ↓</Text>
          </View>
          {CONSEQUENCES.map((c) => (
            <View key={c} style={s.headerCell}>
              <Text style={s.headerText}>{c}</Text>
            </View>
          ))}
        </View>
        {/* Matrix rows */}
        {[...LIKELIHOODS].reverse().map((likelihood) => (
          <View key={likelihood} style={s.row}>
            <View style={s.labelCell}>
              <Text style={s.labelText}>{likelihood}</Text>
            </View>
            {CONSEQUENCES.map((consequence) => {
              const rating = MATRIX[likelihood][consequence];
              const color = getCellColor(rating);
              return (
                <View key={consequence} style={[s.cell, { backgroundColor: color.bg }]}>
                  <Text style={[s.cellText, { color: color.text }]}>{rating}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      {/* Legend */}
      <View style={s.legend}>
        {["Low", "Medium", "High", "Very High", "Extreme"].map((rating) => {
          const color = getCellColor(rating);
          return (
            <View key={rating} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: color.bg, borderWidth: 0.5, borderColor: color.text }]} />
              <Text style={s.legendText}>{rating}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
