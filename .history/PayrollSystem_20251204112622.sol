// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PayrollSystem {
    // 1. Architecture & Access Control
    address public admin;

    // 2. Data Structures
    struct UserDetail {
        address walletAddress;
        string name;
        string role; // "Admin", "Manager", "Employee"
        string phoneNumber;
    }

    struct EmployeeData {
        address walletAddress;
        string name;
        uint256 dailyRate; // in Wei
        uint256 unpaidDays;
        uint256 lastCheckIn;
        uint256 totalEarned;
        // New fields for Shift & Late Logic
        uint256 shiftStart; // Seconds from midnight (e.g., 9 AM = 32400)
        uint256 lateStrikes;
        uint256 currentUnpaidAmount;
        address manager; // Assigned manager
        uint256 daysWorkedSinceLastPay; // Track working days for 30-day threshold
    }

    struct PayoutRecord {
        uint256 amount;
        uint256 timestamp;
        uint256 daysWorked;
    }

    // 3. State Mappings
    mapping(address => UserDetail) public users;
    mapping(address => EmployeeData) public employees;
    mapping(address => address[]) public managerEmployees; // Manager -> Employee List
    mapping(address => uint256) public pendingRateRequests; // Employee -> Requested Rate
    mapping(address => PayoutRecord[]) public payoutHistory; // Employee -> List of payouts
    address[] public employeeList;

    // Constants
    uint256 public constant CHECKIN_COOLDOWN = 24 hours; // Can be changed for testing
    uint256 public constant GRACE_PERIOD = 15 minutes;
    uint256 public constant LATE_PENALTY_THRESHOLD = 4;

    // 5. Events
    event EmployeeRegistered(address indexed wallet, string name);
    event AttendanceMarked(address indexed wallet, uint256 time, bool isLate);
    event SalaryPaid(address indexed wallet, uint256 amount);
    event ManagerRegistered(address indexed wallet, string name);
    event ShiftAssigned(address indexed wallet, uint256 startTime);
    event Deposit(address indexed sender, uint256 amount);
    event ManagerAssigned(address indexed employee, address indexed manager);
    event RateChangeRequested(address indexed employee, uint256 newRate);
    event RateChangeApproved(address indexed employee, uint256 newRate);
    event RateChangeDeclined(address indexed employee);
    event PayoutRecorded(address indexed employee, uint256 amount, uint256 daysWorked);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin");
        _;
    }

    modifier onlyManager() {
        require(keccak256(abi.encodePacked(users[msg.sender].role)) == keccak256(abi.encodePacked("Manager")), "Only Manager");
        _;
    }

    modifier onlyAdminOrManager() {
        require(
            msg.sender == admin || 
            keccak256(abi.encodePacked(users[msg.sender].role)) == keccak256(abi.encodePacked("Manager")), 
            "Only Admin or Manager"
        );
        _;
    }

    modifier onlyEmployee() {
        require(keccak256(abi.encodePacked(users[msg.sender].role)) == keccak256(abi.encodePacked("Employee")), "Only Employee");
        _;
    }

    modifier onlyEmployeeOrManager() {
        require(
            keccak256(abi.encodePacked(users[msg.sender].role)) == keccak256(abi.encodePacked("Employee")) ||
            keccak256(abi.encodePacked(users[msg.sender].role)) == keccak256(abi.encodePacked("Manager")),
            "Only Employee or Manager"
        );
        _;
    }

    // 4. Required Functions
    constructor() {
        admin = msg.sender;
        users[msg.sender] = UserDetail({
            walletAddress: msg.sender,
            name: "Admin",
            role: "Admin",
            phoneNumber: "0000000000"
        });
    }

    // Allow contract to receive ETH for paying salaries
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function registerManager(address _mgr, string memory _name, string memory _phone) external onlyAdmin {
        require(users[_mgr].walletAddress == address(0), "User already registered");
        
        users[_mgr] = UserDetail({
            walletAddress: _mgr,
            name: _name,
            role: "Manager",
            phoneNumber: _phone
        });
        
        emit ManagerRegistered(_mgr, _name);
    }

    function addEmployee(address _emp, string memory _name, string memory _phone, uint256 _rate) external onlyAdminOrManager {
        require(users[_emp].walletAddress == address(0), "User already registered");
        
        users[_emp] = UserDetail({
            walletAddress: _emp,
            name: _name,
            role: "Employee",
            phoneNumber: _phone
        });

        employees[_emp] = EmployeeData({
            walletAddress: _emp,
            name: _name,
            dailyRate: _rate,
            unpaidDays: 0,
            lastCheckIn: 0,
            totalEarned: 0,
            shiftStart: 0, // Default to 0, needs to be assigned
            lateStrikes: 0,
            currentUnpaidAmount: 0,
            manager: address(0),
            daysWorkedSinceLastPay: 0
        });

        employeeList.push(_emp);
        emit EmployeeRegistered(_emp, _name);
    }

    function assignShift(address _emp, uint256 _startTime) external onlyAdminOrManager {
        require(users[_emp].walletAddress != address(0), "User not registered");
        require(keccak256(abi.encodePacked(users[_emp].role)) == keccak256(abi.encodePacked("Employee")), "Target must be Employee");
        // Valid shifts: 9 AM (32400), 2 PM (50400), 10 PM (79200)
        require(_startTime == 32400 || _startTime == 50400 || _startTime == 79200, "Invalid shift time");

        employees[_emp].shiftStart = _startTime;
        emit ShiftAssigned(_emp, _startTime);
    }

    function assignManager(address _emp, address _mgr) external onlyAdmin {
        require(users[_emp].walletAddress != address(0), "User not registered");
        require(users[_mgr].walletAddress != address(0), "Manager not registered");
        require(keccak256(abi.encodePacked(users[_mgr].role)) == keccak256(abi.encodePacked("Manager")), "Target must be Manager");

        employees[_emp].manager = _mgr;
        managerEmployees[_mgr].push(_emp);
        emit ManagerAssigned(_emp, _mgr);
    }

    function requestRateChange(address _emp, uint256 _newRate) external onlyManager {
        require(employees[_emp].manager == msg.sender, "Not your employee");
        pendingRateRequests[_emp] = _newRate;
        emit RateChangeRequested(_emp, _newRate);
    }

    function approveRateChange(address _emp) external onlyAdmin {
        uint256 newRate = pendingRateRequests[_emp];
        require(newRate > 0, "No pending request");

        employees[_emp].dailyRate = newRate;
        pendingRateRequests[_emp] = 0;
        emit RateChangeApproved(_emp, newRate);
    }

    function declineRateChange(address _emp) external onlyAdmin {
        require(pendingRateRequests[_emp] > 0, "No pending request");
        pendingRateRequests[_emp] = 0;
        emit RateChangeDeclined(_emp);
    }

    function getPendingRateRequest(address _emp) external view returns (uint256) {
        return pendingRateRequests[_emp];
    }

    function promoteToManager(address _emp) external onlyAdmin {
        require(users[_emp].walletAddress != address(0), "User not registered");
        require(keccak256(abi.encodePacked(users[_emp].role)) == keccak256(abi.encodePacked("Employee")), "Target must be Employee");

        users[_emp].role = "Manager";
        // Optional: Clear employee data or keep it? Keeping it is safer for history.
        emit ManagerRegistered(_emp, users[_emp].name);
    }

    function resetLateStrikes(address _emp) external onlyAdminOrManager {
        require(users[_emp].walletAddress != address(0), "User not registered");
        employees[_emp].lateStrikes = 0;
    }

    function adjustAttendance(address _emp, uint256 _unpaidDays) external onlyAdminOrManager {
        require(users[_emp].walletAddress != address(0), "User not registered");
        employees[_emp].unpaidDays = _unpaidDays;
        employees[_emp].currentUnpaidAmount = _unpaidDays * employees[_emp].dailyRate;
    }

    function checkIn() external onlyEmployeeOrManager {
        EmployeeData storage emp = employees[msg.sender];
        require(block.timestamp > emp.lastCheckIn + CHECKIN_COOLDOWN, "Already checked in today");

        uint256 currentDayTime = block.timestamp % 1 days;
        uint256 shiftStart = emp.shiftStart;
        bool isLate = false;

        // Calculate time since shift start (handling wrap-around for overnight shifts)
        // (current - start + 24h) % 24h gives positive diff
        uint256 timeSinceStart = (currentDayTime + 1 days - shiftStart) % 1 days;

        if (timeSinceStart > GRACE_PERIOD) {
            isLate = true;
            emp.lateStrikes++;
        }

        emp.lastCheckIn = block.timestamp;
        emit AttendanceMarked(msg.sender, block.timestamp, isLate);

        // Penalty Logic: 4 Lates = 1 Absent (No pay for this day)
        if (emp.lateStrikes >= LATE_PENALTY_THRESHOLD) {
            emp.lateStrikes = 0;
            // Do NOT increment unpaidDays (Absent)
        } else {
            emp.unpaidDays++;
            emp.daysWorkedSinceLastPay++;
            emp.currentUnpaidAmount += emp.dailyRate;
            
            // Auto-pay when 30 working days reached
            if (emp.daysWorkedSinceLastPay >= 30) {
                _processSalaryPayment(msg.sender);
            }
        }
    }

    function paySalary(address _emp) external onlyAdmin {
        _processSalaryPayment(_emp);
    }

    function _processSalaryPayment(address _emp) internal {
        EmployeeData storage emp = employees[_emp];
        require(emp.currentUnpaidAmount > 0, "No unpaid amount");

        uint256 wages = emp.currentUnpaidAmount;
        uint256 daysWorked = emp.daysWorkedSinceLastPay;
        require(address(this).balance >= wages, "Insufficient contract balance");

        emp.totalEarned += wages;
        emp.unpaidDays = 0;
        emp.currentUnpaidAmount = 0;
        emp.daysWorkedSinceLastPay = 0;

        // Record payout history
        payoutHistory[_emp].push(PayoutRecord({
            amount: wages,
            timestamp: block.timestamp,
            daysWorked: daysWorked
        }));

        payable(_emp).transfer(wages);
        emit SalaryPaid(_emp, wages);
        emit PayoutRecorded(_emp, wages, daysWorked);
    }

    function getMonthlyWage(address _emp) external view returns (uint256) {
        return employees[_emp].currentUnpaidAmount;
    }

    function getPayoutHistory(address _emp) external view returns (PayoutRecord[] memory) {
        return payoutHistory[_emp];
    }

    function getDaysWorkedSinceLastPay(address _emp) external view returns (uint256) {
        return employees[_emp].daysWorkedSinceLastPay;
    }

    function getMyEmployees() external view onlyManager returns (address[] memory) {
        return managerEmployees[msg.sender];
    }

    function deposit() external payable onlyAdmin {
        emit Deposit(msg.sender, msg.value);
    }
}
