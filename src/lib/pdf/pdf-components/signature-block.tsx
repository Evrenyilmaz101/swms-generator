// PDF Signature Block: Spaces for on-site sign-off

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";

const SIGNATURE_ROWS = 8; // Blank rows for workers to sign

export function PdfSignatureBlock() {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>
          Worker Acknowledgement & Sign-Off
        </Text>
      </View>

      <Text style={[styles.bodyText, { marginBottom: 6 }]}>
        I confirm that I have been consulted on the content of this SWMS, I
        understand the identified hazards and control measures, and I agree to
        carry out the work in accordance with this SWMS.
      </Text>

      <View style={styles.signatureTable}>
        {/* Header row */}
        <View style={[styles.signatureRow, { backgroundColor: "#f1f5f9" }]}>
          <View style={[styles.signatureCell, { flex: 2 }]}>
            <Text style={[styles.signatureLabel, { fontWeight: "bold" }]}>
              Full Name (Print)
            </Text>
          </View>
          <View style={[styles.signatureCell, { flex: 2 }]}>
            <Text style={[styles.signatureLabel, { fontWeight: "bold" }]}>
              Signature
            </Text>
          </View>
          <View style={[styles.signatureCell, { flex: 1 }]}>
            <Text style={[styles.signatureLabel, { fontWeight: "bold" }]}>
              Date
            </Text>
          </View>
          <View
            style={[
              styles.signatureCell,
              { flex: 2, borderRightWidth: 0 },
            ]}
          >
            <Text style={[styles.signatureLabel, { fontWeight: "bold" }]}>
              Company / Trade
            </Text>
          </View>
        </View>

        {/* Blank rows for signing */}
        {Array.from({ length: SIGNATURE_ROWS }).map((_, i) => (
          <View key={i} style={styles.signatureRow}>
            <View style={[styles.signatureCell, { flex: 2 }]}>
              <View style={styles.signatureLine} />
            </View>
            <View style={[styles.signatureCell, { flex: 2 }]}>
              <View style={styles.signatureLine} />
            </View>
            <View style={[styles.signatureCell, { flex: 1 }]}>
              <View style={styles.signatureLine} />
            </View>
            <View
              style={[
                styles.signatureCell,
                { flex: 2, borderRightWidth: 0 },
              ]}
            >
              <View style={styles.signatureLine} />
            </View>
          </View>
        ))}
      </View>

      {/* Prepared/Reviewed by */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 16,
          gap: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.subHeader}>Prepared By</Text>
          <View style={styles.signatureRow}>
            <View style={[styles.signatureCell, { borderRightWidth: 0 }]}>
              <Text style={styles.signatureLabel}>Name & Signature</Text>
              <View style={[styles.signatureLine, { marginTop: 4 }]} />
            </View>
          </View>
          <View style={styles.signatureRow}>
            <View style={[styles.signatureCell, { borderRightWidth: 0 }]}>
              <Text style={styles.signatureLabel}>Date</Text>
              <View style={[styles.signatureLine, { marginTop: 4 }]} />
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.subHeader}>Reviewed By</Text>
          <View style={styles.signatureRow}>
            <View style={[styles.signatureCell, { borderRightWidth: 0 }]}>
              <Text style={styles.signatureLabel}>Name & Signature</Text>
              <View style={[styles.signatureLine, { marginTop: 4 }]} />
            </View>
          </View>
          <View style={styles.signatureRow}>
            <View style={[styles.signatureCell, { borderRightWidth: 0 }]}>
              <Text style={styles.signatureLabel}>Date</Text>
              <View style={[styles.signatureLine, { marginTop: 4 }]} />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
