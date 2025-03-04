// src/components/EmailTemplate.tsx
import * as React from "react";

interface EmailTemplateProps {
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ message }) => (
  <div>
    <h1>{message}</h1>
  </div>
);
