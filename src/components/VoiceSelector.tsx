import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { VOICE_INFO, PersianVoiceId } from "../types/voice";

interface VoiceSelectorProps {
  value: PersianVoiceId;
  onChange: (voice: PersianVoiceId) => void;
  disabled?: boolean;
  downloadedModels: string[];
}

export default function VoiceSelector({
  value,
  onChange,
  disabled = false,
  downloadedModels,
}: VoiceSelectorProps) {
  return (
    <FormControl fullWidth>
      <InputLabel>انتخاب صدا</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as PersianVoiceId)}
        label="انتخاب صدا"
        disabled={disabled}
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
  );
}
