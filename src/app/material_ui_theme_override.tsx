'use client';
import { createTheme } from "@mui/material/styles";

export const materialUiThemeOverride = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    border: '1px solid transparent',
                    borderRadius: '6px',
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
              switchBase: {
                '&.Mui-checked': {
                  color: '#8b5cf6',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#8b5cf6',
                  },
                },
              },
            },
          },
    },
});