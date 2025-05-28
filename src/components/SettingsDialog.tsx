import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  Slider,
  Divider,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore, Settings, Restore } from "@mui/icons-material";
import { TTSSettings } from "../types/voice";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: TTSSettings;
  onSettingsChange: (settings: TTSSettings) => void;
  disabled?: boolean;
}

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

export default function SettingsDialog({
  open,
  onClose,
  settings,
  onSettingsChange,
  disabled = false,
}: SettingsDialogProps) {
  const handleSettingChange = (key: keyof TTSSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const handleResetDefaults = () => {
    onSettingsChange(DEFAULT_SETTINGS);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: "600px" },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Settings />
        تنظیمات پیشرفته
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">تنظیمات پخش</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.isStreaming}
                      onChange={(e) =>
                        handleSettingChange("isStreaming", e.target.checked)
                      }
                      disabled={disabled}
                    />
                  }
                  label="پخش پیوسته (شروع پخش قبل از اتمام پردازش)"
                />

                {settings.isStreaming && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      تأخیر بین بخش‌ها: {settings.chunkDelay} میلی‌ثانیه
                    </Typography>
                    <Slider
                      value={settings.chunkDelay}
                      onChange={(_, value) =>
                        handleSettingChange("chunkDelay", value as number)
                      }
                      min={0}
                      max={1000}
                      step={50}
                      disabled={disabled}
                      marks={[
                        { value: 0, label: "0" },
                        { value: 250, label: "250" },
                        { value: 500, label: "500" },
                        { value: 1000, label: "1000" },
                      ]}
                    />
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" gutterBottom>
                    مکث بین جملات: {settings.sentencePause} میلی‌ثانیه
                  </Typography>
                  <Slider
                    value={settings.sentencePause}
                    onChange={(_, value) =>
                      handleSettingChange("sentencePause", value as number)
                    }
                    min={0}
                    max={2000}
                    step={100}
                    disabled={disabled}
                    marks={[
                      { value: 0, label: "0" },
                      { value: 500, label: "500" },
                      { value: 1000, label: "1000" },
                      { value: 2000, label: "2000" },
                    ]}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">تنظیمات موتور گفتار</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    مقیاس نویز (کیفیت صدا): {settings.noiseScale.toFixed(3)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    کمتر = صدای واضح‌تر، بیشتر = صدای طبیعی‌تر
                  </Typography>
                  <Slider
                    value={settings.noiseScale}
                    onChange={(_, value) =>
                      handleSettingChange("noiseScale", value as number)
                    }
                    min={0.1}
                    max={2.0}
                    step={0.001}
                    disabled={disabled}
                    marks={[
                      { value: 0.1, label: "0.1" },
                      { value: 0.667, label: "0.667" },
                      { value: 1.0, label: "1.0" },
                      { value: 2.0, label: "2.0" },
                    ]}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    مقیاس طول (سرعت گفتار): {settings.lengthScale.toFixed(3)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    کمتر = سریع‌تر، بیشتر = آهسته‌تر
                  </Typography>
                  <Slider
                    value={settings.lengthScale}
                    onChange={(_, value) =>
                      handleSettingChange("lengthScale", value as number)
                    }
                    min={0.1}
                    max={3.0}
                    step={0.001}
                    disabled={disabled}
                    marks={[
                      { value: 0.1, label: "0.1" },
                      { value: 1.0, label: "1.0" },
                      { value: 2.0, label: "2.0" },
                      { value: 3.0, label: "3.0" },
                    ]}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    عرض نویز (تنوع صدا): {settings.noiseWidth.toFixed(3)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    کمتر = صدای یکنواخت‌تر، بیشتر = صدای متنوع‌تر
                  </Typography>
                  <Slider
                    value={settings.noiseWidth}
                    onChange={(_, value) =>
                      handleSettingChange("noiseWidth", value as number)
                    }
                    min={0.0}
                    max={2.0}
                    step={0.001}
                    disabled={disabled}
                    marks={[
                      { value: 0.0, label: "0.0" },
                      { value: 0.8, label: "0.8" },
                      { value: 1.0, label: "1.0" },
                      { value: 2.0, label: "2.0" },
                    ]}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">تنظیمات پردازش متن</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    حداکثر طول هر بخش: {settings.maxChunkLength} کاراکتر
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    بخش‌های کوچک‌تر = شروع سریع‌تر پخش، بخش‌های بزرگ‌تر = کیفیت
                    بهتر
                  </Typography>
                  <Slider
                    value={settings.maxChunkLength}
                    onChange={(_, value) =>
                      handleSettingChange("maxChunkLength", value as number)
                    }
                    min={20}
                    max={200}
                    step={10}
                    disabled={disabled}
                    marks={[
                      { value: 20, label: "20" },
                      { value: 80, label: "80" },
                      { value: 120, label: "120" },
                      { value: 200, label: "200" },
                    ]}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enablePhrasePausing}
                      onChange={(e) =>
                        handleSettingChange(
                          "enablePhrasePausing",
                          e.target.checked
                        )
                      }
                      disabled={disabled}
                    />
                  }
                  label="فعال‌سازی مکث در نقطه‌گذاری (ویرگول، نقطه‌ویرگول)"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<Restore />}
          onClick={handleResetDefaults}
          disabled={disabled}
        >
          بازگشت به پیش‌فرض
        </Button>
        <Button onClick={onClose} disabled={disabled}>
          بستن
        </Button>
      </DialogActions>
    </Dialog>
  );
}
