"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { VolumeUp, Stop, Settings } from "@mui/icons-material";
import { useSpeech } from "../hooks/useSpeech";
import { PersianVoiceId, TTSSettings } from "../types/voice";
import { stored, remove, flush } from "@abreza/piper-tts-web";
import VoiceSelector from "../components/VoiceSelector";
import SettingsDialog from "../components/SettingsDialog";
import ModelManagement from "../components/ModelManagement";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import ProgressDisplay from "../components/ProgressDisplay";

const DEFAULT_SETTINGS: TTSSettings = {
  isStreaming: true,
  chunkDelay: 100,

  noiseScale: 0.667,
  lengthScale: 1.0,
  noiseWidth: 0.8,

  sentencePause: 300,
  maxChunkLength: 80,
  enablePhrasePausing: true,
};

export default function TTSPage() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voice, setVoice] = useState<PersianVoiceId>("fa_IR-amir-medium");
  const [settings, setSettings] = useState<TTSSettings>(DEFAULT_SETTINGS);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [downloadPercentage, setDownloadPercentage] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<string | null>(
    null
  );
  const [processingPercentage, setProcessingPercentage] = useState<number>(0);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { speak, stop } = useSpeech();

  useEffect(() => {
    loadDownloadedModels();

    const savedSettings = localStorage.getItem("tts-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.error("Failed to load settings from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tts-settings", JSON.stringify(settings));
  }, [settings]);

  const loadDownloadedModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await stored();
      setDownloadedModels(models);
    } catch (error) {
      console.error("Failed to load downloaded models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSpeak = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setIsSpeaking(true);
    setError(null);

    setDownloadProgress(null);
    setDownloadPercentage(0);
    setProcessingProgress(null);
    setProcessingPercentage(0);

    try {
      await speak(
        text,
        voice,

        (progress: string) => {
          setDownloadProgress(progress);
          const match = progress.match(/(\d+)%/);
          if (match) {
            setDownloadPercentage(parseInt(match[1]));
          }
        },

        (progress: string, current: number, total: number) => {
          setProcessingProgress(progress);
          setProcessingPercentage(Math.round((current / total) * 100));
        },
        {
          streaming: settings.isStreaming,
          chunkDelay: settings.chunkDelay,
          noiseScale: settings.noiseScale,
          lengthScale: settings.lengthScale,
          noiseWidth: settings.noiseWidth,
          sentencePause: settings.sentencePause,
          maxChunkLength: settings.maxChunkLength,
          enablePhrasePausing: settings.enablePhrasePausing,
        }
      );

      await loadDownloadedModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تولید صدا");
    } finally {
      setIsLoading(false);
      setIsSpeaking(false);
      setDownloadProgress(null);
      setDownloadPercentage(0);
      setProcessingProgress(null);
      setProcessingPercentage(0);
    }
  };

  const handleStop = () => {
    stop();
    setIsLoading(false);
    setIsSpeaking(false);
    setDownloadProgress(null);
    setDownloadPercentage(0);
    setProcessingProgress(null);
    setProcessingPercentage(0);
  };

  const handleDeleteModel = async (modelId: string) => {
    setModelToDelete(modelId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteModel = async () => {
    if (!modelToDelete) return;

    setIsDeleting(true);
    try {
      await remove(modelToDelete as PersianVoiceId);
      await loadDownloadedModels();
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    } catch (error) {
      console.error("Failed to delete model:", error);
      setError("خطا در حذف مدل");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllModels = async () => {
    setIsDeleting(true);
    try {
      await flush();
      await loadDownloadedModels();
    } catch (error) {
      console.error("Failed to clear all models:", error);
      setError("خطا در پاک کردن همه مدل‌ها");
    } finally {
      setIsDeleting(false);
    }
  };

  const getButtonText = () => {
    if (!isLoading) return "پخش صدا";

    if (downloadProgress) return "در حال دانلود مدل...";
    if (processingProgress)
      return settings.isStreaming
        ? "در حال پخش پیوسته..."
        : "در حال تولید صدا...";

    return settings.isStreaming
      ? "در حال پخش پیوسته..."
      : "در حال تولید صدا...";
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

        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <VoiceSelector
              value={voice}
              onChange={setVoice}
              disabled={isLoading}
              downloadedModels={downloadedModels}
            />
            <Tooltip title="تنظیمات پیشرفته">
              <IconButton
                onClick={() => setSettingsDialogOpen(true)}
                disabled={isLoading}
                color="primary"
              >
                <Settings />
              </IconButton>
            </Tooltip>
          </Stack>

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

          <Stack direction="row" spacing={2}>
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
              fullWidth
            >
              {getButtonText()}
            </Button>

            {isSpeaking && (
              <Button
                variant="outlined"
                color="error"
                size="large"
                onClick={handleStop}
                startIcon={<Stop />}
              >
                توقف
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Show download progress */}
        {downloadProgress && (
          <ProgressDisplay
            progress={downloadProgress}
            percentage={downloadPercentage}
            type="download"
          />
        )}

        {/* Show processing progress */}
        {processingProgress && (
          <ProgressDisplay
            progress={processingProgress}
            percentage={processingPercentage}
            type="processing"
          />
        )}
      </Paper>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>دانلود اولیه:</strong> در اولین استفاده از هر صدا، مدل آن از
          اینترنت دانلود می‌شود (حدود ۶۰ مگابایت). این فایل در مرورگر ذخیره شده
          و استفاده‌های بعدی سریع‌تر خواهد بود.
        </Typography>
      </Alert>

      <ModelManagement
        downloadedModels={downloadedModels}
        isLoadingModels={isLoadingModels}
        isDeleting={isDeleting}
        onRefresh={loadDownloadedModels}
        onClearAll={handleClearAllModels}
        onDeleteModel={handleDeleteModel}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        modelToDelete={modelToDelete}
        isDeleting={isDeleting}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteModel}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        disabled={isLoading}
      />
    </Stack>
  );
}
