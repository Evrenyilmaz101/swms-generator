// Worker Sign-Off Table
// Renders digital signatures (from DB) + blank rows for hardcopy signing
// Includes optional QR code for digital sign-off

import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { styles, COLORS } from "../pdf-styles";

export interface DigitalSignature {
  worker_name: string;
  worker_role?: string | null;
  licence_number?: string | null;
  signature_base64: string;
  signed_at: string;
}

interface PdfSignatureBlockProps {
  signatures?: DigitalSignature[];
  signOffUrl?: string;
  signOffQrBase64?: string;
  blankRows?: number; // Extra blank rows for hardcopy (default 4)
  preparedBy?: string; // Auto-filled from businessDetails.contact_name
  preparedDate?: string;
}

export function PdfSignatureBlock({
  signatures = [],
  signOffUrl,
  signOffQrBase64,
  blankRows = 4,
  preparedBy,
  preparedDate,
}: PdfSignatureBlockProps) {
  const cols = [
    { label: "NAME", width: "22%" },
    { label: "ROLE / TRADE", width: "16%" },
    { label: "LICENCE NO.", width: "14%" },
    { label: "SIGNATURE", width: "28%" },
    { label: "DATE", width: "12%" },
    { label: "", width: "8%" }, // Status column
  ];

  return (
    <View style={styles.sectionCard}>
      {/* Header with optional QR */}
      <View style={[styles.sectionHeader, { paddingVertical: 6 }]}>
        <View>
          <Text style={[styles.sectionHeaderText, { fontSize: 9 }]}>WORKER SIGN-OFF</Text>
          <Text style={[styles.sectionHeaderNote, { marginTop: 1 }]}>
            By signing, each worker confirms they have read, understood & agree to comply with this SWMS
          </Text>
        </View>
      </View>

      {/* QR code + digital sign-off info */}
      {(signOffUrl || signOffQrBase64) && (
        <View style={{ flexDirection: "row", padding: 10, gap: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.gray200, backgroundColor: COLORS.gray50 }}>
          {signOffQrBase64 && (
            <Image
              src={signOffQrBase64}
              style={{ width: 60, height: 60 }}
            />
          )}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 8, fontWeight: "bold", color: COLORS.navy, marginBottom: 2 }}>
              DIGITAL SIGN-OFF AVAILABLE
            </Text>
            <Text style={{ fontSize: 7, color: COLORS.gray500, lineHeight: 1.4 }}>
              Workers can sign off digitally on their phones. Scan the QR code or visit:
            </Text>
            {signOffUrl && (
              <Text style={{ fontSize: 7, fontWeight: "bold", color: COLORS.navy, marginTop: 2 }}>
                {signOffUrl}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Table header */}
      <View style={styles.table}>
        <View style={styles.tableHeaderRow} wrap={false}>
          {cols.map((col) => (
            <View key={col.label || "status"} style={[styles.tableHeaderCell, { width: col.width }]}>
              <Text style={styles.tableHeaderText}>{col.label}</Text>
            </View>
          ))}
        </View>

        {/* Digital signatures (pre-filled rows) */}
        {signatures.map((sig, i) => {
          const signDate = new Date(sig.signed_at).toLocaleDateString("en-AU", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          });

          return (
            <View key={`sig-${i}`} style={[styles.signatureRow, { backgroundColor: "#F0FFF4" }]} wrap={false}>
              <View style={[styles.signatureCell, { width: cols[0].width }]}>
                <Text style={{ fontSize: 8, fontWeight: "semibold", color: COLORS.gray900 }}>
                  {sig.worker_name}
                </Text>
              </View>
              <View style={[styles.signatureCell, { width: cols[1].width }]}>
                <Text style={{ fontSize: 7.5, color: COLORS.gray700 }}>
                  {sig.worker_role || "—"}
                </Text>
              </View>
              <View style={[styles.signatureCell, { width: cols[2].width }]}>
                <Text style={{ fontSize: 7.5, color: COLORS.gray700 }}>
                  {sig.licence_number || "—"}
                </Text>
              </View>
              <View style={[styles.signatureCell, { width: cols[3].width, justifyContent: "center" }]}>
                <Image
                  src={sig.signature_base64}
                  style={{ width: "100%", height: 24, objectFit: "contain" }}
                />
              </View>
              <View style={[styles.signatureCell, { width: cols[4].width }]}>
                <Text style={{ fontSize: 7.5, color: COLORS.gray700 }}>
                  {signDate}
                </Text>
              </View>
              <View style={[styles.signatureCell, { width: cols[5].width, alignItems: "center" }]}>
                <Text style={{ fontSize: 6, fontWeight: "bold", color: "#2E7D32" }}>
                  SIGNED
                </Text>
              </View>
            </View>
          );
        })}

        {/* Blank rows for hardcopy signatures */}
        {Array.from({ length: blankRows }).map((_, i) => (
          <View key={`blank-${i}`} style={styles.signatureRow} wrap={false}>
            {cols.map((col, ci) => (
              <View key={ci} style={[styles.signatureCell, { width: col.width }]}>
                <View style={styles.signatureLine} />
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Prepared by */}
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 7, fontWeight: "bold", color: COLORS.navy, marginBottom: 6 }}>
              PREPARED BY:
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7, color: COLORS.gray500, marginBottom: 2 }}>Name</Text>
                {preparedBy ? (
                  <Text style={{ fontSize: 8, fontWeight: "semibold", color: COLORS.gray900, borderBottomWidth: 0.5, borderBottomColor: COLORS.gray200, paddingBottom: 4, height: 16 }}>{preparedBy}</Text>
                ) : (
                  <View style={{ borderBottomWidth: 0.5, borderBottomColor: COLORS.gray200, height: 16 }} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7, color: COLORS.gray500, marginBottom: 2 }}>Signature</Text>
                <View style={{ borderBottomWidth: 0.5, borderBottomColor: COLORS.gray200, height: 16 }} />
              </View>
              <View style={{ width: 80 }}>
                <Text style={{ fontSize: 7, color: COLORS.gray500, marginBottom: 2 }}>Date</Text>
                {preparedDate ? (
                  <Text style={{ fontSize: 8, color: COLORS.gray700, borderBottomWidth: 0.5, borderBottomColor: COLORS.gray200, paddingBottom: 4, height: 16 }}>{preparedDate}</Text>
                ) : (
                  <View style={{ borderBottomWidth: 0.5, borderBottomColor: COLORS.gray200, height: 16 }} />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
