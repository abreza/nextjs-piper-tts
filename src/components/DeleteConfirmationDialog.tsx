import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { getModelDisplayName } from "../utils/voice";

interface DeleteConfirmationDialogProps {
  open: boolean;
  modelToDelete: string | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationDialog({
  open,
  modelToDelete,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => !isDeleting && onClose()}
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
        <Button onClick={onClose} disabled={isDeleting}>
          انصراف
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : <Delete />}
        >
          {isDeleting ? "در حال حذف..." : "حذف"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
