// src/components/common/ErrorAlert.tsx
import { Alert, AlertTitle, Button, Box } from '@mui/material';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

const ErrorAlert = ({ message, onRetry }: ErrorAlertProps) => {
  return (
    <Alert 
      severity="error"
      action={
        onRetry && (
          <Button 
            color="inherit" 
            size="small" 
            onClick={onRetry}
          >
            RETRY
          </Button>
        )
      }
      sx={{ mb: 2 }}
    >
      <AlertTitle>Error</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorAlert;