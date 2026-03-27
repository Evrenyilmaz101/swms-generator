// PDF Stylesheet for @react-pdf/renderer
// Uses Yoga flexbox layout engine (not CSS)

import { StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

// Register fonts
const fontDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontDir, "Inter-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(fontDir, "Inter-SemiBold.ttf"), fontWeight: "semibold" },
    { src: path.join(fontDir, "Inter-Bold.ttf"), fontWeight: "bold" },
  ],
});

// Disable hyphenation (looks terrible in tables)
Font.registerHyphenationCallback((word) => [word]);

// Color palette -- high-vis construction theme
export const COLORS = {
  primary: "#1e293b", // Dark navy/slate
  accent: "#f59e0b", // High-vis amber/yellow
  accentDark: "#d97706",
  white: "#ffffff",
  gray50: "#f8fafc",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
  gray300: "#cbd5e1",
  gray500: "#64748b",
  gray700: "#334155",
  gray900: "#0f172a",
  green: "#16a34a",
  greenLight: "#dcfce7",
  red: "#dc2626",
  redLight: "#fef2f2",
  orange: "#ea580c",
  orangeLight: "#fff7ed",
  yellow: "#ca8a04",
  yellowLight: "#fefce8",
};

export const styles = StyleSheet.create({
  // Page
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: COLORS.gray900,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },

  // Header
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  headerLeft: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 2,
  },
  companyDetail: {
    fontSize: 8,
    color: COLORS.gray500,
    marginBottom: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 7,
    color: COLORS.gray500,
    marginBottom: 1,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
    marginBottom: 4,
  },

  // Compliance stamp
  complianceStamp: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.greenLight,
    borderWidth: 1,
    borderColor: COLORS.green,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  complianceStampText: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.green,
  },

  // Section headers
  sectionHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.white,
  },

  // Sub-section
  subHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 4,
  },

  // Body text
  bodyText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: COLORS.gray700,
    marginBottom: 4,
  },

  // Info grid (site details)
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  infoCell: {
    width: "50%",
    paddingVertical: 3,
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.gray500,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 9,
    color: COLORS.gray900,
  },

  // Tables
  table: {
    marginBottom: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    minHeight: 24,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
  },
  tableRowAlt: {
    flexDirection: "row",
    minHeight: 20,
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
  },
  tableHeaderCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.white,
  },
  tableCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  tableCellText: {
    fontSize: 7.5,
    color: COLORS.gray700,
    lineHeight: 1.3,
  },

  // Risk badges
  riskBadge: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  riskBadgeText: {
    fontSize: 6.5,
    fontWeight: "bold",
    textAlign: "center",
  },

  // HRCW checklist
  hrcwItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    paddingLeft: 4,
  },
  hrcwCheckbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    marginRight: 6,
    marginTop: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hrcwCheckboxChecked: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent,
    marginRight: 6,
    marginTop: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hrcwCheckmark: {
    fontSize: 7,
    color: COLORS.white,
    fontWeight: "bold",
  },
  hrcwText: {
    fontSize: 8,
    color: COLORS.gray700,
    flex: 1,
  },

  // Bullet list
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 8,
    color: COLORS.accent,
    marginRight: 6,
    width: 8,
  },
  bulletText: {
    fontSize: 8,
    color: COLORS.gray700,
    flex: 1,
    lineHeight: 1.3,
  },

  // Signature block
  signatureTable: {
    marginTop: 8,
  },
  signatureRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
    minHeight: 36,
  },
  signatureCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
    borderRightWidth: 0.5,
    borderRightColor: COLORS.gray200,
  },
  signatureLabel: {
    fontSize: 7,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  signatureLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
    height: 16,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray200,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.gray500,
  },
  pageNumber: {
    fontSize: 7,
    color: COLORS.gray500,
  },
});
