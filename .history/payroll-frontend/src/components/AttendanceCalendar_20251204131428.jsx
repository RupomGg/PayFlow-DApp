import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';

const AttendanceCalendar = ({ contract, address, mode = 'view' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);

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
    if (mode === 'select' && statusFilter !== null) {
      const status = attendance[dateStr];
      // Only allow selection if status matches filter
      if (status === statusFilter) {
        setSelectedDates((prev) =>
          prev.includes(dateStr)
            ? prev.filter((d) => d !== dateStr)
            : [...prev, dateStr]
        );
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
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Attendance Calendar
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
            onClick={() => setStatusFilter(statusFilter === 2 ? null : 2)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 2
                ? 'bg-yellow-200 text-yellow-900 border-2 border-yellow-400'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:border-yellow-400'
            }`}
          >
            Late Only
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 1 ? null : 1)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 1
                ? 'bg-red-200 text-red-900 border-2 border-red-400'
                : 'bg-red-50 text-red-700 border border-red-200 hover:border-red-400'
            }`}
          >
            Absent Only
          </button>
        </div>
      )}

      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 min-w-48 text-center">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-700">Present</div>
          <div className="text-2xl font-bold text-green-600">{statusStats.present}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="text-sm font-medium text-red-700">Absent</div>
          <div className="text-2xl font-bold text-red-600">{statusStats.absent}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="text-sm font-medium text-yellow-700">Late</div>
          <div className="text-2xl font-bold text-yellow-600">{statusStats.late}</div>
        </div>
      </div>

      {/* Calendar Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-200 border-t-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
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
                className={`aspect-square p-2 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer relative
                  ${getStatusColor(status)}
                  ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}
                  ${mode === 'select' && status !== statusFilter && status !== undefined ? 'cursor-not-allowed opacity-50' : ''}
                  hover:shadow-md
                `}
                title={getStatusLabel(status)}
              >
                {day}
                {status !== undefined && (
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-current opacity-75"></div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-3">Legend:</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm text-gray-600">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-600">Absent</span>
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
