// PDF Render utility
// Wraps @react-pdf/renderer's renderToBuffer for server-side use

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { SwmsPdfDocument } from "./swms-document";
import type { SwmsDocument } from "@/types/swms";

export async function renderSwmsPdf(doc: SwmsDocument): Promise<Buffer> {
  const element = React.createElement(SwmsPdfDocument, { doc });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
