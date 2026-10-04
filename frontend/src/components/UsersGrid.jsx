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
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const roles = ['Farm Operations Admin', 'Field Hand', 'Auditor'];
const emptyForm = { username: '', password: '', role: 'Auditor' };

function UsersGrid() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const [editUser, setEditUser] = useState(null);
    const [editRole, setEditRole] = useState('Auditor');

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/auth/users');
            setUsers(response.data);
        } catch {
            setError('Could not load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async () => {
        try {
            await apiClient.post('/auth/register', form);
            setAddOpen(false);
            fetchUsers();
        } catch {
            alert('Something went wrong');
        }
    };

    const handleRoleSave = async () => {
        try {
            await apiClient.patch(`/auth/users/${editUser.id}`, { role: editRole });
            setEditUser(null);
            fetchUsers();
        } catch {
            alert('Something went wrong');
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Delete user ${row.username}?`)) return;
        try {
            await apiClient.delete(`/auth/users/${row.id}`);
            fetchUsers();
        } catch {
            alert('Something went wrong');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'username', headerName: 'Username', flex: 1, minWidth: 160 },
        { field: 'role', headerName: 'Role', flex: 1, minWidth: 180 },
        {
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params) => {
                const actions = [
                    <GridActionsCellItem
                        key="edit"
                        icon={<EditRoundedIcon />}
                        label="Edit Role"
                        onClick={() => { setEditUser(params.row); setEditRole(params.row.role); }}
                    />,
                ];
                if (params.row.username !== user.sub) {
                    actions.push(<GridActionsCellItem key="delete" icon={<DeleteRoundedIcon />} label="Delete" onClick={() => handleDelete(params.row)} />);
                }
                return actions;
            },
        },
    ];

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
                variant="contained"
                startIcon={<PersonAddRoundedIcon />}
                sx={{ mb: 2 }}
                onClick={() => { setForm(emptyForm); setAddOpen(true); }}
            >
                Add User
            </Button>
            <DataGrid
                rows={users}
                columns={columns}
                loading={loading}
                showToolbar
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                sx={{ bgcolor: 'background.paper', minHeight: 420 }}
            />

            <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                        <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} helperText="At least 8 characters" />
                        <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            {roles.map((role) => (
                                <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editUser !== null} onClose={() => setEditUser(null)} fullWidth maxWidth="xs">
                <DialogTitle>Edit role: {editUser?.username}</DialogTitle>
                <DialogContent>
                    <TextField select fullWidth label="Role" value={editRole} onChange={(e) => setEditRole(e.target.value)} sx={{ mt: 1 }}>
                        {roles.map((role) => (
                            <MenuItem key={role} value={role}>{role}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditUser(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRoleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default UsersGrid;
