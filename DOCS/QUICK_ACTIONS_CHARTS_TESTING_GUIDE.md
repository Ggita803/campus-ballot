# Testing Guide: Quick Actions & Charts Fix

## Quick Start Testing

### 1. Navigate to Super Admin Dashboard
1. Log in as a Super Admin user
2. You'll be redirected to `/super-admin/system-health`
3. Navigate to `/super-admin/dashboard` to see the Quick Actions

### 2. Test Quick Action Buttons

#### Test Case 1: Manage Students
- **Action**: Click "Manage Students" button
- **Expected**: Navigate to `/admin/users` page
- **Verify**: URL changes to `/http://localhost:5173/admin/users`
- **Verify**: Users table loads with student data

#### Test Case 2: Manage Candidates
- **Action**: Click "Manage Candidates" button
- **Expected**: Navigate to `/admin/candidates` page
- **Verify**: URL changes to `/http://localhost:5173/admin/candidates`
- **Verify**: Candidates table loads

#### Test Case 3: Manage Elections
- **Action**: Click "Manage Elections" button
- **Expected**: Navigate to `/admin/elections` page
- **Verify**: URL changes to `/http://localhost:5173/admin/elections`
- **Verify**: Elections table loads

#### Test Case 4: Manage Admins
- **Action**: Click "Manage Admins" button
- **Expected**: Navigate to `/super-admin/manage-admins` page
- **Verify**: URL changes to `/http://localhost:5173/super-admin/manage-admins`
- **Verify**: Admin management interface loads

#### Test Case 5: Global Settings
- **Action**: Click "Global Settings" button
- **Expected**: Navigate to `/super-admin/global-settings` page
- **Verify**: URL changes to `/http://localhost:5173/super-admin/global-settings`
- **Verify**: Settings page loads

#### Test Case 6: Audit Logs
- **Action**: Click "Audit Logs" button
- **Expected**: Navigate to `/super-admin/audit-logs` page
- **Verify**: URL changes to `/http://localhost:5173/super-admin/audit-logs`
- **Verify**: Audit logs page loads

#### Test Case 7: Election Oversight
- **Action**: Click "Election Oversight" button
- **Expected**: Navigate to `/super-admin/election-oversight` page
- **Verify**: URL changes to `/http://localhost:5173/super-admin/election-oversight`
- **Verify**: Election oversight interface loads

#### Test Case 8: System Health
- **Action**: Click "System Health" button
- **Expected**: Navigate to `/super-admin/system-health` page
- **Verify**: URL changes to `/http://localhost:5173/super-admin/system-health`
- **Verify**: System health dashboard loads

#### Test Case 9-12: Other Actions
- Repeat similar tests for:
  - Data Maintenance
  - Reporting
  - Security Audit
  - Help & Support

### 3. Test Charts Data Loading

#### Test Case 1: Chart Data Loads
1. **Action**: Open browser DevTools (F12)
2. **Navigate to**: Network tab
3. **Action**: Go to Super Admin Dashboard
4. **Verify**: 
   - See API calls to `/api/super-admin/reports/analytics`
   - See API calls to `/api/super-admin/reports/system-summary`
   - See API calls to `/api/super-admin/reports/activity`

#### Test Case 2: Charts Display
1. **Verify**: All 6 charts display on the page:
   - User Growth (Line chart)
   - Election Participation (Bar chart)
   - Admin Activity (Multi-line chart)
   - System Activity (Line chart)
   - Role Distribution (Pie/Doughnut chart)
   - Top Elections (Bar chart)

#### Test Case 3: Real Data vs Dummy Data
1. **Open DevTools**: Console tab
2. **Monitor Network**: Watch for API responses
3. **Verify Response**:
   - If API returns data: Charts display real data
   - If API fails: Charts display dummy data (still loads successfully)
4. **Check Console**: Should see no errors, possible warnings about API

#### Test Case 4: Chart Interaction
1. **Hover** over chart elements
2. **Verify**: Tooltips appear showing data values
3. **Click** on chart legend items
4. **Verify**: Chart updates/toggles visibility

### 4. Browser Console Checks

#### Check 1: No JavaScript Errors
1. Open DevTools (F12)
2. Go to Console tab
3. **Verify**: No red error messages
4. **Allow**: Yellow warnings are okay

#### Check 2: Navigation Logs
1. Open DevTools Console
2. Click a quick action button
3. **Verify**: URL changes in address bar
4. **Verify**: Page content updates to new route

