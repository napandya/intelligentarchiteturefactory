# Emergent Google Auth — testing playbook (saved verbatim from integration playbook)

Step 1: Create Test User & Session
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"

Step 2: Test Backend API
curl -X GET "https://your-app.com/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "https://your-app.com/api/habits" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

Step 3: Browser Testing — set cookie and navigate
await page.context.add_cookies([{
  "name": "session_token", "value": "YOUR_SESSION_TOKEN",
  "domain": "your-app.com", "path": "/", "httpOnly": true, "secure": true, "sameSite": "None"
}]);
await page.goto("https://your-app.com");

Quick Debug
mongosh --eval "use('test_database'); db.users.find().limit(2).pretty(); db.user_sessions.find().limit(2).pretty();"

Checklist
- User document has user_id field (custom UUID, MongoDB's _id is separate)
- Session user_id matches user's user_id exactly
- All queries use {"_id": 0} projection
- API returns user data with user_id field (not 401/404)
- Browser loads dashboard (not login page)
- Callback detection uses useLocation().hash, not window.location.hash
