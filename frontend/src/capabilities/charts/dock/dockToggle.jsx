import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { useDockStore } from "../../../stores/dockstore";

export default function DockToggle() {
    const dock = useDockStore(s => s.dock);
    const openDock = useDockStore(s => s.openDock);
    const closeDock = useDockStore(s => s.closeDock);

    return (
        <IconButton
            onClick={dock.open ? closeDock : openDock}
            size="small"
        >
            {dock.open
                ? <CloseIcon />
                : <OpenInFullIcon />}
        </IconButton>
    );
}