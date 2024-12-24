// src/pages/WorkProfile.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container
} from '@mui/material';
import { 
  Add, 
  Save, 
  Delete as DeleteIcon, 
  Edit as EditIcon 
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns'; // <-- date-fns import
import { api } from '../services/api';
import type { WorkExperience, WorkExperienceCreate } from '../services/api';

const WorkProfile: React.FC = () => {
  // For additional free-form text (dummy for now)
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Word count for the text area
  const wordCount = additionalDetails.trim().split(/\s+/).filter(Boolean).length;

  // For dynamic form of multiple experiences
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);

  // For new experience input
  const [newExperience, setNewExperience] = useState<WorkExperienceCreate>({
    position: '',
    company_name: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  // For editing an existing experience
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<WorkExperienceCreate>({
    position: '',
    company_name: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  // ======================================
  //  1) Fetch existing experiences on mount
  // ======================================
  useEffect(() => {
    const fetchExperiences = async () => {
      const response = await api.getWorkExperiences(); 
      if (response.data) {
        setWorkExperiences(response.data);
      }
    };
    fetchExperiences();
  }, []);

  // ======================================
  //  2) Add a new experience
  // ======================================
  const handleAddExperience = async () => {
    // Basic validation
    if (!newExperience.position || !newExperience.company_name) {
      alert('Please fill the role (position) and company before adding.');
      return;
    }

    const response = await api.addWorkExperience(newExperience);
    if (response.error) {
      alert(`Error adding experience: ${response.error}`);
      return;
    }
    if (!response.data) {
      return; // no valid data
    }

    // Append the new experience
    setWorkExperiences(prev => [...prev, response.data]);

    // Reset the form
    setNewExperience({
      position: '',
      company_name: '',
      start_date: '',
      end_date: '',
      description: '',
    });
  };

  // ======================================
  //  3) Edit an existing experience
  // ======================================
  const handleEditClick = (exp: WorkExperience) => {
    setEditingId(exp.id);

    // Convert stored date (e.g., "2021-05-01T00:00:00") to "yyyy-MM-dd" for the <input type="date">
    const startDateValue = exp.start_date
      ? format(parseISO(exp.start_date), 'yyyy-MM-dd')
      : '';
    const endDateValue = exp.end_date
      ? format(parseISO(exp.end_date), 'yyyy-MM-dd')
      : '';

    setEditingExperience({
      position: exp.position,
      company_name: exp.company_name,
      start_date: startDateValue,
      end_date: endDateValue,
      description: exp.description ?? '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingExperience({
      position: '',
      company_name: '',
      start_date: '',
      end_date: '',
      description: '',
    });
  };

  const handleUpdateExperience = async () => {
    if (!editingId) return;

    const response = await api.updateWorkExperience(editingId, editingExperience);
    if (response.error) {
      alert(`Error updating experience: ${response.error}`);
      return;
    }

    if (response.data) {
      // Update the array in state
      setWorkExperiences(prev =>
        prev.map((item) => (item.id === editingId ? response.data! : item))
      );
      // Clear editing states
      handleCancelEdit();
    }
  };

  // ======================================
  //  4) Delete an experience
  // ======================================
  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return;
    }
    const response = await api.deleteWorkExperience(id);
    if (response.error) {
      alert(`Error deleting experience: ${response.error}`);
      return;
    }
    setWorkExperiences(prev => prev.filter(ex => ex.id !== id));
  };

  // ======================================
  //  Utility Handlers
  // ======================================
  const handleChangeNewExperience = (field: keyof WorkExperienceCreate, value: string) => {
    setNewExperience(prev => ({ ...prev, [field]: value }));
  };

  const handleChangeEditingExperience = (field: keyof WorkExperienceCreate, value: string) => {
    setEditingExperience(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAdditionalDetails = () => {
    alert('For now, we are not saving these details to the backend.\n\n' + additionalDetails);
  };

  // ======================================
  //  Date formatting for display
  // ======================================
  const formatDateForDisplay = (isoString?: string) => {
    if (!isoString) return 'Present';
    try {
      return format(parseISO(isoString), 'MM/dd/yyyy');
    } catch (error) {
      // fallback: if parse fails, just substring
      return isoString.slice(0, 10);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ width: '100%', py: 4 }}>
      <Grid container spacing={4}>
        
        {/* LEFT SIDE: Lavender box with open-ended text + Add Experience form */}
        <Grid item xs={12} md={6}>

          {/* Box for the "Tell us about your work" */}
          <Box
            sx={{
              backgroundColor: '#E6E6FA',
              borderRadius: 2,
              p: 3,
              mb: 4,
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#4A148C', 
                mb: 2 
              }}
            >
              Tell us about the unique aspects of your work that aren't captured in your resume.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Ideal length: 100-300 words
            </Typography>

            <TextField
              multiline
              minRows={5}
              fullWidth
              placeholder="e.g. 'I love tackling complex data problems...' "
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              sx={{
                transition: 'all 0.3s ease',
                '&:focus-within': {
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 5px rgba(0, 0, 0, 0.15)',
                },
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Word Count: {wordCount}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Some things you might consider:
              </Typography>
              <Typography variant="body2">
                - What accomplishments are you most proud of?
              </Typography>
              <Typography variant="body2">
                - What kind of projects excite you the most?
              </Typography>
              <Typography variant="body2">
                - What’s a challenge you solved that isn’t on your resume?
              </Typography>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveAdditionalDetails}
                sx={{
                  backgroundColor: '#4A148C',
                  '&:hover': { backgroundColor: '#6A1B9A' }
                }}
              >
                Save Additional Details (Dummy)
              </Button>
            </Box>
          </Box>

          {/* Box for "Add a New Experience" */}
          <Box sx={{ borderRadius: 2, p: 3 }}>
            <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
              Add a New Experience
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Role"
                  value={newExperience.position}
                  onChange={(e) => handleChangeNewExperience('position', e.target.value)}
                  fullWidth
                  placeholder="e.g. Software Engineer"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Company"
                  value={newExperience.company_name}
                  onChange={(e) => handleChangeNewExperience('company_name', e.target.value)}
                  fullWidth
                  placeholder="e.g. TechCorp Inc."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={newExperience.start_date}
                  onChange={(e) => handleChangeNewExperience('start_date', e.target.value)}
                  fullWidth
                  placeholder="mm/dd/yyyy"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={newExperience.end_date}
                  onChange={(e) => handleChangeNewExperience('end_date', e.target.value)}
                  fullWidth
                  placeholder="mm/dd/yyyy"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={newExperience.description}
                  onChange={(e) => handleChangeNewExperience('description', e.target.value)}
                  multiline
                  fullWidth
                  placeholder="Responsibilities, achievements, etc."
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddExperience}
                sx={{
                  borderColor: '#4A148C',
                  color: '#4A148C',
                  '&:hover': {
                    borderColor: '#6A1B9A',
                    color: '#6A1B9A',
                  }
                }}
              >
                Add Work Experience
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* RIGHT SIDE: List/Edit of existing experiences */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Your Work Experiences
          </Typography>

          {workExperiences.map(ex => {
            // If this experience is being edited, show editing fields
            if (editingId === ex.id) {
              return (
                <Card 
                  key={ex.id} 
                  sx={{ 
                    mb: 2, 
                    boxShadow: 2,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Role"
                          value={editingExperience.position}
                          onChange={(e) => handleChangeEditingExperience('position', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Company"
                          value={editingExperience.company_name}
                          onChange={(e) => handleChangeEditingExperience('company_name', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="date"
                          label="Start Date"
                          InputLabelProps={{ shrink: true }}
                          value={editingExperience.start_date}
                          onChange={(e) => handleChangeEditingExperience('start_date', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          type="date"
                          label="End Date"
                          InputLabelProps={{ shrink: true }}
                          value={editingExperience.end_date}
                          onChange={(e) => handleChangeEditingExperience('end_date', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Description"
                          value={editingExperience.description}
                          onChange={(e) => handleChangeEditingExperience('description', e.target.value)}
                          multiline
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions sx={{ display: 'flex', gap: 1, ml: 2, mb: 2 }}>
                    <Button 
                      variant="contained" 
                      color="success" 
                      onClick={handleUpdateExperience}
                    >
                      Save
                    </Button>
                    <Button variant="outlined" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </CardActions>
                </Card>
              );
            }

            // Otherwise, display the static (read-only) view
            return (
              <Card 
                key={ex.id} 
                sx={{ 
                  mb: 2, 
                  boxShadow: 2,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              >
                <CardContent>
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {ex.position}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {ex.company_name}
                  </Typography>
                  <Typography variant="body2">
                    {formatDateForDisplay(ex.start_date)} - {ex.end_date ? formatDateForDisplay(ex.end_date) : 'Present'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {ex.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ display: 'flex', gap: 1, ml: 2, mb: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />} 
                    onClick={() => handleEditClick(ex)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteIcon />} 
                    onClick={() => handleDeleteExperience(ex.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Grid>

      </Grid>
    </Container>
  );
};

export default WorkProfile;
