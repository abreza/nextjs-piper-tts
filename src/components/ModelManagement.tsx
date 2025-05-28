import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { ExpandMore, Refresh, DeleteSweep, Delete } from "@mui/icons-material";
import {
  getModelDisplayName,
  getModelDescription,
  formatFileSize,
} from "../utils/voice";

interface ModelManagementProps {
  downloadedModels: string[];
  isLoadingModels: boolean;
  isDeleting: boolean;
  onRefresh: () => void;
  onClearAll: () => void;
  onDeleteModel: (modelId: string) => void;
}

export default function ModelManagement({
  downloadedModels,
  isLoadingModels,
  isDeleting,
  onRefresh,
  onClearAll,
  onDeleteModel,
}: ModelManagementProps) {
  return (
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
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                مدل‌های ذخیره شده در مرورگر شما
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={onRefresh}
                  disabled={isLoadingModels}
                >
                  به‌روزرسانی
                </Button>
                {downloadedModels.length > 0 && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteSweep />}
                    onClick={onClearAll}
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
                هیچ مدلی دانلود نشده است. پس از اولین استفاده از هر صدا، مدل آن
                در اینجا نمایش داده خواهد شد.
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
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {getModelDescription(modelId)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {modelId} • تقریباً{" "}
                            {formatFileSize(60 * 1024 * 1024)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => onDeleteModel(modelId)}
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
  );
}