#### Check 3: API Calls
1. Open DevTools Network tab
2. Click Super Admin Dashboard
3. **Verify**: See network requests to:
   - `/api/super-admin/reports/analytics`
   - `/api/super-admin/reports/system-summary`
   - `/api/super-admin/reports/activity`
4. **Check Response**: Status should be 200 (success) or fallback to dummy data

### 5. Responsive Design Tests

#### Mobile Test
1. Open DevTools
2. Click device toggle (Ctrl+Shift+M)
3. Select iPhone/Android device
4. **Verify**: Quick action buttons stack vertically
5. **Verify**: Charts are readable on small screens
6. **Test**: Click quick action on mobile
7. **Verify**: Navigation works on mobile

#### Tablet Test
1. Resize browser to tablet width (768px)
2. **Verify**: Layout adjusts properly
3. **Verify**: 2-3 quick action buttons per row
4. **Test**: Quick action navigation on tablet

### 6. Dark Mode Test

#### Dark Mode Navigation
1. Open Super Admin Dashboard
2. Click theme toggle (moon/sun icon)
3. **Verify**: UI switches to dark mode
4. **Verify**: Quick action buttons have dark theme colors
5. **Verify**: Charts display with dark backgrounds
6. **Test**: Click quick action in dark mode
7. **Verify**: Navigation works in dark mode

#### Light Mode Navigation
1. Click theme toggle again
2. **Verify**: UI switches to light mode
3. **Test**: Quick action in light mode
4. **Verify**: Navigation works

### 7. Route Protection Tests

#### Test Case 1: Unauthorized Access
1. Log in as Admin (not Super Admin)
2. Try to access `/super-admin/dashboard` directly
3. **Verify**: Redirected to appropriate dashboard (e.g., `/admin`)

#### Test Case 2: Authorized Access
1. Log in as Super Admin
2. Access `/super-admin/dashboard`
3. **Verify**: Page loads successfully
4. **Verify**: Quick action buttons are clickable

### 8. Performance Tests

#### Chart Loading Performance
1. Open DevTools Performance tab
2. Refresh page with Super Admin Dashboard
3. Record performance
4. **Verify**: Charts load within 3 seconds
5. **Verify**: No UI blocking during load

#### Navigation Performance
1. Click quick action button
2. **Verify**: Navigation is instantaneous
3. **Verify**: No page flicker or reload

## Debugging Checklist

If navigation doesn't work:
- [ ] Check browser console for JavaScript errors
- [ ] Verify user role is "super_admin"
- [ ] Check if target route exists (e.g., `/admin/users`)
- [ ] Test direct URL navigation: type `/admin/users` in address bar
- [ ] Check browser history (back button)
- [ ] Clear browser cache and localStorage
- [ ] Check if routes are defined in AdminDashboard.jsx and SuperAdmin.jsx

If charts don't show data:
- [ ] Check Network tab for API calls
- [ ] Verify backend API endpoints exist
- [ ] Check API response format matches expected structure
- [ ] Monitor console for error messages
- [ ] Verify Authorization header is being sent
- [ ] Check if token is stored in localStorage

## Success Criteria

### Quick Actions
- ✅ All 12 buttons are clickable
- ✅ Each button navigates to correct route
- ✅ Navigation works from any Super Admin page
- ✅ Can navigate back using browser back button
- ✅ Works in light and dark mode
- ✅ Works on desktop, tablet, and mobile

### Charts
- ✅ All 6 charts display on page
- ✅ Charts show data (real or dummy)
- ✅ No JavaScript errors in console
- ✅ Charts are responsive to screen size
- ✅ Chart interactivity works (hover, click)
- ✅ Works in light and dark mode

## Commands for Testing

### Run Development Server
```bash
cd /workspaces/campus-ballot/frontend
npm run dev
```
Then open http://localhost:5173 in browser

### Run Tests
```bash
cd /workspaces/campus-ballot/frontend
npm test
```

### Check for Errors
```bash
# Open browser DevTools (F12)
# Go to Console tab
# Look for red error messages
```

### Monitor API Calls
```bash
# Open browser DevTools (F12)
# Go to Network tab
# Look for requests to /api/super-admin/reports/*
```

## Notes

- Dashboard data is fetched on component mount
- Charts data is fetched separately from stats data
- Both use Authorization header with token from localStorage
- Dummy data is used as fallback if APIs fail
- Navigation uses React Router's useNavigate hook
- State is preserved when navigating between routes
