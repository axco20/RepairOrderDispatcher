import { AuthProvider } from "@/context/AuthContext";
import { RepairOrderProvider } from "@/context/RepairOrderContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RepairOrderProvider>
          {children}
          </RepairOrderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
