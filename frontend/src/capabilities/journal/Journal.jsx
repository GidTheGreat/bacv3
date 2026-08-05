import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton
} from "@mui/material";
import BookIcon from "@mui/icons-material/Book";

const STORAGE_KEY = "journalEntries";
function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
const emptyEntry = () => ({
  id: id(),
  dateUTC: "",
  timeUTC: "",

  symbol: "",
  market: "",
  timeframes: "",

  direction: "",
  entryPrice: "",
  exitPrice: "",
  stopLoss: "",
  takeProfit: "",
  positionSize: "",
  risk: "",
  fees: "",
  pnl: "",
  rMultiple: "",
  duration: "",

  strategy: "",
  bias: "",
  confidence: "",

  entryReasons: [],

  entryComment: "",

  followedPlan: "",
  entryQuality: "",
  exitQuality: "",
  brokenRules: "",

  outcome: "",
  outcomeNotes: "",

  beforeEmotion: "",
  duringEmotion: "",
  afterEmotion: "",
  stress: "",
  confidenceLevel: "",

  takeAgain: "",
  strength: "",
  mistake: "",
  improvement: "",

  beforeScreenshot: "",
  afterScreenshot: "",

  chartState: "// TODO: Save chart state here",
});

const REASONS = [
  "Market Structure",
  "Liquidity Sweep",
  "OTE",
  "Fair Value Gap",
  "Order Block",
  "Volume Confirmation",
  "Trend Continuation",
  "Other",
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (stored.length) {
      setEntries(stored);
    } else {
      setEntries([emptyEntry()]);
    }
  }, []);

  const current = entries[selected];

  const update = (field, value) => {
    const copy = [...entries];
    copy[selected] = {
      ...copy[selected],
      [field]: value,
    };
    setEntries(copy);
  };

  const toggleReason = (reason) => {
    const reasons = current.entryReasons.includes(reason)
      ? current.entryReasons.filter((r) => r !== reason)
      : [...current.entryReasons, reason];

    update("entryReasons", reasons);
  };

  const addEntry = () => {
    const copy = [...entries, emptyEntry()];
    setEntries(copy);
    setSelected(copy.length - 1);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  };

  if (!current) return null;

  return (<>
  
    <IconButton onClick={() => setOpen(true)}>
        <BookIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
      <Box
        sx={{
          width: 900,
          height: "100%",
          display: "flex",
        }}
      >
        {/* Entry List */}
        <Box
          sx={{
            width: 250,
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Button onClick={addEntry}>+ New Entry</Button>

          <Divider />

          <List dense>
            {entries.map((entry, i) => (
              <ListItemButton
                key={entry.id}
                selected={selected === i}
                onClick={() => setSelected(i)}
              >
                <ListItemText
                  primary={entry.symbol || "New Trade"}
                  secondary={`${entry.dateUTC} ${entry.timeUTC}`}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Form */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h5">Journal Entry</Typography>

            <Divider />

            <Typography variant="h6">General</Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Date UTC"
                value={current.dateUTC}
                onChange={(e) => update("dateUTC", e.target.value)}
                fullWidth
              />

              <TextField
                label="Time UTC"
                value={current.timeUTC}
                onChange={(e) => update("timeUTC", e.target.value)}
                fullWidth
              />
            </Stack>

            <TextField
              label="Symbol"
              value={current.symbol}
              onChange={(e) => update("symbol", e.target.value)}
            />

            <TextField
              label="Market"
              value={current.market}
              onChange={(e) => update("market", e.target.value)}
            />

            <TextField
              label="Timeframes"
              value={current.timeframes}
              onChange={(e) => update("timeframes", e.target.value)}
            />

            <Divider />

            <Typography variant="h6">Trade</Typography>

            <FormControl>
              <Select
                value={current.direction}
                onChange={(e) => update("direction", e.target.value)}
              >
                <MenuItem value="Long">Long</MenuItem>
                <MenuItem value="Short">Short</MenuItem>
              </Select>
            </FormControl>

            {[
              "entryPrice",
              "exitPrice",
              "stopLoss",
              "takeProfit",
              "positionSize",
              "risk",
              "fees",
              "pnl",
              "rMultiple",
              "duration",
            ].map((f) => (
              <TextField
                key={f}
                label={f}
                value={current[f]}
                onChange={(e) => update(f, e.target.value)}
              />
            ))}

            <Divider />

            <Typography variant="h6">Setup</Typography>

            <TextField
              label="Strategy"
              value={current.strategy}
              onChange={(e) => update("strategy", e.target.value)}
            />

            <TextField
              label="Bias"
              value={current.bias}
              onChange={(e) => update("bias", e.target.value)}
            />

            <TextField
              label="Confidence"
              value={current.confidence}
              onChange={(e) => update("confidence", e.target.value)}
            />

            <Typography>Entry Reasons</Typography>

            <FormGroup>
              {REASONS.map((reason) => (
                <FormControlLabel
                  key={reason}
                  control={
                    <Checkbox
                      checked={current.entryReasons.includes(reason)}
                      onChange={() => toggleReason(reason)}
                    />
                  }
                  label={reason}
                />
              ))}
            </FormGroup>

            <TextField
              label="Reason For Entry"
              multiline
              rows={4}
              value={current.entryComment}
              onChange={(e) => update("entryComment", e.target.value)}
            />

            <Divider />

            <Typography variant="h6">Execution</Typography>

            {[
              "followedPlan",
              "entryQuality",
              "exitQuality",
              "brokenRules",
            ].map((f) => (
              <TextField
                key={f}
                label={f}
                value={current[f]}
                onChange={(e) => update(f, e.target.value)}
              />
            ))}

            <Divider />

            <Typography variant="h6">Outcome</Typography>

            <TextField
              label="Outcome"
              value={current.outcome}
              onChange={(e) => update("outcome", e.target.value)}
            />

            <TextField
              label="Outcome Notes"
              multiline
              rows={4}
              value={current.outcomeNotes}
              onChange={(e) => update("outcomeNotes", e.target.value)}
            />

            <Divider />

            <Typography variant="h6">Psychology</Typography>

            {[
              "beforeEmotion",
              "duringEmotion",
              "afterEmotion",
              "stress",
              "confidenceLevel",
            ].map((f) => (
              <TextField
                key={f}
                label={f}
                value={current[f]}
                onChange={(e) => update(f, e.target.value)}
              />
            ))}

            <Divider />

            <Typography variant="h6">Review</Typography>

            {[
              "takeAgain",
              "strength",
              "mistake",
              "improvement",
            ].map((f) => (
              <TextField
                key={f}
                label={f}
                multiline={f !== "takeAgain"}
                rows={f !== "takeAgain" ? 3 : 1}
                value={current[f]}
                onChange={(e) => update(f, e.target.value)}
              />
            ))}

            <Divider />

            <Typography variant="h6">Chart State</Typography>

            <TextField
              multiline
              rows={8}
              value={current.chartState}
              onChange={(e) => update("chartState", e.target.value)}
            />

            <Divider />

            <Typography variant="h6">Attachments</Typography>

            <TextField
              label="Before Screenshot"
              value={current.beforeScreenshot}
              onChange={(e) => update("beforeScreenshot", e.target.value)}
            />

            <TextField
              label="After Screenshot"
              value={current.afterScreenshot}
              onChange={(e) => update("afterScreenshot", e.target.value)}
            />

            <Button variant="contained" onClick={save}>
              Save
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
    </>
  );
}