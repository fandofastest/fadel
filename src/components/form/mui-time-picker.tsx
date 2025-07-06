"use client";
import * as React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextField from "@mui/material/TextField";
import { useTheme as useMuiTheme, ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/material/styles";
import { GlobalStyles } from "@mui/material";
import { useTheme as useAppTheme } from "@/context/ThemeContext";

interface MuiTimePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function MuiTimePicker({ label, value, onChange, disabled }: MuiTimePickerProps) {
  const muiTheme = useMuiTheme();
  const { theme: appTheme } = useAppTheme();
  // Convert HH:MM string to Date object for MUI TimePicker
  const [internalValue, setInternalValue] = React.useState<Date | null>(
    value ? parseTimeString(value) : null
  );

  React.useEffect(() => {
    setInternalValue(value ? parseTimeString(value) : null);
  }, [value]);

  function handleChange(newValue: Date | null) {
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue ? formatTime(newValue) : "");
    }
  }

  // Force MUI TimePicker to follow app theme (dark/light)
  const effectiveMuiTheme = React.useMemo(() =>
    createTheme({
      palette: { mode: appTheme === "dark" ? "dark" : "light" },
    }),
    [appTheme]
  );

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={effectiveMuiTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label={label}
            value={internalValue}
            onChange={handleChange}
            ampm={false}
            disabled={disabled}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                variant: "outlined",
                sx: {
                  width: '100%',
                  overflowX: 'hidden',
                  ...(appTheme === "dark"
                    ? {
                        backgroundColor: "#1a1a1a",
                        color: "#fff",
                        input: { color: "#fff" },
                        label: { color: "#ccc" },
                      }
                    : {}),
                },
              },
            }}
            sx={{
              width: '100%',
              '& .MuiPickersPopper-paper, & .MuiDialog-paper': {
                minWidth: 0,
                width: 'auto',
                maxWidth: 320,
                overflowX: 'hidden',
              },
            }}
          />
        </LocalizationProvider>
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
}

function parseTimeString(time: string): Date | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
