// Watermark overlay for preview PDFs
// Renders large diagonal "PREVIEW" text to prevent unauthorized use

import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const watermarkStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  row: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 80,
  },
  text: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#D32F2F",
    opacity: 0.12,
    transform: "rotate(-35deg)",
    textAlign: "center",
    letterSpacing: 8,
  },
  subtext: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D32F2F",
    opacity: 0.12,
    transform: "rotate(-35deg)",
    textAlign: "center",
    letterSpacing: 4,
    marginTop: 4,
  },
});

export function PdfWatermark() {
  return (
    <View style={watermarkStyles.container} fixed>
      <View style={watermarkStyles.row}>
        <Text style={watermarkStyles.text}>PREVIEW</Text>
        <Text style={watermarkStyles.subtext}>NOT FOR SITE USE</Text>
      </View>
      <View style={watermarkStyles.row}>
        <Text style={watermarkStyles.text}>PREVIEW</Text>
        <Text style={watermarkStyles.subtext}>NOT FOR SITE USE</Text>
      </View>
    </View>
  );
}
