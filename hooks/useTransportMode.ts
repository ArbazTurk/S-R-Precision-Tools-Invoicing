"use client";

import { useState, useCallback } from "react";

/**
 * Manages transport mode selection state.
 * @param initialMode - The initial transport mode (defaults to "By Road").
 * @returns Transport mode state and handlers.
 */
export const useTransportMode = (initialMode: string = "By Road") => {
  const transportModes = ["By Road", "By Air", "By Sea", "By Rail", "Other"];
  // Initialize state based on whether initialMode is one of the standard modes or requires "Other"
  const [selectedTransportMode, setSelectedTransportMode] = useState(
    transportModes.includes(initialMode) ? initialMode : "Other"
  );
  const [otherTransportMode, setOtherTransportMode] = useState(
    transportModes.includes(initialMode) ? "" : initialMode // Set initial value if it's "Other"
  );

  const handleTransportModeChange = useCallback(
    (mode: string) => {
      setSelectedTransportMode(mode);
      if (mode !== "Other") {
        setOtherTransportMode(""); // Clear other field if a standard mode is selected
      }
      // If mode is "Other", the otherTransportMode state holds the value,
      // and transportModeValue below will reflect it.
    },
    []
  );

  const handleOtherTransportModeChange = useCallback(
    (value: string) => {
      // This handler is only relevant when selectedTransportMode is "Other"
      if (selectedTransportMode === "Other") {
        setOtherTransportMode(value);
      }
    },
    [selectedTransportMode] // Dependency ensures this logic runs correctly if mode changes
  );

  // Derived value to be used in the form data
  const transportModeValue = selectedTransportMode === "Other" ? otherTransportMode : selectedTransportMode;

  return {
    transportModes, // List of standard modes for UI
    selectedTransportMode, // The selected value from the dropdown/radio group
    otherTransportMode, // The value of the "Other" input field
    handleTransportModeChange, // Handler for dropdown/radio group changes
    handleOtherTransportModeChange, // Handler for the "Other" input field changes
    transportModeValue, // The final value to be saved in the invoice
    // Expose setters if needed for direct manipulation (e.g., during initialization)
    setSelectedTransportMode,
    setOtherTransportMode,
  };
};
