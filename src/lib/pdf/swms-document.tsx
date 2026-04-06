// Master SWMS PDF Document
// Matches Pencil design — navy headers, section cards, professional layout
// Composes all PDF components into a complete A4 document

import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, COLORS } from "./pdf-styles";
import { PdfHeader, PdfTitleBar, PdfDetailsBlock } from "./pdf-components/header";
import { PdfHrcwChecklist } from "./pdf-components/hrcw-checklist";
import { PdfProcedureTable } from "./pdf-components/procedure-table";
import { PdfRiskMatrixLegend } from "./pdf-components/risk-matrix-legend";
import { PdfSignatureBlock, type DigitalSignature } from "./pdf-components/signature-block";
import { PdfFooter } from "./pdf-components/footer";
import { PdfWatermark } from "./pdf-components/watermark";
import type { SwmsDocument } from "@/types/swms";

interface SwmsPdfDocumentProps {
  doc: SwmsDocument;
  watermark?: boolean;
  signatures?: DigitalSignature[];
  signOffUrl?: string;
  signOffQrBase64?: string;
}

export function SwmsPdfDocument({ doc, watermark, signatures, signOffUrl, signOffQrBase64 }: SwmsPdfDocumentProps) {
  const { swms_data } = doc;

  return (
    <Document
      title={`SWMS - ${doc.business_name} - ${doc.document_reference}`}
      author={doc.business_name}
      subject="Safe Work Method Statement"
      creator="Instant SWMS"
    >
      <Page size="A4" style={styles.page}>
        {/* Watermark overlay (preview mode only) */}
        {watermark && <PdfWatermark />}

        {/* Fixed footer on every page */}
        <PdfFooter
          documentReference={doc.document_reference}
          businessName={doc.business_name}
          abn={doc.abn}
        />

        {/* ===== PAGE 1: Header + Details + HRCW + Scope + Training ===== */}
        <PdfHeader doc={doc} />
        <PdfTitleBar />
        <PdfDetailsBlock doc={doc} />

        {/* HRCW Checklist */}
        <View style={styles.content}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>HIGH RISK CONSTRUCTION WORK (HRCW) — APPLICABLE CATEGORIES</Text>
              <Text style={styles.sectionHeaderNote}>Reg. 291</Text>
            </View>
            <View style={styles.sectionBody}>
              <PdfHrcwChecklist selectedActivities={swms_data.hrcw_activities} />
            </View>
          </View>

          {/* Scope of Work */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>SCOPE OF WORK</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.bodyText}>{swms_data.scope_of_work}</Text>
            </View>
          </View>

          {/* Training & Competency */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>TRAINING, LICENCES & COMPETENCY</Text>
            </View>
            <View style={styles.sectionBody}>
              {swms_data.training_competency.map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bullet}>▸</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ===== PPE Requirements ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>PERSONAL PROTECTIVE EQUIPMENT (PPE)</Text>
            </View>
            <View style={styles.sectionBody}>
              {swms_data.ppe_requirements.map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bullet}>▸</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ===== Plant & Equipment ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>PLANT, EQUIPMENT & MATERIALS</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow} wrap={false}>
                <View style={[styles.tableHeaderCell, { width: "30%" }]}>
                  <Text style={styles.tableHeaderText}>ITEM</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: "55%" }]}>
                  <Text style={styles.tableHeaderText}>PRE-USE CHECK</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: "15%" }]}>
                  <Text style={styles.tableHeaderText}>TEST & TAG</Text>
                </View>
              </View>
              {swms_data.plant_equipment.map((item, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
                  <View style={[styles.tableCell, { width: "30%" }]}>
                    <Text style={[styles.tableCellText, { fontWeight: "semibold" }]}>{item.item}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: "55%" }]}>
                    <Text style={styles.tableCellText}>{item.pre_use_checks}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: "15%" }]}>
                    <Text style={styles.tableCellText}>—</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ===== Risk Matrix + Hierarchy of Controls ===== */}
          <PdfRiskMatrixLegend />

          {/* ===== MAIN PROCEDURE TABLE ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>JOB STEPS — HAZARDS, RISKS & CONTROLS</Text>
              <Text style={styles.sectionHeaderNote}>IR = Initial Risk  |  RR = Residual Risk</Text>
            </View>
            <PdfProcedureTable steps={swms_data.steps} />
          </View>

          {/* ===== EMERGENCY PROCEDURES ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderEmergency}>
              <Text style={[styles.sectionHeaderText, { letterSpacing: 1 }]}>⚠ EMERGENCY PROCEDURES & CONTACTS</Text>
            </View>
            <View style={styles.sectionBody}>
              <View style={styles.twoCol}>
                <View style={styles.colHalf}>
                  <Text style={[styles.bodyText, { fontWeight: "bold", fontSize: 7, letterSpacing: 0.5, color: COLORS.navy, marginBottom: 4 }]}>
                    EVACUATION & INCIDENT RESPONSE
                  </Text>
                  {swms_data.emergency_procedures.map((proc, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bullet}>{i + 1}.</Text>
                      <Text style={styles.bulletText}>{proc}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.colHalf}>
                  <Text style={[styles.bodyText, { fontWeight: "bold", fontSize: 7, letterSpacing: 0.5, color: COLORS.navy, marginBottom: 4 }]}>
                    EMERGENCY CONTACTS
                  </Text>
                  {swms_data.emergency_contacts.map((contact, i) => (
                    <View key={i} style={[styles.infoRow, { marginBottom: 3 }]}>
                      <Text style={[styles.infoLabel, { width: 85 }]}>{contact.role}</Text>
                      <Text style={styles.infoValue}>{contact.contact}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* ===== COMMUNICATION & CONSULTATION ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>COMMUNICATION & CONSULTATION</Text>
            </View>
            <View style={styles.sectionBody}>
              {swms_data.communication_consultation.map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bullet}>▸</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ===== ENVIRONMENTAL CONDITIONS ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>ENVIRONMENTAL CONDITIONS & SITE CONSIDERATIONS</Text>
            </View>
            <View style={styles.sectionBody}>
              {swms_data.environmental_conditions.map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bullet}>▸</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ===== LEGISLATION ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>LEGISLATION & STANDARDS ({doc.state})</Text>
            </View>
            <View style={styles.sectionBody}>
              {swms_data.legislation_references.map((ref, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={[styles.bullet, { color: COLORS.orange }]}>▸</Text>
                  <Text style={styles.bulletText}>{ref}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ===== PERMIT REQUIREMENTS ===== */}
          {swms_data.permit_requirements.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>PERMIT-TO-WORK REQUIREMENTS</Text>
              </View>
              <View style={styles.sectionBody}>
                {swms_data.permit_requirements.map((item, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bullet}>▸</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ===== TOOLBOX TALK ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>TOOLBOX TALK — PRE-START BRIEFING</Text>
            </View>
            <View style={styles.sectionBody}>
              <View style={styles.toolboxTalkBox}>
                <Text style={styles.bodyText}>
                  &ldquo;{swms_data.toolbox_talk}&rdquo;
                </Text>
              </View>
            </View>
          </View>

          {/* ===== SWMS REVIEW & MONITORING ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>SWMS REVIEW & MONITORING</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={[styles.bodyText, { fontWeight: "bold", fontSize: 7, letterSpacing: 0.5, color: COLORS.gray500 }]}>
                REVIEW TRIGGERS — This SWMS will be reviewed if:
              </Text>
              <Text style={styles.bodyText}>
                • An incident or near miss occurs  • A control measure fails  • Scope of work changes  • New worker joins  • 12 months pass since last review
              </Text>
            </View>
          </View>

          {/* ===== WORKER SIGN-OFF ===== */}
          <PdfSignatureBlock
            signatures={signatures}
            signOffUrl={signOffUrl}
            signOffQrBase64={signOffQrBase64}
            blankRows={4}
            preparedBy={doc.contact_name}
            preparedDate={doc.created_at}
          />

          {/* ===== DOCUMENT REVIEW HISTORY ===== */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>DOCUMENT REVIEW HISTORY</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow} wrap={false}>
                <View style={[styles.tableHeaderCell, { width: "10%" }]}>
                  <Text style={styles.tableHeaderText}>REV</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: "18%" }]}>
                  <Text style={styles.tableHeaderText}>DATE</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: "40%" }]}>
                  <Text style={styles.tableHeaderText}>DESCRIPTION</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: "32%" }]}>
                  <Text style={styles.tableHeaderText}>REVIEWED BY</Text>
                </View>
              </View>
              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: "10%" }]}>
                  <Text style={styles.tableCellText}>{doc.revision_number}</Text>
                </View>
                <View style={[styles.tableCell, { width: "18%" }]}>
                  <Text style={styles.tableCellText}>{doc.created_at}</Text>
                </View>
                <View style={[styles.tableCell, { width: "40%" }]}>
                  <Text style={styles.tableCellText}>Initial issue</Text>
                </View>
                <View style={[styles.tableCell, { width: "32%" }]}>
                  <Text style={styles.tableCellText}>{doc.contact_name}</Text>
                </View>
              </View>
              {[2, 3].map((rev) => (
                <View key={rev} style={styles.tableRow} wrap={false}>
                  <View style={[styles.tableCell, { width: "10%" }]}><Text style={styles.tableCellText}> </Text></View>
                  <View style={[styles.tableCell, { width: "18%" }]}><Text style={styles.tableCellText}> </Text></View>
                  <View style={[styles.tableCell, { width: "40%" }]}><Text style={styles.tableCellText}> </Text></View>
                  <View style={[styles.tableCell, { width: "32%" }]}><Text style={styles.tableCellText}> </Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
