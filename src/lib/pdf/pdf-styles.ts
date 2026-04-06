// PDF Stylesheet for @react-pdf/renderer
// Professional SWMS document — matches Pencil design
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

// Color palette — professional SWMS document
export const COLORS = {
  // Primary
  navy: "#0E2A4D",
  navyLight: "#1E4A7A",
  orange: "#E87722",
  white: "#ffffff",

  // Grays
  gray50: "#F8F9FA",
  gray100: "#EEF2F6",
  gray200: "#D0D5DD",
  gray300: "#A8A29E",
  gray500: "#555555",
  gray700: "#333333",
  gray900: "#1A1A1A",

  // Risk colors
  riskLow: "#4CAF50",
  riskLowBg: "#E8F5E9",
  riskModerate: "#FDD835",
  riskModerateBg: "#FFFDE7",
  riskHigh: "#FB8C00",
  riskHighBg: "#FFF3E0",
  riskExtreme: "#D32F2F",
  riskExtremeBg: "#FFEBEE",

  // Hierarchy of controls
  hocEliminate: "#2E7D32",
  hocSubstitute: "#388E3C",
  hocIsolate: "#689F38",
  hocEngineering: "#FBC02D",
  hocAdmin: "#F57C00",
  hocPpe: "#D32F2F",

  // Status
  green: "#2E7D32",
  greenBg: "#E8F5E9",
};

export const styles = StyleSheet.create({
  // Page
  page: {
    fontFamily: "Inter",
    fontSize: 8,
    color: COLORS.gray900,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },

  // ===== PAGE HEADER (navy bar, every page) =====
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.navy,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  pageHeaderSmall: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.navy,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  pageHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  companyAbn: {
    fontSize: 8,
    color: "#FFFFFFCC",
  },
  pageHeaderRight: {
    alignItems: "flex-end",
  },
  docLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.orange,
    letterSpacing: 1,
  },
  docId: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  docRev: {
    fontSize: 8,
    color: "#FFFFFFCC",
  },

  // ===== TITLE BAR =====
  titleBar: {
    backgroundColor: COLORS.gray100,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.navy,
    letterSpacing: 2,
  },
  titleSubtext: {
    fontSize: 9,
    fontWeight: "semibold",
    color: COLORS.gray500,
    letterSpacing: 3,
    marginTop: 2,
  },

  // ===== CONTENT AREA =====
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  // ===== SECTION CARDS =====
  sectionCard: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 3,
    marginBottom: 10,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: COLORS.navy,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 1,
  },
  sectionHeaderNote: {
    fontSize: 7,
    color: "#FFFFFFAA",
  },
  sectionBody: {
    padding: 10,
  },

  // Emergency section header (red)
  sectionHeaderEmergency: {
    backgroundColor: COLORS.riskExtreme,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // ===== TWO COLUMN LAYOUT =====
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  colHalf: {
    flex: 1,
  },

  // ===== INFO ROWS (label: value) =====
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
    gap: 6,
  },
  infoLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLORS.gray500,
    width: 75,
  },
  infoValue: {
    fontSize: 8,
    fontWeight: "semibold",
    color: COLORS.gray900,
    flex: 1,
  },

  // ===== BODY TEXT =====
  bodyText: {
    fontSize: 8,
    lineHeight: 1.5,
    color: COLORS.gray700,
    marginBottom: 4,
  },

  // ===== TABLES =====
  table: {
    marginBottom: 0,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    minHeight: 20,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
  },
  tableRowAlt: {
    flexDirection: "row",
    minHeight: 18,
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
  },
  tableHeaderCell: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  tableHeaderText: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  tableCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  tableCellText: {
    fontSize: 7,
    color: COLORS.gray700,
    lineHeight: 1.3,
  },

  // ===== RISK BADGES =====
  riskBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  riskBadgeText: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },

  // ===== HRCW CHECKLIST =====
  hrcwGrid: {
    flexDirection: "row",
    gap: 8,
  },
  hrcwCol: {
    flex: 1,
  },
  hrcwItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  hrcwCheckbox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 1,
    marginRight: 6,
    marginTop: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hrcwCheckboxChecked: {
    width: 9,
    height: 9,
    borderRadius: 1,
    backgroundColor: COLORS.navy,
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
    fontSize: 7,
    color: COLORS.gray700,
    flex: 1,
    lineHeight: 1.2,
  },
  hrcwTextBold: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.gray900,
    flex: 1,
    lineHeight: 1.2,
  },

  // ===== BULLET LIST =====
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bullet: {
    fontSize: 8,
    color: COLORS.orange,
    marginRight: 6,
    width: 8,
  },
  bulletText: {
    fontSize: 8,
    color: COLORS.gray700,
    flex: 1,
    lineHeight: 1.4,
  },

  // ===== SIGNATURE TABLE =====
  signatureTable: {
    marginTop: 0,
  },
  signatureRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
    minHeight: 32,
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
    borderBottomColor: COLORS.gray200,
    height: 16,
  },

  // ===== PPE GRID =====
  ppeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  ppeItem: {
    width: "18%",
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 3,
    padding: 6,
    alignItems: "center",
    gap: 2,
  },
  ppeItemRequired: {
    width: "18%",
    borderWidth: 2,
    borderColor: COLORS.navy,
    backgroundColor: COLORS.gray50,
    borderRadius: 3,
    padding: 6,
    alignItems: "center",
    gap: 2,
  },

  // ===== TOOLBOX TALK =====
  toolboxTalkBox: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 3,
    padding: 10,
    marginBottom: 8,
  },

  // ===== HIERARCHY OF CONTROLS =====
  hocBar: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  hocNum: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.white,
  },
  hocText: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.white,
  },
  hocTextDark: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.gray900,
  },

  // ===== FOOTER =====
  footer: {
    position: "absolute",
    bottom: 15,
    left: 24,
    right: 24,
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
    fontWeight: "semibold",
    color: COLORS.gray500,
  },
});
