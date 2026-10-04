import { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import apiClient from '../api/client.js';

const statusColors = { Idle: 'default', 'In-Use': 'success', Maintenance: 'warning', Retired: 'error' };

function Panel({ title, question, children }) {
    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{question}</Typography>
                {children}
            </CardContent>
        </Card>
    );
}

function Dashboard() {
    const [lowFuel, setLowFuel] = useState([]);
    const [discrepancies, setDiscrepancies] = useState([]);
    const [completion, setCompletion] = useState([]);
    const [flags, setFlags] = useState([]);
    const [farms, setFarms] = useState([]);
    const [error, setError] = useState(null);

    const [supervisorId, setSupervisorId] = useState('');
    const [activeCount, setActiveCount] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const lowFuelResponse = await apiClient.get('/equipment?max_fuel=20');
                const discrepancyResponse = await apiClient.get('/fieldjobs/discrepencies');
                const completionResponse = await apiClient.get('/fieldjobs/completion');
                const flagsResponse = await apiClient.get('/farms/maintenance-flags');
                const farmsResponse = await apiClient.get('/farms');
                setLowFuel(lowFuelResponse.data);
                setDiscrepancies(discrepancyResponse.data);
                setCompletion(completionResponse.data);
                setFlags(flagsResponse.data);
                setFarms(farmsResponse.data);
            } catch {
                setError('Could not load dashboard data.');
            }
        };
        fetchData();
    }, []);

    const lookUpSupervisor = async () => {
        try {
            const response = await apiClient.get(`/fieldjobs/supervisor-active-field-hands?supervisor_id=${supervisorId}`);
            setActiveCount(response.data.active_field_hand_count);
        } catch {
            alert('Something went wrong');
        }
    };

    const supervisorIds = [...new Set(farms.map((farm) => farm.supervisor_id))];

    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
                <Panel title="Low Fuel Alert" question="Which active equipment units are operating below 20% fuel across all farms?">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Serial Number</TableCell>
                                <TableCell>Model</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Fuel</TableCell>
                                <TableCell align="right">Farm ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lowFuel.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.serial_number}</TableCell>
                                    <TableCell>{row.model}</TableCell>
                                    <TableCell><Chip label={row.status} color={statusColors[row.status]} size="small" /></TableCell>
                                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>{row.fuel_level}%</TableCell>
                                    <TableCell align="right">{row.farm_id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
                <Panel title="Co-Location Discrepancy" question="Which equipment units are assigned to field hands not located at the same farm?">
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>{new Set(discrepancies.map((row) => row.equipment_id)).size}</strong> equipment unit(s) across <strong>{discrepancies.length}</strong> field job(s).
                    </Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Job</TableCell>
                                <TableCell align="right">Equipment</TableCell>
                                <TableCell align="right">Equipment Farm</TableCell>
                                <TableCell align="right">Field Hand</TableCell>
                                <TableCell align="right">Field Hand Farm</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {discrepancies.map((row) => (
                                <TableRow key={row.field_job_id}>
                                    <TableCell>#{row.field_job_id} {row.title}</TableCell>
                                    <TableCell align="right">{row.equipment_id}</TableCell>
                                    <TableCell align="right">{row.equipment_farm_id}</TableCell>
                                    <TableCell align="right">{row.field_hand_id}</TableCell>
                                    <TableCell align="right">{row.field_hand_farm_id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
                <Panel title="Reliability Metrics" question="What is the field job completion / failure ratio by equipment model?">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Model</TableCell>
                                <TableCell align="right">Completed</TableCell>
                                <TableCell align="right">Failed</TableCell>
                                <TableCell align="right">Completed : Failed</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {completion.map((row) => (
                                <TableRow key={row.model}>
                                    <TableCell>{row.model}</TableCell>
                                    <TableCell align="right">{row.completed}</TableCell>
                                    <TableCell align="right">{row.failed}</TableCell>
                                    <TableCell align="right">{row.completed} : {row.failed}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
                <Panel title="Maintenance Flags" question="Which farms have more than 30% of their equipment flagged for maintenance?">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Farm</TableCell>
                                <TableCell align="right">Total Units</TableCell>
                                <TableCell align="right">In Maintenance</TableCell>
                                <TableCell align="right">Share</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {flags.map((row) => (
                                <TableRow key={row.farm_id}>
                                    <TableCell>{row.name} (#{row.farm_id})</TableCell>
                                    <TableCell align="right">{row.total_equipment}</TableCell>
                                    <TableCell align="right">{row.maintenance_equipment}</TableCell>
                                    <TableCell align="right" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                                        {Math.round((row.maintenance_equipment / row.total_equipment) * 100)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            </Grid>

            <Grid size={12}>
                <Panel title="Reporting Lines" question="How many field hands reporting to a Regional Agronomy Supervisor have active field jobs?">
                    <Stack direction="row" sx={{ gap: 2, mb: 2, alignItems: 'center' }}>
                        <TextField
                            select
                            label="Supervisor"
                            size="small"
                            value={supervisorId}
                            onChange={(e) => setSupervisorId(e.target.value)}
                            sx={{ minWidth: 260 }}
                        >
                            {supervisorIds.map((id) => (
                                <MenuItem key={id} value={id}>Supervisor #{id}</MenuItem>
                            ))}
                        </TextField>
                        <Button variant="outlined" onClick={lookUpSupervisor}>Look Up</Button>
                    </Stack>
                    {activeCount !== null && (
                        <Typography>
                            <strong>{activeCount}</strong> field hand(s) reporting to this supervisor have active field jobs.
                        </Typography>
                    )}
                </Panel>
            </Grid>
        </Grid>
    );
}

export default Dashboard;
