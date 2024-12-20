// src/components/common/LoadingProgress.tsx
import { LinearProgress, styled } from '@mui/material';

const LoadingProgress = styled(LinearProgress)(({ theme }) => ({
  width: '100%',
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.deepPurple.main,
  },
  backgroundColor: theme.palette.lavender.main,
}));

export default LoadingProgress;