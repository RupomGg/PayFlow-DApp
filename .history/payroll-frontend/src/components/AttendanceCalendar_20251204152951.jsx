import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';

const AttendanceCalendar = ({ contract, address, mode = 'view', statusFilter, onSelectDates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [filterMode, setFilterMode] = useState(statusFilter);

  // Convert JavaScript date to days since epoch
  const dateToDaysSinceEpoch = (date) => {
    const epoch = new Date('1970-01-01');
    const diffTime = date - epoch;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Convert days since epoch back to date
  const daysSinceEpochToDate = (days) => {
    const epoch = new Date('1970-01-01');
    return new Date(epoch.getTime() + days * 24 * 60 * 60 * 1000);
  };

  // Fetch attendance for the current month
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!contract) return;
      try {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get first and last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startDate = dateToDaysSinceEpoch(firstDay);
        const endDate = dateToDaysSinceEpoch(lastDay);

        const records = await contract.methods
          .getAttendanceRange(address, startDate, endDate)
          .call();

        // Build attendance map
        const attendanceMap = {};
        records.forEach((record) => {
          const date = daysSinceEpochToDate(Number(record.date));
          const dateStr = date.toISOString().split('T')[0];
          attendanceMap[dateStr] = Number(record.status);
        });

        setAttendance(attendanceMap);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [currentDate, contract, address]);

  const getStatusColor = (status) => {
    if (status === undefined) return 'bg-gray-50 border-gray-200';
    if (status === 0) return 'bg-green-100 border-green-300'; // Present
    if (status === 1) return 'bg-red-100 border-red-300'; // Absent
    if (status === 2) return 'bg-yellow-100 border-yellow-300'; // Late
    return 'bg-gray-50 border-gray-200';
  };

  const getStatusLabel = (status) => {
    if (status === 0) return 'Present';
    if (status === 1) return 'Absent';
    if (status === 2) return 'Late';
    return 'No Record';
  };

  const handleDateClick = (dateStr) => {
    if (mode === 'select' && filterMode !== null) {
      const status = attendance[dateStr];
      // Only allow selection if status matches filter
      if (status === filterMode) {
        const newDates = selectedDates.includes(dateStr)
          ? selectedDates.filter((d) => d !== dateStr)
          : [...selectedDates, dateStr];
        setSelectedDates(newDates);
        if (onSelectDates) {
          onSelectDates(newDates);
        }
      }
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const statusStats = {
    present: Object.values(attendance).filter((s) => s === 0).length,
    absent: Object.values(attendance).filter((s) => s === 1).length,
    late: Object.values(attendance).filter((s) => s === 2).length,
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Attendance
        </h2>
        {mode === 'select' && (
          <div className="text-sm font-medium">
            <span className="text-gray-600">Selected: </span>
            <span className="text-emerald-600 font-bold">{selectedDates.length}</span>
          </div>
        )}
      </div>

      {/* Status Filter (if in select mode) */}
      {mode === 'select' && (
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterMode(filterMode === 2 ? null : 2)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterMode === 2
                ? 'bg-yellow-200 text-yellow-900 border-2 border-yellow-400'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:border-yellow-400'
            }`}
          >
            Late Only
          </button>
          <button
            onClick={() => setFilterMode(filterMode === 1 ? null : 1)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterMode === 1
                ? 'bg-red-200 text-red-900 border-2 border-red-400'
                : 'bg-red-50 text-red-700 border border-red-200 hover:border-red-400'
            }`}
          >
            Absent Only
          </button>
        </div>
      )}

      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={previousMonth}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        <h3 className="text-sm font-semibold text-gray-300 text-center">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-green-900/30 p-1.5 rounded border border-green-700/50">
          <div className="text-xs font-medium text-green-400">Present</div>
          <div className="text-base font-bold text-green-300">{statusStats.present}</div>
        </div>
        <div className="bg-red-900/30 p-1.5 rounded border border-red-700/50">
          <div className="text-xs font-medium text-red-400">Absent</div>
          <div className="text-base font-bold text-red-300">{statusStats.absent}</div>
        </div>
        <div className="bg-yellow-900/30 p-1.5 rounded border border-yellow-700/50">
          <div className="text-xs font-medium text-yellow-400">Late</div>
          <div className="text-base font-bold text-yellow-300">{statusStats.late}</div>
        </div>
      </div>

      {/* Calendar Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div key={idx} className="text-center font-semibold text-gray-400 text-xs py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-200 border-t-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const dateStr = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            )
              .toISOString()
              .split('T')[0];

            const status = attendance[dateStr];
            const isSelected = selectedDates.includes(dateStr);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(dateStr)}
                className={`aspect-square p-1 rounded border font-medium text-xs transition-all cursor-pointer relative
                  ${status === 0 ? 'bg-green-900/30 border-green-700/50 text-green-300' : ''}
                  ${status === 1 ? 'bg-red-900/30 border-red-700/50 text-red-300' : ''}
                  ${status === 2 ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300' : ''}
                  ${status === undefined ? 'bg-gray-700/30 border-gray-600 text-gray-400' : ''}
                  ${isSelected ? 'ring-1 ring-emerald-400' : ''}
                  ${mode === 'select' && status !== filterMode && status !== undefined ? 'cursor-not-allowed opacity-50' : ''}
                  hover:opacity-80
                `}
                title={getStatusLabel(status)}
              >
                {day}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-green-900/30 border border-green-700/50 rounded"></div>
            <span className="text-gray-400">Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-yellow-900/30 border border-yellow-700/50 rounded"></div>
            <span className="text-gray-400">Late</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-red-900/30 border border-red-700/50 rounded"></div>
            <span className="text-gray-400">Absent</span>
          </div>
        </div>
      </div>

      {/* Show selected date range if available */}
      {selectedDates.length > 0 && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="text-sm font-medium text-emerald-900">
            Selected Range: {new Date(selectedDates[0]).toLocaleDateString()} to{' '}
            {new Date(selectedDates[selectedDates.length - 1]).toLocaleDateString()}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            {selectedDates.length} day(s) selected for action
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
