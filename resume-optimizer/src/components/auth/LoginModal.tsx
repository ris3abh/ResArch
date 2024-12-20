// src/components/auth/LoginModal.tsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    useTheme,
    Alert,
    Typography,
    Link
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchToSignup: () => void;  // New prop for switching to signup
}

export const LoginModal = ({ open, onClose, onSuccess, onSwitchToSignup }: LoginModalProps) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const response = await api.login(formData);
            if (response.data && response.data.access_token) {
                // Store the token
                localStorage.setItem('token', response.data.access_token);
                onSuccess();
                onClose();
                // Navigate to dashboard after successful login
                navigate('/dashboard');
            } else {
                setError(response.error || 'Login failed: No token received');
            }
        } catch (error) {
            setError('Login failed. Please check your credentials and try again.');
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };    

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ 
                color: theme.palette.deepPurple.main,
                textAlign: 'center',
                fontWeight: 'bold'
            }}>
                Login to Your Account
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField
                            label="Username"
                            fullWidth
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={loading}
                            autoFocus
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Don't have an account?{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onClose();
                                        onSwitchToSignup();
                                    }}
                                    sx={{
                                        color: theme.palette.deepPurple.main,
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                            color: theme.palette.navy.main,
                                        },
                                    }}
                                >
                                    Sign up here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={onClose} 
                        variant="outlined"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            backgroundColor: theme.palette.deepPurple.main,
                            '&:hover': {
                                backgroundColor: theme.palette.navy.main,
                            }
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};