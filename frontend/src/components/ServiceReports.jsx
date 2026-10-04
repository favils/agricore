import { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function ServiceReports() {
    const { isAdmin, isFieldHand } = useAuth();
    const [reports, setReports] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [jobId, setJobId] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);

    const fetchReports = async () => {
        try {
            const reportsResponse = await apiClient.get('/service-reports');
            const jobsResponse = await apiClient.get('/fieldjobs');
            setReports(reportsResponse.data);
            setJobs(jobsResponse.data);
        } catch {
            setError('Could not load service reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const openUpload = () => {
        setJobId('');
        setNotes('');
        setFile(null);
        setDialogOpen(true);
    };

    const handleUpload = async () => {
        const data = new FormData();
        data.append('field_job_id', jobId);
        data.append('notes', notes);
        data.append('file', file);
        try {
            await apiClient.post('/service-reports', data);
            setDialogOpen(false);
            fetchReports();
        } catch {
            alert('Something went wrong');
        }
    };

    const handleOpenFile = async (row) => {
        try {
            const response = await apiClient.get(`/service-reports/${row.id}/file`, { responseType: 'blob' });
            window.open(URL.createObjectURL(response.data), '_blank');
        } catch {
            alert('Something went wrong');
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Delete service report #${row.id}?`)) return;
        try {
            await apiClient.delete(`/service-reports/${row.id}`);
            fetchReports();
        } catch {
            alert('Something went wrong');
        }
    };

    const jobTitle = (id) => {
        const job = jobs.find((j) => j.id === id);
        return job ? `#${id} ${job.title}` : id;
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'field_job_id', headerName: 'Field Job', flex: 1, minWidth: 170, valueGetter: (value) => jobTitle(value) },
        { field: 'notes', headerName: 'Notes', flex: 1.5, minWidth: 200 },
        { field: 'file_url', headerName: 'Attachment', flex: 1, minWidth: 150, valueGetter: (value) => value.split('-').slice(5).join('-') || value },
        { field: 'created_at', headerName: 'Uploaded', type: 'dateTime', width: 180, valueGetter: (value) => new Date(value) },
        {
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params) => {
                const actions = [
                    <GridActionsCellItem key="open" icon={<DownloadRoundedIcon />} label="Open" onClick={() => handleOpenFile(params.row)} />,
                ];
                if (isAdmin) {
                    actions.push(<GridActionsCellItem key="delete" icon={<DeleteRoundedIcon />} label="Delete" onClick={() => handleDelete(params.row)} />);
                }
                return actions;
            },
        },
    ];

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {(isAdmin || isFieldHand) && (
                <Button variant="contained" startIcon={<UploadFileRoundedIcon />} sx={{ mb: 2 }} onClick={openUpload}>
                    Upload Report
                </Button>
            )}
            <DataGrid
                rows={reports}
                columns={columns}
                loading={loading}
                showToolbar
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                sx={{ bgcolor: 'background.paper', minHeight: 420 }}
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Upload Service Report</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField select label="Field Job" value={jobId} onChange={(e) => setJobId(e.target.value)}>
                            {jobs.map((job) => (
                                <MenuItem key={job.id} value={job.id}>#{job.id} {job.title}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Notes" multiline minRows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        <Button variant="outlined" component="label" startIcon={<UploadFileRoundedIcon />}>
                            {file ? file.name : 'Choose File'}
                            <input type="file" hidden accept=".png,.jpg,.jpeg,.txt,.pdf" onChange={(e) => setFile(e.target.files[0])} />
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpload}>Upload</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ServiceReports;
