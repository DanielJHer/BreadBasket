import React from 'react';
import moment from 'moment-timezone';

export default function DatePicker({ selectedDate, onDateChange }) {
  // Get the current date in PST and add 3 days
  const currentDate = moment().tz('America/Los_Angeles'); // PST timezone
  currentDate.add(3, 'days');
  const minDate = currentDate.format('YYYY-MM-DD'); // Format to 'YYYY-MM-DD' for the date picker

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
