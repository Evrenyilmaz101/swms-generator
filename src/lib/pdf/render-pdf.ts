// PDF Render utility
// Wraps @react-pdf/renderer's renderToBuffer for server-side use

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { SwmsPdfDocument } from "./swms-document";
import type { SwmsDocument } from "@/types/swms";
import type { DigitalSignature } from "./pdf-components/signature-block";

interface RenderOptions {
  watermark?: boolean;
  signatures?: DigitalSignature[];
  signOffUrl?: string;
  signOffQrBase64?: string;
}

export async function renderSwmsPdf(doc: SwmsDocument, options?: RenderOptions): Promise<Buffer> {
  const element = React.createElement(SwmsPdfDocument, {
    doc,
    watermark: options?.watermark ?? false,
    signatures: options?.signatures,
    signOffUrl: options?.signOffUrl,
    signOffQrBase64: options?.signOffQrBase64,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
