import { useState } from 'react';
import {
    Avatar,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AgricultureRoundedIcon from '@mui/icons-material/AgricultureRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import GrassRoundedIcon from '@mui/icons-material/GrassRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useColorMode } from './context/ColorModeContext.jsx';
import LoginForm from './components/LoginForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import EquipmentGrid from './components/EquipmentGrid.jsx';
import FieldJobsGrid from './components/FieldJobsGrid.jsx';
import ServiceReports from './components/ServiceReports.jsx';
import FarmsGrid from './components/FarmsGrid.jsx';
import UsersGrid from './components/UsersGrid.jsx';

const drawerWidth = 240;

function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const { mode, toggleColorMode } = useColorMode();
    const [selected, setSelected] = useState(0);

    const pages = [
        { label: 'Dashboard', icon: <DashboardRoundedIcon />, component: <Dashboard /> },
        { label: 'Equipment', icon: <AgricultureRoundedIcon />, component: <EquipmentGrid /> },
        { label: 'Field Jobs', icon: <AssignmentRoundedIcon />, component: <FieldJobsGrid /> },
        { label: 'Service Reports', icon: <DescriptionRoundedIcon />, component: <ServiceReports /> },
        { label: 'Farms', icon: <GrassRoundedIcon />, component: <FarmsGrid /> },
    ];
    if (isAdmin) {
        pages.push({ label: 'Users', icon: <PeopleRoundedIcon />, component: <UsersGrid /> });
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Drawer
                variant="permanent"
                sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth } }}
            >
                <Box sx={{ p: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                        <SpaRoundedIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700, mr: 'auto' }}>AgriCore</Typography>
                        <IconButton onClick={toggleColorMode}>
                            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                        </IconButton>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Prairie Crest Agricultural Cooperative
                    </Typography>
                </Box>
                <Divider />
                <List dense sx={{ flexGrow: 1, p: 1 }}>
                    {pages.map((page, index) => (
                        <ListItemButton key={page.label} selected={index === selected} onClick={() => setSelected(index)}>
                            <ListItemIcon>{page.icon}</ListItemIcon>
                            <ListItemText primary={page.label} />
                        </ListItemButton>
                    ))}
                </List>
                <Stack direction="row" sx={{ p: 2, gap: 1, alignItems: 'center', borderTop: 1, borderColor: 'divider' }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                        {user.sub[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ mr: 'auto' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.sub}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.role}</Typography>
                    </Box>
                    <IconButton onClick={logout}>
                        <LogoutRoundedIcon />
                    </IconButton>
                </Stack>
            </Drawer>
            <Container maxWidth="xl" sx={{ py: 4, overflowY: 'auto' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {pages[selected].label}
                </Typography>
                {pages[selected].component}
            </Container>
        </Box>
    );
}

function AppContent() {
    const { user } = useAuth();
    return user ? <Layout /> : <LoginForm />;
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
