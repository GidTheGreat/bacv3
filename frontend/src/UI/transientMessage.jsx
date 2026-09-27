import { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

import useAppStore from '../stores/appStore';

// Slide transition handler that dictates the glide-in direction
function SlideTransition(props) {
    return <Slide {...props} direction="left" />;
}

function TransientHelper({ msg }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!msg) return;

        // Force reset the state to trigger the slide animation if a message arrives back-to-back
        setOpen(false); 
        
        const triggerTimeout = setTimeout(() => {
            setOpen(true);
        }, 50);

        return () => clearTimeout(triggerTimeout);
    }, [msg]);

    const handleClose = (event, reason) => {
        // Prevent closing if the user clicks out accidentally
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    // Dynamically derive the severity variant depending on the log type
    const getSeverity = (text) => {
        if (!text) return 'info';
        const lowerText = text.toLowerCase();
        if (lowerText.includes('success')) return 'success';
        if (lowerText.includes('fail') || lowerText.includes('error')) return 'error';
        if (lowerText.includes('warn')) return 'warning';
        return 'info'; // Fallback style for default logs like [UPLOADED FILE]
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={10000} // Matches your 10 second requirement
            onClose={handleClose}
            TransitionComponent={SlideTransition}
            // Overriding positioning behavior to align inside your stack context cleanly
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{
                position: 'static', // Prevents fixed overlaps when stacked inside the parent container
                transform: 'none',
                width: '100%',
                maxWidth: '450px',
            }}
        >
            <Alert 
                severity={getSeverity(msg)}
                variant="filled" 
                onClose={handleClose}
                sx={{ 
                    width: '100%',
                    fontWeight: 500,
                    borderRadius: '12px',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
                    fontFamily: 'monospace', // Tailored for your database/file parsing log text style
                    fontSize: '0.875rem',
                    letterSpacing: '-0.01em'
                }}
            >
                {msg}
            </Alert>
        </Snackbar>
    );
}

export default function TransientMsg() {
    const notification = useAppStore(s => s.notification);
    
    return (
        <div style={{
            position: "fixed",
            top: "24px", // Snugger spacing from top window boundary
            right: "24px",
            zIndex: 20000,
            display: 'flex',
            flexDirection: "column",
            gap: "12px", // Distinct gaps if multiple items end up layout-rendering
            width: 'auto',
            pointerEvents: 'none' // Allows clicking elements underneath the container wrapper
        }}>
            {/* Re-enable interaction strictly on the notification children elements */}
            <div style={{ pointerEvents: 'auto' }}>
                <TransientHelper msg={notification}/>
            </div>
        </div>
    );
}


