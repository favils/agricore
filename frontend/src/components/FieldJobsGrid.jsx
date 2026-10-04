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
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const priorityColors = { Low: 'default', Medium: 'warning', Critical: 'error' };
const statusColors = { Pending: 'default', 'In-Progress': 'info', Completed: 'success', Failed: 'error' };
const emptyForm = { title: '', priority: 'Low', status: 'Pending', equipment_id: '', field_hand_id: '' };

function FieldJobsGrid() {
    const { isAdmin, isFieldHand } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [fieldHands, setFieldHands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [statusJob, setStatusJob] = useState(null);
    const [newStatus, setNewStatus] = useState('Pending');

    const fetchJobs = async () => {
        try {
            const jobsResponse = await apiClient.get('/fieldjobs');
            const equipmentResponse = await apiClient.get('/equipment');
            const fieldHandsResponse = await apiClient.get('/fieldhands');
            setJobs(jobsResponse.data);
            setEquipment(equipmentResponse.data);
            setFieldHands(fieldHandsResponse.data);
        } catch {
            setError('Could not load field jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
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
        try {
            if (editingId) {
                await apiClient.put(`/fieldjobs/${editingId}`, form);
            } else {
                await apiClient.post('/fieldjobs', form);
            }
            setDialogOpen(false);
            fetchJobs();
        } catch {
            alert('Something went wrong');
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Delete field job #${row.id}?`)) return;
        try {
            await apiClient.delete(`/fieldjobs/${row.id}`);
            fetchJobs();
        } catch {
            alert('Something went wrong');
        }
    };

    const handleStatusSave = async () => {
        try {
            await apiClient.patch(`/fieldjobs/${statusJob.id}/status`, { status: newStatus });
            setStatusJob(null);
            fetchJobs();
        } catch {
            alert('Something went wrong');
        }
    };

    const equipmentName = (id) => {
        const unit = equipment.find((e) => e.id === id);
        return unit ? `#${id} ${unit.serial_number} · ${unit.model}` : id;
    };
    const fieldHandName = (id) => {
        const hand = fieldHands.find((h) => h.id === id);
        return hand ? `${hand.name} (#${id})` : id;
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'title', headerName: 'Title', flex: 1, minWidth: 160 },
        {
            field: 'priority',
            headerName: 'Priority',
            width: 110,
            renderCell: (params) => <Chip label={params.value} color={priorityColors[params.value]} size="small" />,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => <Chip label={params.value} color={statusColors[params.value]} size="small" variant="outlined" />,
        },
        { field: 'equipment_id', headerName: 'Equipment', flex: 1, minWidth: 170, valueGetter: (value) => equipmentName(value) },
        { field: 'field_hand_id', headerName: 'Field Hand', flex: 1, minWidth: 130, valueGetter: (value) => fieldHandName(value) },
    ];

    if (isAdmin || isFieldHand) {
        columns.push({
            field: 'actions',
            type: 'actions',
            width: 120,
            getActions: (params) => {
                const actions = [
                    <GridActionsCellItem
                        key="status"
                        icon={<SyncRoundedIcon />}
                        label="Change Status"
                        onClick={() => { setStatusJob(params.row); setNewStatus(params.row.status); }}
                    />,
                ];
                if (isAdmin) {
                    actions.push(<GridActionsCellItem key="edit" icon={<EditRoundedIcon />} label="Edit" onClick={() => openEdit(params.row)} />);
                    actions.push(<GridActionsCellItem key="delete" icon={<DeleteRoundedIcon />} label="Delete" onClick={() => handleDelete(params.row)} />);
                }
                return actions;
            },
        });
    }

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {isAdmin && (
                <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ mb: 2 }} onClick={openAdd}>
                    Add Field Job
                </Button>
            )}
            <DataGrid
                rows={jobs}
                columns={columns}
                loading={loading}
                showToolbar
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                sx={{ bgcolor: 'background.paper', minHeight: 420 }}
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>{editingId ? `Edit Field Job #${editingId}` : 'Add Field Job'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        <TextField select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                            {Object.keys(priorityColors).map((priority) => (
                                <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            {Object.keys(statusColors).map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Equipment" value={form.equipment_id} onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}>
                            {equipment.map((unit) => (
                                <MenuItem key={unit.id} value={unit.id}>{equipmentName(unit.id)}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Field Hand" value={form.field_hand_id} onChange={(e) => setForm({ ...form, field_hand_id: e.target.value })}>
                            {fieldHands.map((hand) => (
                                <MenuItem key={hand.id} value={hand.id}>{fieldHandName(hand.id)}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={statusJob !== null} onClose={() => setStatusJob(null)} fullWidth maxWidth="xs">
                <DialogTitle>Update status: {statusJob?.title}</DialogTitle>
                <DialogContent>
                    <TextField select fullWidth label="Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} sx={{ mt: 1 }}>
                        {Object.keys(statusColors).map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusJob(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleStatusSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FieldJobsGrid;
