# Quick Test Guide - Charts Data Fix

## Step 1: Start Development Server

```bash
# Terminal 1 - Backend
cd /workspaces/campus-ballot/backend
npm start

# Terminal 2 - Frontend
cd /workspaces/campus-ballot/frontend
npm run dev
```

Then open browser: http://localhost:5173

## Step 2: Open Browser DevTools

Press **F12** or **Right-click → Inspect**

Go to **Console** tab

## Step 3: Login as Super Admin

1. Log in with super admin credentials
2. Navigate to Super Admin Dashboard
3. Go to `/super-admin/dashboard`

## Step 4: Monitor Console Logs

In the Console tab, you should see:

```
[Log] Analytics API Response: {
  userGrowth: Array(6),
  electionParticipation: Array(4),
  adminActivity: Array(6),
  systemActivity: Array(6),
  roleDistribution: Array(4),
  topElections: Array(4)
}

[Log] Activity API Response: {
  adminActivity: Array(7),
  systemActivity: Array(7)
}

[Log] Final Merged Data: {
  userGrowth: Array(6),
  electionParticipation: Array(4),
  adminActivity: Array(7),
  systemActivity: Array(7),
  roleDistribution: Array(4),
  systemHealthHistory: Array(6),
  topElections: Array(4)
}
```

## Step 5: Check Network Tab

1. Open **Network** tab in DevTools
2. Look for API requests to:
   - `/api/super-admin/reports/analytics` ✓
   - `/api/super-admin/reports/activity` ✓

3. Click on each request
4. Go to **Response** tab
5. Verify JSON structure includes:
   - `userGrowth`: Array with `month` and `count` fields
   - `adminActivity`: Array with `month`, `actions`, `logins` fields
   - `electionParticipation`: Array with `name` and `turnout` fields

## Step 6: Verify Charts Display

Scroll down and check all 6 charts:

### ✅ User Growth Chart (Line Chart)
- Should show an upward trend
- X-axis: Months (Jan, Feb, Mar, etc.)
- Y-axis: User count numbers

### ✅ Election Participation Chart (Bar Chart)
- Should show multiple bars
- Elections: Presidential, Guild, Faculty, etc.
- Heights represent turnout percentages

### ✅ Admin Activity Chart (Multi-line Chart)
- Should show 2 lines (Admin Actions, Admin Logins)
- Different colors for each line
- X-axis: Hours or Days
- Y-axis: Count numbers

### ✅ System Activity Chart (Multi-line Chart)
- Should show 2 lines (Uptime %, API Requests)
- Different colors for each line

### ✅ Role Distribution (Pie Chart)
- Should show different colored segments
- Legend showing: Student, Admin, Super Admin, Candidate

### ✅ Top Elections (Bar Chart)
- Should show bars for top elections
- Heights represent participation percentage

## Step 7: Test Data Source

### If Database Has Data
You should see **real data** from your database:
- User Growth: Based on actual user creation dates
- Admin Activity: Based on actual admin logs
- Election Participation: Based on actual votes cast

### If Database is Empty
You should see **dummy data** (fallback):
- User Growth: Jan-Jun with increasing numbers
- Admin Activity: Sample hours with sample numbers
- Election Participation: Sample elections with sample turnout

**Both scenarios are OK** ✓ - Charts always display something

## Step 8: Test Error Handling

Temporarily block API calls:

1. Open **Network** tab
2. Find `/api/super-admin/reports/analytics` request
3. Right-click → **Block request URL**
4. Refresh page
5. **Charts should still display** using fallback dummy data ✓

## Step 9: Check for Errors

In Console tab, look for:

```
❌ Red errors should NOT appear
⚠️ Yellow warnings are OK
✅ Info logs about API responses should appear
```

## Common Issues & Solutions

### Issue: Charts Still Empty
**Solution**: 
- Check if data is being returned from API
- Verify field names in API response
- Check console logs for error messages

### Issue: Partial Data (Some Charts Empty)
**Solution**:
- One API endpoint might be failing
- Check Network tab for failed requests
- Check Response tab for error messages

### Issue: No Console Logs Appearing
**Solution**:
- Console logs are info level
- May need to filter to "All levels" in Console
- Refresh page to trigger new API calls

### Issue: Charts Show Data But Wrong Format
**Solution**:
- Field names might be different
- Check Response tab in Network for exact field names
- Update frontend mapping if needed

## Data Field Verification

Check that API responses have these exact field names:

**User Growth**: ✓
```json
[{ "month": "Jan", "count": 20 }]
```

**Election Participation**: ✓
```json
[{ "name": "Presidential", "turnout": 75 }]
```

**Admin Activity**: ✓
```json
[{ "month": "Hour 00", "actions": 10, "logins": 8 }]
```

**System Activity**: ✓
```json
[{ "date": "2024-05-01", "uptime": 99.9, "requests": 1200 }]
```

**Role Distribution**: ✓
```json
[{ "role": "student", "count": 100 }]
```

## Success Checklist

- [ ] Browser console shows API responses logs
- [ ] Network tab shows API requests with 200 status
- [ ] All 6 charts display on page
- [ ] Charts show data (real or fallback)
- [ ] No red errors in console
- [ ] Charts responsive on resize
- [ ] Tooltips work on hover
- [ ] Dark mode displays correctly

## If Everything Works ✅

**Charts are now fully functional!**

Real data from your database will display in:
- User Growth (based on user creation dates)
- Admin Activity (based on admin logs)
- Election Participation (based on votes cast)
- System Activity (based on system logs)
- Role Distribution (based on user roles)
- Top Elections (based on election data)

All with proper formatting and visualization!

## Additional Testing

### Light/Dark Mode
1. Toggle theme (moon/sun icon)
2. Charts should display correctly in both modes

### Mobile View
1. Open DevTools
2. Press Ctrl+Shift+M for mobile view
3. Charts should be responsive

### Different Screen Sizes
1. Drag browser window to different widths
2. Charts should adapt layout

All tests should pass! ✓
