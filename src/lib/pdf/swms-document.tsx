// Master SWMS PDF Document
// Composes all PDF components into a complete, professional A4 document

import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";
import { PdfHeader } from "./pdf-components/header";
import { PdfHrcwChecklist } from "./pdf-components/hrcw-checklist";
import { PdfProcedureTable } from "./pdf-components/procedure-table";
import { PdfSignatureBlock } from "./pdf-components/signature-block";
import { PdfFooter } from "./pdf-components/footer";
import type { SwmsDocument } from "@/types/swms";

interface SwmsPdfDocumentProps {
  doc: SwmsDocument;
}

export function SwmsPdfDocument({ doc }: SwmsPdfDocumentProps) {
  const { swms_data } = doc;

  return (
    <Document
      title={`SWMS - ${doc.business_name} - ${doc.document_reference}`}
      author={doc.business_name}
      subject="Safe Work Method Statement"
      creator="SWMS AI Generator"
    >
      <Page size="A4" style={styles.page}>
        {/* Fixed footer on every page */}
        <PdfFooter documentReference={doc.document_reference} />

        {/* Header with company details and compliance stamp */}
        <PdfHeader doc={doc} />

        {/* Scope of Work */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Scope of Work</Text>
        </View>
        <Text style={styles.bodyText}>{swms_data.scope_of_work}</Text>

        {/* HRCW Checklist */}
        <PdfHrcwChecklist selectedActivities={swms_data.hrcw_activities} />

        {/* Main Procedure Table */}
        <PdfProcedureTable steps={swms_data.steps} />

        {/* PPE Requirements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>
            Personal Protective Equipment (PPE) Requirements
          </Text>
        </View>
        {swms_data.ppe_requirements.map((item, i) => (
          <View key={i} style={styles.bulletItem}>
            <Text style={styles.bullet}>●</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}

        {/* Emergency Procedures */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Emergency Procedures</Text>
        </View>
        {swms_data.emergency_procedures.map((proc, i) => (
          <View key={i} style={styles.bulletItem}>
            <Text style={styles.bullet}>{i + 1}.</Text>
            <Text style={styles.bulletText}>{proc}</Text>
          </View>
        ))}

        {/* Toolbox Talk */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>
            Toolbox Talk — Pre-Start Briefing
          </Text>
        </View>
        <Text style={styles.bodyText}>{swms_data.toolbox_talk}</Text>

        {/* Legislative References */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Legislative References</Text>
        </View>
        {swms_data.legislation_references.map((ref, i) => (
          <View key={i} style={styles.bulletItem}>
            <Text style={styles.bullet}>●</Text>
            <Text style={styles.bulletText}>{ref}</Text>
          </View>
        ))}

        {/* Signature Block */}
        <PdfSignatureBlock />
      </Page>
    </Document>
  );
}
