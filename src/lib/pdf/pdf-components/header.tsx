// Page Header — Navy bar with company details + SWMS doc ID
// Matches Pencil design: logo left, company name, doc number right

import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { styles, COLORS } from "../pdf-styles";
import type { SwmsDocument } from "@/types/swms";

interface PdfHeaderProps {
  doc: SwmsDocument;
  compact?: boolean;
}

export function PdfHeader({ doc, compact }: PdfHeaderProps) {
  const headerStyle = compact ? styles.pageHeaderSmall : styles.pageHeader;

  return (
    <View style={headerStyle} fixed={!!compact}>
      {/* Left — Logo + Company */}
      <View style={styles.pageHeaderLeft}>
        {doc.logo_base64 ? (
          <View style={styles.logoBox}>
            <Image src={doc.logo_base64} style={styles.logo} />
          </View>
        ) : (
          <View style={[styles.logoBox, { width: compact ? 24 : 40, height: compact ? 24 : 40 }]}>
            <Text style={{ fontSize: compact ? 7 : 9, fontWeight: "bold", color: COLORS.navy }}>LOGO</Text>
          </View>
        )}
        <View>
          <Text style={[styles.companyName, compact ? { fontSize: 10 } : {}]}>
            {doc.business_name.toUpperCase()}
          </Text>
          {!compact && doc.abn && (
            <Text style={styles.companyAbn}>ABN {doc.abn}</Text>
          )}
        </View>
      </View>

      {/* Right — Doc ID */}
      <View style={styles.pageHeaderRight}>
        {!compact && (
          <Text style={styles.docLabel}>SWMS DOCUMENT</Text>
        )}
        <Text style={[styles.docId, compact ? { fontSize: 9 } : {}]}>
          {doc.document_reference}
        </Text>
        <Text style={styles.docRev}>
          Rev {doc.revision_number}.0  |  Issued {doc.created_at}
        </Text>
      </View>
    </View>
  );
}

// Title bar — "SAFE WORK METHOD STATEMENT" (Page 1 only)
export function PdfTitleBar() {
  return (
    <View style={styles.titleBar}>
      <Text style={styles.titleText}>SAFE WORK METHOD STATEMENT</Text>
      <Text style={styles.titleSubtext}>HIGH RISK CONSTRUCTION WORK</Text>
    </View>
  );
}

// PCBU + Project details two-column block
export function PdfDetailsBlock({ doc }: { doc: SwmsDocument }) {
  return (
    <View style={[styles.content, { paddingTop: 14 }]}>
      <View style={styles.twoCol}>
        {/* PCBU Column */}
        <View style={[styles.colHalf, styles.sectionCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>PCBU (BUSINESS) DETAILS</Text>
          </View>
          <View style={styles.sectionBody}>
            <InfoRow label="Company:" value={doc.business_name} />
            <InfoRow label="ABN:" value={doc.abn || "—"} />
            <InfoRow label="Contact:" value={doc.contact_name} />
            <InfoRow label="Phone:" value={doc.phone} />
            <InfoRow label="Date Prepared:" value={doc.created_at} />
          </View>
        </View>

        {/* Project Column */}
        <View style={[styles.colHalf, styles.sectionCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>PROJECT & SITE DETAILS</Text>
          </View>
          <View style={styles.sectionBody}>
            <InfoRow label="Site Address:" value={doc.site_address || "—"} />
            <InfoRow label="Principal:" value={doc.principal_contractor || "N/A"} />
            <InfoRow label="Responsible:" value={doc.contact_name} />
            <InfoRow label="State:" value={doc.state} />
            <InfoRow label="Job Ref:" value={doc.job_reference || "—"} />
          </View>
        </View>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}
