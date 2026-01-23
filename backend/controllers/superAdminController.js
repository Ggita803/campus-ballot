const asyncHandler = require("express-async-handler");
const mongoose = require('mongoose');
const os = require('os');
const User = require("../models/User");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Log = require("../models/Log");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// --- HELPER: Action Formatter ---
const formatAction = (action, entityType) => {
    const actionMap = {
        'create': `${entityType} Created`,
        'update': `${entityType} Updated`,
        'delete': `${entityType} Deleted`,
        'login': 'Admin Login',
        'logout': 'Admin Logout',
        'vote': 'Vote Recorded',
        'view': `${entityType} Viewed`,
        'maintenance': 'Maintenance Action',
        'backup': 'Backup Created',
        'security': 'Security Action',
        'configuration': 'Settings Changed'
    };
    return actionMap[action] || `${action} - ${entityType}`;
};

// @desc    Get system summary for super admin dashboard
// @route   GET /api/super-admin/reports/system-summary
const getSystemSummary = asyncHandler(async (req, res) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        // Run all DB queries in parallel (No Waterfall)
        const [
            counts,
            votedUsers,
            activeUsersCount,
            roleCounts,
            elections,
            errorStats 
        ] = await Promise.all([
            Promise.all([
                User.countDocuments(),
                User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
                Election.countDocuments(),
                Election.countDocuments({ status: 'active' }),
                Vote.countDocuments(),
            ]),
            Vote.distinct('user'),
            User.countDocuments({ lastSeen: { $gte: fiveMinutesAgo } }),
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]),
            Election.find().select('title candidates').populate('candidates', 'name').lean(),
            // Calculate Error Rate from Logs in the last 24h
            Log.aggregate([
                { $match: { createdAt: { $gte: last24Hours } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        failed: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } }
                    }
                }
            ])
        ]);

        const [totalUsers, totalAdmins, totalElections, activeElections, totalVotes] = counts;

        // Calculate Real Error Rate
        const logTotal = errorStats[0]?.total || 0;
        const logErrors = errorStats[0]?.failed || 0;
        const errorRate = logTotal > 0 ? Math.round((logErrors / logTotal) * 100) : 0;

        // System Metrics (CPU/RAM/Uptime)
        const cpus = os.cpus();
        const cpuLoad = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            return acc + (cpu.times.user / total);
        }, 0) / cpus.length;

        const totalMem = os.totalmem();
        const memUsagePercent = Math.round(((totalMem - os.freemem()) / totalMem) * 100);
        const uptimeSeconds = os.uptime();
        const databaseConnections = mongoose.connections.filter(conn => conn.readyState === 1).length;

        // Formatting Response Data
        const voterTurnout = totalUsers > 0 ? Math.round((votedUsers.length / totalUsers) * 100) : 0;
        
        const roleMap = { student: 0, admin: 0, super_admin: 0 };
        roleCounts.forEach(r => { if (roleMap.hasOwnProperty(r._id)) roleMap[r._id] = r.count; });

        const electionParticipation = elections.map(e => ({
            name: e.title,
            turnout: Math.floor(Math.random() * 100) // Logical placeholder
        }));

        res.json({
            totalUsers, totalAdmins, totalElections, activeElections, totalVotes,
            voterTurnout, activeUsers: activeUsersCount, databaseConnections,
            systemHealth: errorRate > 10 ? 'Warning' : 'OK',
            cpuUsage: Math.round(cpuLoad * 100),
            memoryUsage: memUsagePercent,
            uptime: uptimeSeconds > 3600 ? `${Math.floor(uptimeSeconds / 3600)}h` : `${Math.floor(uptimeSeconds / 60)}m`,
            apiResponseTime: global.__apiResponseTimes?.length > 0 
                ? Math.round(global.__apiResponseTimes.reduce((a, b) => a + b, 0) / global.__apiResponseTimes.length) 
                : 0,
            errorRate,
            roleDistribution: [
                { role: 'Student', count: roleMap.student },
                { role: 'Admin', count: roleMap.admin },
                { role: 'Super Admin', count: roleMap.super_admin }
            ],
            electionParticipation,
            topElections: electionParticipation.slice(0, 5),
            recentActions: [{ adminName: 'System', action: 'Dashboard Sync', date: new Date().toISOString() }],
            userGrowth: [
                { month: 'Jan', count: Math.floor(totalUsers * 0.2) }, { month: 'May', count: totalUsers }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
    const admins = await User.find({ 
        role: { $in: ['admin', 'super_admin'] } 
    }).select("-password").lean();
    res.json(admins);
});

// @desc    Create new admin
const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide name, email, and password");
    }

    const emailLower = email.toLowerCase();
    const userExists = await User.findOne({ email: emailLower }).lean();
    if (userExists) {
        res.status(400);
        throw new Error("Admin with this email already exists");
    }

    const admin = await User.create({
        name,
        email: emailLower,
        password,
        role: role || 'admin',
        isVerified: true
    });

    await logActivity({
        userId: req.user._id,
        action: 'create',
        entityType: 'User',
        entityId: admin._id,
        details: `Created admin: ${emailLower}`,
        status: 'success',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
    });

    res.status(201).json({ 
        _id: admin._id, 
        name: admin.name, 
        email: admin.email, 
        role: admin.role 
    });
});

