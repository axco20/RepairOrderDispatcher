import { AuthProvider } from "@/context/AuthContext";
import { RepairOrderProvider } from "@/context/RepairOrderContext";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import "./globals.css";
import { RealTimeOrdersProvider } from "@/context/RealTimeOrdersProvider"; // Import your provider


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RepairOrderProvider>
            <RealTimeOrdersProvider> 
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
            </RealTimeOrdersProvider>
          </RepairOrderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

