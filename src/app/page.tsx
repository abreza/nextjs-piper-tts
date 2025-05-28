"use client";

import { useState } from "react";
import {
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
} from "@mui/material";
import { VolumeUp, Download } from "@mui/icons-material";
import { useSpeech } from "../hooks/useSpeech";
import { PersianVoiceId } from "../lib/piper";

const VOICE_INFO: Record<
  PersianVoiceId,
  { name: string; description: string }
> = {
  "fa_IR-amir-medium": { name: "امیر", description: "صدای مردانه متوسط" },
  "fa_IR-gyro-medium": { name: "ژیرو", description: "صدای مردانه متوسط" },
  "fa_IR-ganji-medium": { name: "گنجی", description: "صدای مردانه متوسط" },
  "fa_IR-ganji_adabi-medium": {
    name: "گنجی ادبی",
    description: "صدای مردانه ادبی",
  },
  "fa_IR-reza_ibrahim-medium": {
    name: "رضا ابراهیم",
    description: "صدای مردانه متوسط",
  },
};

export default function TTSPage() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voice, setVoice] = useState<PersianVoiceId>("fa_IR-amir-medium");
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  const speak = useSpeech();

  const handleSpeak = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setDownloadProgress(null);

    try {
      await speak(text, voice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تولید صدا");
    } finally {
      setIsLoading(false);
      setDownloadProgress(null);
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          تبدیل متن فارسی به گفتار
        </Typography>

        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          PiperTTS
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {downloadProgress && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Download />
              {downloadProgress}
            </Box>
          </Alert>
        )}

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>انتخاب صدا</InputLabel>
            <Select
              value={voice}
              onChange={(e) => setVoice(e.target.value as PersianVoiceId)}
              label="انتخاب صدا"
              disabled={isLoading}
            >
              {Object.entries(VOICE_INFO).map(([voiceId, info]) => (
                <MenuItem key={voiceId} value={voiceId}>
                  <Box>
                    <Typography variant="body1">{info.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {info.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="متن فارسی را وارد کنید"
            multiline
            rows={4}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن خود را اینجا بنویسید..."
            disabled={isLoading}
          />

          <Button
            disabled={!text.trim() || isLoading}
            variant="contained"
            size="large"
            onClick={handleSpeak}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <VolumeUp />
              )
            }
          >
            {isLoading ? "در حال تولید صدا..." : "پخش صدا"}
          </Button>
        </Stack>
      </Paper>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>دانلود اولیه:</strong> در اولین استفاده از هر صدا، مدل آن از
          اینترنت دانلود می‌شود (حدود ۶۰ مگابایت). این فایل در مرورگر ذخیره شده
          و استفاده‌های بعدی سریع‌تر خواهد بود.
        </Typography>
      </Alert>
    </Stack>
  );
}
