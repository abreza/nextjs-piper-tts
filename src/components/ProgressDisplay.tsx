import { Alert, Box, Typography, LinearProgress } from "@mui/material";
import { Download, PlayArrow } from "@mui/icons-material";

interface ProgressDisplayProps {
  progress: string;
  percentage: number;
  type?: "download" | "processing";
}

export default function ProgressDisplay({
  progress,
  percentage,
  type = "download",
}: ProgressDisplayProps) {
  const icon = type === "download" ? <Download /> : <PlayArrow />;
  const severity = type === "download" ? "info" : "success";

  return (
    <Alert severity={severity} sx={{ mt: 2 }}>
      <Box>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {icon}
          <Typography variant="body2">{progress}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
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
  );
}
