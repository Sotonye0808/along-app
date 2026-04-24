import React from "react";

export interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({
  data,
}: StructuredDataProps): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
