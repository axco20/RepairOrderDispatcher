import * as React from "react";

interface EmailTemplateProps {
  message: string;
  link: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ message, link }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
    
    <h2 style={{ color: "#333", textAlign: "center", marginBottom: "20px" }}>🚀 Welcome to AutoSynctify!</h2>

    <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.6" }}>
      {message}
    </p>

    <p style={{ color: "#555", fontSize: "16px", marginTop: "20px", lineHeight: "1.6" }}>
      Click the link below to continue your registration:
    </p>

    <p style={{ textAlign: "center", fontSize: "16px", fontWeight: "bold", marginTop: "10px" }}>
      👉 <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", textDecoration: "none" }}>
        {link}
      </a>
    </p>

    <p style={{ color: "#777", fontSize: "14px", marginTop: "30px", textAlign: "center" }}>
      If you didn&apos;t request this, you can safely ignore this email.
    </p>

    <hr style={{ marginTop: "20px", border: "none", borderTop: "1px solid #ddd" }} />

    <p style={{ color: "#888", fontSize: "12px", textAlign: "center", marginTop: "15px" }}>
      © {new Date().getFullYear()} AutoSynctify. All rights reserved.
    </p>
  </div>
);
