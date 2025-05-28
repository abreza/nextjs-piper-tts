"use client";

import { CacheProvider } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Container } from "@mui/material";
import theme from "../theme";

const clientSideEmotionCache = createEmotionCache();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>تبدیل متن فارسی به گفتار</title>
        <meta
          name="description"
          content="تبدیل متن فارسی به گفتار با استفاده از PiperTTS"
        />
      </head>
      <body style={{ fontFamily: theme.typography.fontFamily }}>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="md" sx={{ py: 4 }}>
              {children}
            </Container>
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
