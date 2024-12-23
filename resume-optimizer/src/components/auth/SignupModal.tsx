// src/components/auth/SignupModal.tsx
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
import { WelcomeModal } from './WelcomeModal';

interface SignupModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchToLogin: () => void;  // New prop for switching to login
}

export const SignupModal = ({ open, onClose, onSuccess, onSwitchToLogin }: SignupModalProps) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        github_username: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const response = await api.register(formData);
            if (response.data) {
                const loginResponse = await api.login({
                    username: formData.email,
                    password: formData.password
                });

                if (loginResponse.data && loginResponse.data.access_token) {
                    localStorage.setItem('token', loginResponse.data.access_token);
                    onSuccess();
                    onClose();
                    setShowWelcomeModal(true); // Just show welcome modal
                } else {
                    setError('Registration successful but login failed. Please try logging in.');
                }
            } else {
                setError(response.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setError('Registration failed. Please check your information and try again.');
            console.error('Signup failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ 
                color: theme.palette.deepPurple.main,
                textAlign: 'center',
                fontWeight: 'bold'
            }}>
                Create Your Account
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
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={loading}
                            autoFocus
                            autoComplete="email"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                            helperText="Minimum 8 characters"
                        />
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            disabled={loading}
                            autoComplete="name"
                        />
                        <TextField
                            label="GitHub Username (Optional)"
                            fullWidth
                            value={formData.github_username}
                            onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                            disabled={loading}
                        />
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Already have an account?{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onClose();
                                        onSwitchToLogin();
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
                                    Login here
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
        {showWelcomeModal && (
                <WelcomeModal 
                    open={showWelcomeModal}
                    onClose={() => setShowWelcomeModal(false)}
                />
            )}
        </>
        
    );
};