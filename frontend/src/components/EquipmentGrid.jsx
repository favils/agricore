import { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const statusColors = { Idle: 'default', 'In-Use': 'success', Maintenance: 'warning', Retired: 'error' };
const emptyForm = { serial_number: '', model: '', status: 'Idle', fuel_level: '', farm_id: '' };

function EquipmentGrid() {
    const { isAdmin } = useAuth();
    const [equipment, setEquipment] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const fetchEquipment = async () => {
        try {
            const response = await apiClient.get('/equipment');
            const farmsResponse = await apiClient.get('/farms');
            setEquipment(response.data);
            setFarms(farmsResponse.data);
        } catch {
            setError('Could not load equipment.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
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
        const payload = { ...form, fuel_level: Number(form.fuel_level), farm_id: Number(form.farm_id) };
        try {
            if (editingId) {
                await apiClient.put(`/equipment/${editingId}`, payload);
            } else {
                await apiClient.post('/equipment', payload);
            }
            setDialogOpen(false);
            fetchEquipment();
        } catch {
            alert('Something went wrong');
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Delete equipment #${row.id}?`)) return;
        try {
            await apiClient.delete(`/equipment/${row.id}`);
            fetchEquipment();
        } catch {
            alert('Something went wrong');
        }
    };

    const farmName = (id) => farms.find((farm) => farm.id === id)?.name;

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'serial_number', headerName: 'Serial Number', flex: 1, minWidth: 130 },
        { field: 'model', headerName: 'Model', flex: 1, minWidth: 130 },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => <Chip label={params.value} color={statusColors[params.value]} size="small" />,
        },
        {
            field: 'fuel_level',
            headerName: 'Fuel',
            type: 'number',
            width: 170,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <LinearProgress
                        variant="determinate"
                        value={params.value}
                        color={params.value < 20 ? 'error' : 'primary'}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>{params.value}%</Typography>
                </Box>
            ),
        },
        {
            field: 'farm_id',
            headerName: 'Farm',
            flex: 1,
            minWidth: 150,
            valueGetter: (value) => `${farmName(value)} (#${value})`,
        },
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
                    Add Equipment
                </Button>
            )}
            <DataGrid
                rows={equipment}
                columns={columns}
                loading={loading}
                showToolbar
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                sx={{ bgcolor: 'background.paper', minHeight: 420 }}
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>{editingId ? `Edit Equipment #${editingId}` : 'Add Equipment'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Serial Number" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
                        <TextField label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                        <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            {Object.keys(statusColors).map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Fuel Level (%)" type="number" value={form.fuel_level} onChange={(e) => setForm({ ...form, fuel_level: e.target.value })} />
                        <TextField select label="Farm" value={form.farm_id} onChange={(e) => setForm({ ...form, farm_id: e.target.value })}>
                            {farms.map((farm) => (
                                <MenuItem key={farm.id} value={farm.id}>{farm.name} (#{farm.id})</MenuItem>
                            ))}
                        </TextField>
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

export default EquipmentGrid;
