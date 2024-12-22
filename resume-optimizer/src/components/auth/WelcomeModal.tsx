import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Button,
    Typography,
    useTheme
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
}

export const WelcomeModal = ({ open, onClose }: WelcomeModalProps) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleTemplateChoice = (hasTemplate: boolean) => {
        setLoading(true);
        if (hasTemplate) {
            // Navigate to dashboard where latex upload section exists
            navigate('/dashboard');
        } else {
            // Navigate to templates page
            navigate('/templates');
        }
        onClose();
        setLoading(false);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 2
                }
            }}
        >
            <DialogTitle sx={{ 
                color: theme.palette.deepPurple.main,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.75rem'
            }}>
                Welcome to ResumeAI!
            </DialogTitle>
            <DialogContent>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 4,
                    py: 3
                }}>
                    <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                        Do you have a LaTeX Resume Template ready to use?
                    </Typography>

                    {/* Template Options */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        gap: 3
                    }}>
                        {/* Yes Button */}
                        <Button
                            variant="outlined"
                            disabled={loading}
                            onClick={() => handleTemplateChoice(true)}
                            sx={{
                                borderColor: theme.palette.deepPurple.main,
                                color: theme.palette.deepPurple.main,
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    borderColor: theme.palette.navy.main,
                                    color: theme.palette.navy.main,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            Yes, I have one
                        </Button>

                        {/* No Button - First one's on us */}
                        <Button
                            variant="contained"
                            disabled={loading}
                            onClick={() => handleTemplateChoice(false)}
                            sx={{
                                backgroundColor: theme.palette.deepPurple.main,
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                boxShadow: '0 4px 14px 0 rgba(94, 53, 177, 0.3)',
                                '&:hover': {
                                    backgroundColor: theme.palette.navy.main,
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 20px 0 rgba(94, 53, 177, 0.4)'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            First one's on us!
                        </Button>
                    </Box>

                    <Typography 
                        variant="body2" 
                        align="center" 
                        color="text.secondary"
                        sx={{ mt: 2 }}
                    >
                        Choose a template that best suits your needs or upload your own
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};