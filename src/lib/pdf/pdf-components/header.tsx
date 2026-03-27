// PDF Header: Company details + document metadata + compliance stamp

import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { styles, COLORS } from "../pdf-styles";
import type { SwmsDocument } from "@/types/swms";
import { formatABN } from "@/lib/utils/format";

interface HeaderProps {
  doc: SwmsDocument;
}

export function PdfHeader({ doc }: HeaderProps) {
  return (
    <>
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          {doc.logo_base64 && (
            <Image style={styles.logo} src={doc.logo_base64} />
          )}
          <Text style={styles.companyName}>{doc.business_name}</Text>
          {doc.abn && (
            <Text style={styles.companyDetail}>
              ABN: {formatABN(doc.abn)}
            </Text>
          )}
          <Text style={styles.companyDetail}>{doc.contact_name}</Text>
          <Text style={styles.companyDetail}>{doc.phone}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.docTitle}>Safe Work Method Statement</Text>
          <Text style={styles.docTitle}>(SWMS)</Text>
          <Text style={styles.docMeta}>
            Ref: {doc.document_reference}
          </Text>
          <Text style={styles.docMeta}>
            Rev: {doc.revision_number} | Date: {doc.created_at}
          </Text>
          <Text style={styles.docMeta}>State: {doc.state}</Text>
        </View>
      </View>

      {/* Compliance stamp */}
      <View style={styles.complianceStamp}>
        <Text style={styles.complianceStampText}>
          AI-VERIFIED | WHS COMPLIANT | COMPLIANCE SCORE:{" "}
          {doc.compliance_score}/100 | {doc.created_at}
        </Text>
      </View>

      {/* Site details grid */}
      <View style={styles.infoGrid}>
        {doc.site_address && (
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Site Address</Text>
            <Text style={styles.infoValue}>{doc.site_address}</Text>
          </View>
        )}
        {doc.principal_contractor && (
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Principal Contractor</Text>
            <Text style={styles.infoValue}>{doc.principal_contractor}</Text>
          </View>
        )}
        {doc.job_reference && (
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Job Reference</Text>
            <Text style={styles.infoValue}>{doc.job_reference}</Text>
          </View>
        )}
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Prepared By</Text>
          <Text style={styles.infoValue}>{doc.contact_name}</Text>
        </View>
      </View>
    </>
  );
}
