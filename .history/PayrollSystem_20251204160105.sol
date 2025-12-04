// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PayrollSystem {
    // 1. Architecture & Access Control
    address public admin;

    // Enums for gas optimization
    enum Role { Employee, Manager, Admin }

    // Custom errors (saves gas compared to require strings)
    error OnlyAdmin();
    error OnlyManager();
    error OnlyAdminOrManager();
    error OnlyEmployee();
    error OnlyEmployeeOrManager();
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidShiftTime();
    error NotYourEmployee();
    error NoPendingRequest();
    error AlreadyCheckedInToday();
    error NoUnpaidAmount();
    error InsufficientBalance();
    error MustBeEmployee();
    error MustBeManager();
    error InvalidDateRange();
    error NoRecordsInRange();

    // Attendance Status Enum
    enum AttendanceStatus { Present, Absent, Late }

    // 2. Data Structures (optimized with uint32/uint8 where possible)
    struct UserDetail {
        string name;
        string phoneNumber;
        Role role;
    }

    struct AttendanceRecord {
        uint32 date;        // Days since epoch (compact storage)
        AttendanceStatus status;  // 0=Present, 1=Absent, 2=Late
    }

    struct EmployeeData {
        string name;
        uint256 dailyRate; // in Wei
        uint256 totalEarned;
        address manager; // Assigned manager
        uint64 lastCheckIn;
        uint32 shiftStart; // Seconds from midnight (fits in uint32)
        uint8 lateStrikes;
    }

    struct PayoutRecord {
        uint256 amount;
        uint64 timestamp;
        uint32 daysWorked;
    }

    // 3. State Mappings
    mapping(address => UserDetail) public users;
    mapping(address => EmployeeData) public employees;
    mapping(address => address[]) public managerEmployees; // Manager -> Employee List
    mapping(address => uint256) public pendingRateRequests; // Employee -> Requested Rate
    mapping(address => PayoutRecord[]) public payoutHistory; // Employee -> List of payouts
    mapping(address => AttendanceRecord[]) public attendanceRecords; // Employee -> Attendance history with dates
    address[] public employeeList;

    // Constants
    uint64 public constant CHECKIN_COOLDOWN = 24 hours; // Can be changed for testing
    uint32 public constant GRACE_PERIOD = 15 minutes;
    uint8 public constant LATE_PENALTY_THRESHOLD = 4;
    uint32 public constant SECONDS_PER_DAY = 86400;

    // 5. Events
    event EmployeeRegistered(address indexed wallet, string name);
    event AttendanceMarked(address indexed wallet, uint64 time, bool isLate);
    event SalaryPaid(address indexed wallet, uint256 amount);
    event ManagerRegistered(address indexed wallet, string name);
    event ShiftAssigned(address indexed wallet, uint32 startTime);
    event Deposit(address indexed sender, uint256 amount);
    event ManagerAssigned(address indexed employee, address indexed manager);
    event RateChangeRequested(address indexed employee, uint256 newRate);
    event RateChangeApproved(address indexed employee, uint256 newRate);
    event RateChangeDeclined(address indexed employee);
    event PayoutRecorded(address indexed employee, uint256 amount, uint32 daysWorked);
    event EmployeeDetailsUpdated(address indexed employee, string name, string phoneNumber);
    event EmployeeRateUpdated(address indexed employee, uint256 newRate);

    // Modifiers (optimized with custom errors)
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    modifier onlyManager() {
        if (users[msg.sender].role != Role.Manager) revert OnlyManager();
        _;
    }

    modifier onlyAdminOrManager() {
        if (msg.sender != admin && users[msg.sender].role != Role.Manager) revert OnlyAdminOrManager();
        _;
    }

    modifier onlyEmployee() {
        if (users[msg.sender].role != Role.Employee) revert OnlyEmployee();
        _;
    }

    modifier onlyEmployeeOrManager() {
        Role role = users[msg.sender].role;
        if (role != Role.Employee && role != Role.Manager) revert OnlyEmployeeOrManager();
        _;
    }

    // 4. Required Functions
    constructor() {
        admin = msg.sender;
        users[msg.sender] = UserDetail({
            name: "Admin",
            role: Role.Admin,
            phoneNumber: "0000000000"
        });
    }

    // Allow contract to receive ETH for paying salaries
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function registerManager(address _mgr, string calldata _name, string calldata _phone) external onlyAdmin {
        if (bytes(users[_mgr].name).length != 0) revert AlreadyRegistered();
        
        users[_mgr] = UserDetail({
            name: _name,
            role: Role.Manager,
            phoneNumber: _phone
        });
        
        emit ManagerRegistered(_mgr, _name);
    }

    function addEmployee(address _emp, string calldata _name, string calldata _phone, uint256 _rate) external onlyAdminOrManager {
        if (bytes(users[_emp].name).length != 0) revert AlreadyRegistered();
        
        users[_emp] = UserDetail({
            name: _name,
            role: Role.Employee,
            phoneNumber: _phone
        });

        employees[_emp] = EmployeeData({
            name: _name,
            dailyRate: _rate,
            totalEarned: 0,
            shiftStart: 0, // Default to 0, needs to be assigned
            lateStrikes: 0,
            manager: address(0),
            lastCheckIn: 0
        });

        employeeList.push(_emp);
        emit EmployeeRegistered(_emp, _name);
    }

    function assignShift(address _emp, uint32 _startTime) external onlyAdminOrManager {
        if (bytes(users[_emp].name).length == 0) revert NotRegistered();
        if (users[_emp].role != Role.Employee) revert MustBeEmployee();
        // Valid shifts: 9 AM (32400), 2 PM (50400), 10 PM (79200)
        if (_startTime != 32400 && _startTime != 50400 && _startTime != 79200) revert InvalidShiftTime();

        employees[_emp].shiftStart = _startTime;
        emit ShiftAssigned(_emp, _startTime);
    }

    function assignManager(address _emp, address _mgr) external onlyAdmin {
        if (bytes(users[_emp].name).length == 0) revert NotRegistered();
        if (bytes(users[_mgr].name).length == 0) revert NotRegistered();
        if (users[_mgr].role != Role.Manager) revert MustBeManager();

        employees[_emp].manager = _mgr;
        managerEmployees[_mgr].push(_emp);
        emit ManagerAssigned(_emp, _mgr);
    }

    function requestRateChange(address _emp, uint256 _newRate) external onlyManager {
        if (employees[_emp].manager != msg.sender) revert NotYourEmployee();
        pendingRateRequests[_emp] = _newRate;
        emit RateChangeRequested(_emp, _newRate);
    }

    function approveRateChange(address _emp) external onlyAdmin {
        uint256 newRate = pendingRateRequests[_emp];
        if (newRate == 0) revert NoPendingRequest();

        employees[_emp].dailyRate = newRate;
        delete pendingRateRequests[_emp];
        emit RateChangeApproved(_emp, newRate);
    }

    function declineRateChange(address _emp) external onlyAdmin {
        if (pendingRateRequests[_emp] == 0) revert NoPendingRequest();
        delete pendingRateRequests[_emp];
        emit RateChangeDeclined(_emp);
    }

    function getPendingRateRequest(address _emp) external view returns (uint256) {
        return pendingRateRequests[_emp];
    }

    function promoteToManager(address _emp) external onlyAdmin {
        if (bytes(users[_emp].name).length == 0) revert NotRegistered();
        if (users[_emp].role != Role.Employee) revert MustBeEmployee();

        users[_emp].role = Role.Manager;
        // Optional: Clear employee data or keep it? Keeping it is safer for history.
        emit ManagerRegistered(_emp, users[_emp].name);
    }

    function resetLateStrikes(address _emp) external onlyAdminOrManager {
        if (bytes(users[_emp].name).length == 0) revert NotRegistered();
        employees[_emp].lateStrikes = 0;
    }

    function adjustAttendance(address _emp, uint32 _unpaidDays) external onlyAdminOrManager {
        if (bytes(users[_emp].name).length == 0) revert NotRegistered();
        
        // Store absent records for _unpaidDays count
        uint32 currentDate = uint32(block.timestamp / SECONDS_PER_DAY);
        for (uint32 i = 0; i < _unpaidDays; i++) {
            attendanceRecords[_emp].push(AttendanceRecord({
                date: currentDate - i,
                status: AttendanceStatus.Absent
            }));
        }
    }

    function checkIn() external onlyEmployeeOrManager {
        EmployeeData storage emp = employees[msg.sender];
        if (block.timestamp <= emp.lastCheckIn + CHECKIN_COOLDOWN) revert AlreadyCheckedInToday();

        uint32 currentDayTime = uint32(block.timestamp % 1 days);
        uint32 shiftStart = emp.shiftStart;
        AttendanceStatus status;

        // Calculate time since shift start (handling wrap-around for overnight shifts)
        uint32 timeSinceStart = (currentDayTime + 1 days - shiftStart) % 1 days;

        if (timeSinceStart > GRACE_PERIOD) {
            status = AttendanceStatus.Late;
            emp.lateStrikes++;
        } else {
            status = AttendanceStatus.Present;
        }

        // Get today's date
        uint32 today = uint32(block.timestamp / SECONDS_PER_DAY);

        // Penalty Logic: 4 Lates = 1 Absent (No pay for this day)
        if (emp.lateStrikes >= LATE_PENALTY_THRESHOLD) {
            emp.lateStrikes = 0;
            status = AttendanceStatus.Absent;
        }

        // Store attendance record
        attendanceRecords[msg.sender].push(AttendanceRecord({
            date: today,
            status: status
        }));

        emp.lastCheckIn = uint64(block.timestamp);
        emit AttendanceMarked(msg.sender, uint64(block.timestamp), status == AttendanceStatus.Late);

        // Auto-pay when 30 working days reached
        uint32 presentDays = _countPresentDaysSinceDate(msg.sender, today - 30);
        if (presentDays >= 30) {
            _processSalaryPayment(msg.sender);
        }
    }

    // Helper function to count present days since a specific date (includes Late as paid days)
    function _countPresentDaysSinceDate(address _emp, uint32 _startDate) internal view returns (uint32 count) {
        AttendanceRecord[] storage records = attendanceRecords[_emp];
        for (uint i = 0; i < records.length; i++) {
            if (records[i].date >= _startDate && 
                (records[i].status == AttendanceStatus.Present || records[i].status == AttendanceStatus.Late)) {
                count++;
            }
        }
    }

    function paySalary(address _emp) external onlyAdmin {
        _processSalaryPayment(_emp);
    }

    function _processSalaryPayment(address _emp) internal {
        EmployeeData storage emp = employees[_emp];
        
        // Count present days since last payment (approximate - last 30 days)
        uint32 today = uint32(block.timestamp / SECONDS_PER_DAY);
        uint32 presentDays = _countPresentDaysSinceDate(_emp, today - 30);
        
        if (presentDays == 0) revert NoUnpaidAmount();
        
        uint256 wages;
        unchecked {
            wages = uint256(presentDays) * emp.dailyRate;
        }
        if (address(this).balance < wages) revert InsufficientBalance();

        unchecked {
            emp.totalEarned += wages;
        }

        // Record payout history
        payoutHistory[_emp].push(PayoutRecord({
            amount: wages,
            timestamp: uint64(block.timestamp),
            daysWorked: presentDays
        }));

        payable(_emp).transfer(wages);
        emit SalaryPaid(_emp, wages);
        emit PayoutRecorded(_emp, wages, presentDays);
    }

    function getMonthlyWage(address _emp) external view returns (uint256) {
        uint32 today = uint32(block.timestamp / SECONDS_PER_DAY);
        uint32 presentDays = _countPresentDaysSinceDate(_emp, today - 30);
        return uint256(presentDays) * employees[_emp].dailyRate;
    }

    function getPayoutHistory(address _emp) external view returns (PayoutRecord[] memory) {
        return payoutHistory[_emp];
    }

    function getDaysWorkedSinceLastPay(address _emp) external view returns (uint32) {
        uint32 today = uint32(block.timestamp / SECONDS_PER_DAY);
        return _countPresentDaysSinceDate(_emp, today - 30);
    }

    function getAttendanceByDate(address _emp, uint32 _date) external view returns (AttendanceStatus) {
        AttendanceRecord[] storage records = attendanceRecords[_emp];
        for (uint i = 0; i < records.length; i++) {
            if (records[i].date == _date) {
                return records[i].status;
            }
        }
        revert NoRecordsInRange();
    }

    function getAttendanceRange(address _emp, uint32 _startDate, uint32 _endDate) external view returns (AttendanceRecord[] memory) {
        if (_startDate > _endDate) revert InvalidDateRange();
        
        AttendanceRecord[] storage allRecords = attendanceRecords[_emp];
        uint32 count = 0;
        
        // Count matching records
        for (uint i = 0; i < allRecords.length; i++) {
            if (allRecords[i].date >= _startDate && allRecords[i].date <= _endDate) {
                count++;
            }
        }
        
        // Build result array
        AttendanceRecord[] memory result = new AttendanceRecord[](count);
        uint32 index = 0;
        for (uint i = 0; i < allRecords.length; i++) {
            if (allRecords[i].date >= _startDate && allRecords[i].date <= _endDate) {
                result[index] = allRecords[i];
                index++;
            }
        }
        return result;
    }

    function getAttendanceStats(address _emp) external view returns (uint32 present, uint32 absent, uint32 late) {
        AttendanceRecord[] storage records = attendanceRecords[_emp];
        for (uint i = 0; i < records.length; i++) {
            if (records[i].status == AttendanceStatus.Present) present++;
            else if (records[i].status == AttendanceStatus.Absent) absent++;
            else if (records[i].status == AttendanceStatus.Late) late++;
        }
    }

    // Reset late attendance to present for a date range (only for late records)
    function resetLateAttendance(address _emp, uint32 _startDate, uint32 _endDate) external onlyAdminOrManager {
        if (bytes(users[_emp].name).length == 0) revert NotRegistered();
        if (_startDate > _endDate) revert InvalidDateRange();
        
        AttendanceRecord[] storage records = attendanceRecords[_emp];
        uint32 count = 0;
        
        for (uint i = 0; i < records.length; i++) {
            if (records[i].date >= _startDate && records[i].date <= _endDate && records[i].status == AttendanceStatus.Late) {
                records[i].status = AttendanceStatus.Present;
                count++;
            }
        }
        
        if (count == 0) revert NoRecordsInRange();
    }

    // Admin only: Fix absent to present for a date range
    function fixAbsentToPresent(address _emp, uint32 _startDate, uint32 _endDate) external onlyAdmin {
        if (bytes(users[_emp].name).length == 0) revert NotRegistered();
        if (_startDate > _endDate) revert InvalidDateRange();
        
        AttendanceRecord[] storage records = attendanceRecords[_emp];
        uint32 count = 0;
        
        for (uint i = 0; i < records.length; i++) {
            if (records[i].date >= _startDate && records[i].date <= _endDate && records[i].status == AttendanceStatus.Absent) {
                records[i].status = AttendanceStatus.Present;
                count++;
            }
        }
        
        if (count == 0) revert NoRecordsInRange();
    }

    function updateEmployeeDetails(address _emp, string calldata _name, string calldata _phone) external onlyAdmin {
        if (bytes(users[_emp].name).length == 0) revert NotRegistered();
        if (users[_emp].role != Role.Employee) revert MustBeEmployee();
        
        users[_emp].name = _name;
        users[_emp].phoneNumber = _phone;
        employees[_emp].name = _name;
        
        emit EmployeeDetailsUpdated(_emp, _name, _phone);
    }

    function updateEmployeeRate(address _emp, uint256 _newRate) external onlyAdmin {
        if (employees[_emp].dailyRate == 0) revert NotRegistered();
        employees[_emp].dailyRate = _newRate;
        emit EmployeeRateUpdated(_emp, _newRate);
    }

    function getMyEmployees() external view onlyManager returns (address[] memory) {
        return managerEmployees[msg.sender];
    }

    function getAllEmployees() external view returns (address[] memory) {
        return employeeList;
    }

    function deposit() external payable onlyAdmin {
        emit Deposit(msg.sender, msg.value);
    }
}