// @desc    Get admin activities with optimized filtering
const getAdminActivities = asyncHandler(async (req, res) => {
    const { limit = 50, adminId, action, startDate, endDate } = req.query;
    const { role: currentUserRole } = req.user;

    const query = { user: { $ne: null } };
    if (adminId) query.user = adminId;
    if (action) query.action = action;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await Log.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

    // Logic: Super Admins see all, Admins only see Student logs
    const filteredLogs = logs.filter(log => {
        if (!log.user) return false;
        if (currentUserRole === 'super_admin') return true;
        if (currentUserRole === 'admin') return log.user.role === 'student';
        return false;
    });

    res.json(filteredLogs.map(log => ({
        id: log._id,
        adminName: log.user.name,
        adminEmail: log.user.email,
        adminRole: log.user.role,
        action: formatAction(log.action, log.entityType),
        target: log.details || log.entityId || 'N/A',
        timestamp: log.createdAt,
        status: log.status,
        ipAddress: log.ipAddress || 'Unknown'
    })));
});

// @desc    Update admin status
const updateAdminStatus = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: req.body.status }, { new: true });
    if (!user) return res.status(404).json({ message: "Admin not found" });
    
    await logActivity({ 
        userId: req.user._id, action: 'update', entityType: 'User', entityId: user._id, 
        details: `Status changed to: ${req.body.status}`, status: 'success', 
        ipAddress: getIpAddress(req), userAgent: getUserAgent(req) 
    });
    res.json({ message: "Status updated" });
});

// @desc    Delete admin
const deleteAdmin = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Admin not found" });
    
    await logActivity({ 
        userId: req.user._id, action: 'delete', entityType: 'User', entityId: req.params.id, 
        details: `Deleted admin account: ${user.email}`, status: 'success', 
        ipAddress: getIpAddress(req), userAgent: getUserAgent(req) 
    });
    res.json({ message: "Admin deleted" });
});

// @desc    Create new observer
const createObserver = asyncHandler(async (req, res) => {
    const { name, email, password, organization, accessLevel, assignedElections } = req.body;
    const observer = await User.create({
        name, 
        email: email.toLowerCase(), 
        password, 
        role: 'observer', 
        isVerified: true,
        observerInfo: { 
            organization, 
            accessLevel, 
            assignedElections, 
            assignedBy: req.user._id, 
            assignedDate: new Date() 
        }
    });
    await logActivity({ 
        userId: req.user._id, action: 'create', entityType: 'User', entityId: observer._id, 
        details: `Created Observer: ${email}`, status: 'success', 
        ipAddress: getIpAddress(req), userAgent: getUserAgent(req) 
    });
    res.status(201).json({ success: true, data: observer });
});

// @desc    Get all observers
const getAllObservers = asyncHandler(async (req, res) => {
    const observers = await User.find({ role: 'observer' })
        .populate('observerInfo.assignedElections', 'title status')
        .select('-password')
        .sort('-createdAt')
        .lean();
    res.json({ success: true, count: observers.length, data: observers });
});

// @desc    Update observer
const updateObserver = asyncHandler(async (req, res) => {
    const observer = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'observer' }, 
        { $set: req.body }, 
        { new: true, runValidators: true }
    ).lean();
    if (!observer) return res.status(404).json({ message: "Observer not found" });
    res.json({ success: true, data: observer });
});

// @desc    Update profile picture
const updateProfilePicture = asyncHandler(async (req, res) => {
    if (!req.file?.path) return res.status(400).json({ message: 'No image uploaded' });
    const user = await User.findByIdAndUpdate(
        req.user._id, 
        { profilePicture: req.file.path }, 
        { new: true }
    ).select('profilePicture').lean();
    res.json({ success: true, profilePicture: user.profilePicture });
});

// --- EXPORTS ---
module.exports = {
    getSystemSummary,
    getAllAdmins,
    createAdmin,
    updateAdminStatus,
    deleteAdmin,
    getAdminActivities,
    getAdminsList: asyncHandler(async (req, res) => {
        const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } }).select('_id name email role').lean();
        res.json(admins);
    }),
    createObserver,
    getAllObservers,
    updateObserver,
    deleteObserver: asyncHandler(async (req, res) => {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Observer deleted" });
    }),
    getObserverActivity: asyncHandler(async (req, res) => {
        const logs = await Log.find({ user: req.params.id }).sort('-createdAt').lean();
        res.json(logs);
    }),
    updateProfilePicture
};
