import React, { useState } from 'react';
import { Box, Button, Card, Typography, CircularProgress, Alert } from '@mui/material';
import { CloudUpload, Close, Save } from '@mui/icons-material';
import { api } from '../../services/api';
import { getAuthToken } from '../../utils/auth';
import { Link } from 'react-router-dom';
import type { Skill } from '../../services/api';

interface ResumeSectionProps {
  onSkillsExtracted: (skills: Skill[]) => void;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ onSkillsExtracted }) => {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinalizingToCloud, setIsFinalizingToCloud] = useState<boolean>(false);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = getAuthToken();
    if (!token) {
      setError('Please log in to upload files.');
      return;
    }

    if (!file.name.endsWith('.tex') && !file.name.endsWith('.pdf')) {
      setError('Invalid file type. Please upload a PDF or .tex file.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Upload template and get PDF preview
      const uploadResponse = await api.uploadTemplate(file);
      if (uploadResponse.error) {
        throw new Error(uploadResponse.error);
      }

      if (uploadResponse.data?.id) {
        setTemplateId(uploadResponse.data.id);
        const previewResponse = await api.previewTemplate(uploadResponse.data.unique_id);
        if (previewResponse.data instanceof Blob) {
          const previewUrl = URL.createObjectURL(previewResponse.data);
          setPdfPreviewUrl(previewUrl);
        } else {
          throw new Error('Failed to generate PDF preview');
        }
      }

      // Extract skills and pass them up to parent
      const skillExtractRes = await api.extractSkillsFromFile(file);
      if (skillExtractRes.error) throw new Error(skillExtractRes.error);
      
      if (skillExtractRes.data) {
        console.log("Extracted skills:", skillExtractRes.data);
        onSkillsExtracted(skillExtractRes.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    try {
      setError(null);
      if (templateId) {
        await api.deleteTemplate(templateId);
      }
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      setPdfPreviewUrl(null);
      setTemplateId(null);
    } catch (error) {
      setError('Failed to delete the template.');
    }
  };

  const handleFinalizeToCloudinary = async () => {
    try {
      setIsFinalizingToCloud(true);
      setError(null);

      const response = await api.finalizeTemplate();
      if (response.error) {
        throw new Error(response.error);
      }

      alert('Successfully uploaded to Cloudinary!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload to Cloudinary');
    } finally {
      setIsFinalizingToCloud(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {pdfPreviewUrl ? (
        <Box
          sx={{
            width: '100%',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(147,112,219,0.15)',
            }}
          >
            <Box
              sx={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <iframe
                src={pdfPreviewUrl}
                style={{
                  width: '100%',
                  height: '700px',
                  border: 'none',
                }}
              />
            </Box>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                bgcolor: 'white',
                borderTop: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleRemoveFile}
                startIcon={<Close />}
                color="error"
              >
                Remove
              </Button>
              <Button
                variant="contained"
                onClick={handleFinalizeToCloudinary}
                disabled={isFinalizingToCloud}
                startIcon={<Save />}
                sx={{
                  bgcolor: 'deepPurple.main',
                  '&:hover': {
                    bgcolor: 'deepPurple.dark',
                  },
                }}
              >
                {isFinalizingToCloud ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Card>
        </Box>
      ) : (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'lavender.main',
            borderRadius: 2,
            p: 6,
            textAlign: 'center',
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 4px 20px rgba(147,112,219,0.15)',
          }}
        >
          {uploading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                zIndex: 2,
              }}
            >
              <CircularProgress sx={{ color: 'deepPurple.main' }} />
            </Box>
          )}

          <CloudUpload
            sx={{
              fontSize: { xs: 48, sm: 64 },
              color: 'deepPurple.main',
              mb: { xs: 1, sm: 2 },
            }}
          />
          <Typography
            variant="h5"
            sx={{
              color: 'deepPurple.main',
              mb: { xs: 2, sm: 3 },
              fontWeight: 500,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Upload your LaTeX Resume
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              backgroundColor: 'deepPurple.main',
              color: 'white',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Choose File
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".tex"
            />
          </Button>
        </Box>
      )}
      <Box sx={{ 
            mt: 4, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Don't have a LaTeX Resume?
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/templates" // We'll create this route
              sx={{
                bgcolor: 'deepPurple.main',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 0 20px rgba(102, 51, 183, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'white',
                  color: 'deepPurple.main',
                  boxShadow: '0 0 30px rgba(102, 51, 183, 0.5)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Choose a Template
            </Button>
          </Box>
          <Box>
            {/* ... after you’ve successfully extracted skills into resumeSkills... */}
            < Typography></Typography>
          </Box>
    </Box>
  );
};

export default ResumeSection;