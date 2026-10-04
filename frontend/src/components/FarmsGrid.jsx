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
    Stack,
    TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = { name: '', location_region: '', capacity: '', supervisor_id: '' };

function FarmsGrid() {
    const { isAdmin } = useAuth();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const fetchFarms = async () => {
        try {
            const response = await apiClient.get('/farms');
            setFarms(response.data);
        } catch {
            setError('Could not load farms.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarms();
    }, []);

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (row) => {
        setEditingId(row.id);
        setForm(row);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        const payload = { ...form, capacity: Number(form.capacity), supervisor_id: Number(form.supervisor_id) };
        try {
            if (editingId) {
                await apiClient.put(`/farms/${editingId}`, payload);
            } else {
                await apiClient.post('/farms', payload);
            }
            setDialogOpen(false);
            fetchFarms();
        } catch {
            alert('Something went wrong');
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Delete farm ${row.name}?`)) return;
        try {
            await apiClient.delete(`/farms/${row.id}`);
            fetchFarms();
        } catch {
            alert('Something went wrong');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'location_region', headerName: 'Region', flex: 1, minWidth: 130 },
        { field: 'capacity', headerName: 'Capacity', type: 'number', width: 110 },
        { field: 'supervisor_id', headerName: 'Supervisor ID', type: 'number', width: 130 },
    ];

    if (isAdmin) {
        columns.push({
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem key="edit" icon={<EditRoundedIcon />} label="Edit" onClick={() => openEdit(params.row)} />,
                <GridActionsCellItem key="delete" icon={<DeleteRoundedIcon />} label="Delete" onClick={() => handleDelete(params.row)} />,
            ],
        });
    }

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {isAdmin && (
                <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ mb: 2 }} onClick={openAdd}>
                    Add Farm
                </Button>
            )}
            <DataGrid
                rows={farms}
                columns={columns}
                loading={loading}
                showToolbar
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                sx={{ bgcolor: 'background.paper', minHeight: 420 }}
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>{editingId ? `Edit Farm #${editingId}` : 'Add Farm'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <TextField label="Region" value={form.location_region} onChange={(e) => setForm({ ...form, location_region: e.target.value })} />
                        <TextField label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                        <TextField label="Supervisor ID" type="number" value={form.supervisor_id} onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FarmsGrid;
