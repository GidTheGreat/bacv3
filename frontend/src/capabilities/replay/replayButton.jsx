import { IconButton } from "@mui/material";
import Replay from '@mui/icons-material/Replay';

import { useDockStore } from "../../stores/dockstore";

export default function ReplayButton({ ctx }) {
    const addDockPanel = useDockStore(s => s.addDockPanel);

    return (
        <IconButton
            size="small"
            onClick={() =>
                addDockPanel({
                    id: "replay",
                    title: "replay"
                })
            }
        >
            <Replay />
        </IconButton>
    );
}