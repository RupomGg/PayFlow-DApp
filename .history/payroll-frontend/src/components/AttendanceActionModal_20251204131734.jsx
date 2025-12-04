import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import AttendanceCalendar from './AttendanceCalendar';

const AttendanceActionModal = ({ isOpen, onClose, contract, employeeAddress, actionType, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

  const dateToDaysSinceEpoch = (date) => {
    const epoch = new Date('1970-01-01');
    const diffTime = date - epoch;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAction = async () => {
    if (selectedDates.length === 0) {
      setError('Please select at least one date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Sort dates
      const sortedDates = selectedDates.map((d) => new Date(d)).sort((a, b) => a - b);
      const startDate = dateToDaysSinceEpoch(sortedDates[0]);
      const endDate = dateToDaysSinceEpoch(sortedDates[sortedDates.length - 1]);

      let tx;
      if (actionType === 'resetLate') {
        tx = await contract.methods.resetLateAttendance(employeeAddress, startDate, endDate).send({
          from: window.ethereum.selectedAddress,
        });
      } else if (actionType === 'fixAbsent') {
        tx = await contract.methods.fixAbsentToPresent(employeeAddress, startDate, endDate).send({
          from: window.ethereum.selectedAddress,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error performing action:', err);
      setError(err.message || 'Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (actionType === 'resetLate') return 'Reset Late Attendance';
    if (actionType === 'fixAbsent') return 'Fix Absent to Present';
    return 'Update Attendance';
  };

  const getStatusFilter = () => {
    if (actionType === 'resetLate') return 2; // Late
    if (actionType === 'fixAbsent') return 1; // Absent
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600">Attendance records have been updated successfully.</p>
            </div>
          ) : (
            <>
              {/* Description */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  {actionType === 'resetLate' && (
                    <>
                      Select dates with <strong>Late</strong> status to convert them to{' '}
                      <strong>Present</strong>. Other statuses will be ignored.
                    </>
                  )}
                  {actionType === 'fixAbsent' && (
                    <>
                      Select dates with <strong>Absent</strong> status to convert them to{' '}
                      <strong>Present</strong>. Other statuses will be ignored.
                    </>
                  )}
                </div>
              </div>

              {/* Calendar */}
              <AttendanceCalendar
                contract={contract}
                address={employeeAddress}
                mode="select"
                statusFilter={getStatusFilter()}
                onSelectDates={setSelectedDates}
              />

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-900">{error}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={loading || selectedDates.length === 0}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  {getTitle()}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceActionModal;
