import React from 'react';

export default function DatePicker({ selectedDate, onDateChange }) {
  // minimum 3 days from now delivery
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 3);
  const minDate = currentDate.toISOString().split('T')[0];

  return (
    <div className="date-picker">
      <label>Select Delivery Date:</label>
      <input
        className="date-picker-input"
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        min={minDate}
        required
      ></input>
    </div>
  );
}
