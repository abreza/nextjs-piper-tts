import {
  Paper,
  Stack,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Slider,
} from "@mui/material";

interface StreamingSettingsProps {
  isStreaming: boolean;
  onStreamingChange: (enabled: boolean) => void;
  chunkDelay: number;
  onChunkDelayChange: (delay: number) => void;
  disabled?: boolean;
}

export default function StreamingSettings({
  isStreaming,
  onStreamingChange,
  chunkDelay,
  onChunkDelayChange,
  disabled = false,
}: StreamingSettingsProps) {
  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={isStreaming}
              onChange={(e) => onStreamingChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label="پخش پیوسته (شروع پخش قبل از اتمام پردازش)"
        />

        {isStreaming && (
          <Box>
            <Typography variant="body2" gutterBottom>
              تأخیر بین بخش‌ها: {chunkDelay} میلی‌ثانیه
            </Typography>
            <Slider
              value={chunkDelay}
              onChange={(_, value) => onChunkDelayChange(value as number)}
              min={0}
              max={500}
              step={50}
              disabled={disabled}
              marks={[
                { value: 0, label: "0" },
                { value: 100, label: "100" },
                { value: 250, label: "250" },
                { value: 500, label: "500" },
              ]}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
