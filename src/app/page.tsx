"use client";

import { useState, useEffect } from "react";
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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  VolumeUp,
  Download,
  ExpandMore,
  Delete,
  Storage,
  Refresh,
  DeleteSweep,
} from "@mui/icons-material";
import { useSpeech } from "../hooks/useSpeech";
import { PersianVoiceId } from "../lib/piper";
import { stored, remove, flush } from "@mintplex-labs/piper-tts-web";

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
  const [downloadPercentage, setDownloadPercentage] = useState<number>(0);

  // Model management state
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const speak = useSpeech();

  // Load downloaded models on component mount
  useEffect(() => {
    loadDownloadedModels();
  }, []);

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
    setError(null);
    setDownloadProgress(null);
    setDownloadPercentage(0);

    try {
      await speak(text, voice, (progress: string) => {
        setDownloadProgress(progress);

        const match = progress.match(/(\d+)%/);
        if (match) {
          setDownloadPercentage(parseInt(match[1]));
        }
      });

      // Refresh downloaded models list after successful TTS generation
      await loadDownloadedModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تولید صدا");
    } finally {
      setIsLoading(false);
      setDownloadProgress(null);
      setDownloadPercentage(0);
    }
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

  const getModelDisplayName = (modelId: string): string => {
    return VOICE_INFO[modelId as PersianVoiceId]?.name || modelId;
  };

  const getModelDescription = (modelId: string): string => {
    return VOICE_INFO[modelId as PersianVoiceId]?.description || "مدل صوتی";
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)} مگابایت`;
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box>
                      <Typography variant="body1">{info.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {info.description}
                      </Typography>
                    </Box>
                    {downloadedModels.includes(voiceId) && (
                      <Chip
                        size="small"
                        label="دانلود شده"
                        color="success"
                        variant="outlined"
                      />
                    )}
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
            {isLoading
              ? downloadProgress
                ? "در حال دانلود مدل..."
                : "در حال تولید صدا..."
              : "پخش صدا"}
          </Button>
        </Stack>

        {downloadProgress && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Download />
                <Typography variant="body2">{downloadProgress}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={downloadPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(0,0,0,0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Alert>
        )}
      </Paper>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>دانلود اولیه:</strong> در اولین استفاده از هر صدا، مدل آن از
          اینترنت دانلود می‌شود (حدود ۶۰ مگابایت). این فایل در مرورگر ذخیره شده
          و استفاده‌های بعدی سریع‌تر خواهد بود.
        </Typography>
      </Alert>

      <Paper elevation={3}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="model-management-content"
            id="model-management-header"
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">مدل‌های دانلود شده</Typography>
              <Chip
                size="small"
                label={`${downloadedModels.length} مدل`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  مدل‌های ذخیره شده در مرورگر شما
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={loadDownloadedModels}
                    disabled={isLoadingModels}
                  >
                    به‌روزرسانی
                  </Button>
                  {downloadedModels.length > 0 && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteSweep />}
                      onClick={handleClearAllModels}
                      disabled={isDeleting}
                    >
                      پاک کردن همه
                    </Button>
                  )}
                </Box>
              </Box>

              {isLoadingModels ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : downloadedModels.length === 0 ? (
                <Alert severity="info">
                  هیچ مدلی دانلود نشده است. پس از اولین استفاده از هر صدا، مدل
                  آن در اینجا نمایش داده خواهد شد.
                </Alert>
              ) : (
                <List disablePadding>
                  {downloadedModels.map((modelId) => (
                    <ListItem
                      key={modelId}
                      divider
                      sx={{
                        backgroundColor: "background.paper",
                        borderRadius: 1,
                        mb: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {getModelDisplayName(modelId)}
                            </Typography>
                            <Chip
                              size="small"
                              label="فعال"
                              color="success"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {getModelDescription(modelId)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {modelId} • تقریباً{" "}
                              {formatFileSize(60 * 1024 * 1024)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleDeleteModel(modelId)}
                          disabled={isDeleting}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {downloadedModels.length > 0 && (
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>توجه:</strong> حذف مدل‌ها باعث نیاز به دانلود مجدد
                    آن‌ها در استفاده‌های بعدی خواهد شد. مدل‌های حذف شده تنها از
                    حافظه محلی مرورگر پاک می‌شوند.
                  </Typography>
                </Alert>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تأیید حذف مدل</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا مطمئن هستید که می‌خواهید مدل "
            {modelToDelete && getModelDisplayName(modelToDelete)}" را حذف کنید؟
          </DialogContentText>
          <DialogContentText sx={{ mt: 1, fontSize: "0.875rem" }}>
            این عمل مدل را از حافظه محلی مرورگر حذف خواهد کرد و در صورت نیاز به
            استفاده مجدد، باید دوباره دانلود شود.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            انصراف
          </Button>
          <Button
            onClick={confirmDeleteModel}
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {isDeleting ? "در حال حذف..." : "حذف"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
