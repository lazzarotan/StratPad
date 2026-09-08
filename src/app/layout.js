import "./globals.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "@/components/Modules/Modules.css";
import Navbar from "@/components/Navbar/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import "antd/dist/reset.css";
import { materialUiThemeOverride } from "./material_ui_theme_override";
import { ThemeProvider } from "@mui/material/styles";
import SnackbarProvider from "@/components/SnackbarProvider/SnackbarProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <body>
            <ThemeProvider theme={materialUiThemeOverride}>
                <SnackbarProvider>
                <Navbar />
                    <div className="app-wrapper">
                        {children}
                        <ConditionalFooter />
                    </div>
              </SnackbarProvider>
            </ThemeProvider>
        </body>
    </html>
  );
}