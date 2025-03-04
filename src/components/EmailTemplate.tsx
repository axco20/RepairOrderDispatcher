import * as React from "react";

interface EmailTemplateProps {
  message: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ message }) => (
  <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
    <h1 style={{ color: "#333" }}>New Admin Invitation</h1>
    <p>{message}</p>
    <a
      href="http://10.5.0.2:3000/AdminEmail"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        padding: "10px 20px",
        marginTop: "10px",
        backgroundColor: "#007bff",
        color: "white",
        textDecoration: "none",
        borderRadius: "5px",
      }}
    >
      Add Admin
    </a>
  </div>
);
