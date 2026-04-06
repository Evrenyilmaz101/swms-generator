// PDF Footer: Company + doc ref | Page X of Y | Generated via
// Matches Pencil design

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";

interface FooterProps {
  documentReference: string;
  businessName?: string;
  abn?: string;
}

export function PdfFooter({ documentReference, businessName, abn }: FooterProps) {
  const leftText = [businessName, abn ? `ABN ${abn}` : null, documentReference]
    .filter(Boolean)
    .join("  |  ");

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{leftText}</Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
      <Text style={styles.footerText}>Generated via swmsgenerator.com.au</Text>
    </View>
  );
}
