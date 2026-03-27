// PDF Footer: Page numbers + document reference

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";

interface FooterProps {
  documentReference: string;
}

export function PdfFooter({ documentReference }: FooterProps) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{documentReference}</Text>
      <Text style={styles.footerText}>
        This SWMS was generated using AI and should be reviewed by a competent
        person before use on site.
      </Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}
