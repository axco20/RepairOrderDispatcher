import { AuthProvider } from "@/context/AuthContext";
import { RepairOrderProvider } from "@/context/RepairOrderContext";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RepairOrderProvider>
            {children}
            <ToastContainer 
              position="top-right"
              autoClose={3000} 
              hideProgressBar={false} 
              newestOnTop={true} 
              closeOnClick 
              rtl={false} 
              pauseOnFocusLoss 
              draggable 
              pauseOnHover 
              theme="light"
            />
          </RepairOrderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
