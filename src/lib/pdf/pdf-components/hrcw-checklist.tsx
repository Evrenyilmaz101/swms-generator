// PDF HRCW Checklist: Shows all 19 categories with applicable ones ticked

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import { HRCW_CATEGORIES } from "@/lib/constants/hrcw-categories";

interface HrcwChecklistProps {
  selectedActivities: string[];
}

export function PdfHrcwChecklist({ selectedActivities }: HrcwChecklistProps) {
  // Build a set of selected IDs for quick lookup
  const selectedIds = new Set<number>();
  for (const activity of selectedActivities) {
    const match = activity.match(/^(\d+)\./);
    if (match) {
      selectedIds.add(parseInt(match[1], 10));
    } else {
      // Try to match by description content
      for (const cat of HRCW_CATEGORIES) {
        if (
          activity.toLowerCase().includes(cat.short_label.toLowerCase()) ||
          cat.description.toLowerCase().includes(activity.toLowerCase())
        ) {
          selectedIds.add(cat.id);
        }
      }
    }
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>
          High-Risk Construction Work (HRCW) Activities — WHS Regulations, Reg
          291
        </Text>
      </View>

      {HRCW_CATEGORIES.map((cat) => {
        const isSelected = selectedIds.has(cat.id);
        return (
          <View key={cat.id} style={styles.hrcwItem} wrap={false}>
            <View
              style={
                isSelected
                  ? styles.hrcwCheckboxChecked
                  : styles.hrcwCheckbox
              }
            >
              {isSelected && <Text style={styles.hrcwCheckmark}>✓</Text>}
            </View>
            <Text style={styles.hrcwText}>
              {cat.id}. {cat.description}
            </Text>
          </View>
        );
      })}
    </>
  );
}
