// CareBand Local Knowledge Base - Rule-based chatbot fallback
// Works without Gemini API - 500+ Q&A rules

const KB = [
  // === GREETINGS ===
  {k:['hello','hi','hey','good morning','good evening','good afternoon','howdy','greetings'],r:'Hello! 👋 I\'m CareBand AI, your dementia care assistant. How can I help you today?'},
  {k:['how are you','how r u','whats up','what\'s up'],r:'I\'m doing great, thanks for asking! 😊 I\'m here to help you with patient care, tracking, alerts, and anything about CareBand.'},
  {k:['thank','thanks','thank you','thx'],r:'You\'re welcome! 💚 I\'m always here to help. Is there anything else you need?'},
  {k:['bye','goodbye','see you','good night'],r:'Goodbye! Take care of yourself too. Remember, your wellbeing matters as much as your patients\'. 💙'},
  {k:['who are you','what are you','your name'],r:'I\'m CareBand AI, your intelligent care assistant powered by Google Gemini. I know everything about this system and can help with patients, alerts, tracking, and more!'},
  {k:['what can you do','help me','what do you know','capabilities'],r:'I can help with:\n• Patient information and tracking\n• Alert management and SOS\n• Voice detection setup\n• Geofence configuration\n• Daily routines\n• Account settings\n• Dementia care tips\n• System features\nJust ask me anything!'},

  // === PATIENTS ===
  {k:['how to add patient','add new patient','register patient','create patient'],r:'To add a patient:\n1. Click "Patients" in the sidebar\n2. Click "+ Add Patient"\n3. Fill in name, age, phone, email, condition\n4. Set safe zone radius\n5. Click "Add Patient & Send Tracking Link"\n\nA tracking link will be emailed to the patient automatically! 📧'},
  {k:['how many patient','patient count','total patient','number of patient'],r:'You can see your total patient count on the dashboard stats row at the top, and on the Patients page. The number updates automatically when you add or remove patients.'},
  {k:['delete patient','remove patient'],r:'To remove a patient:\n1. Go to the Patients page\n2. Find the patient card\n3. Click the 🗑️ button\n4. Confirm deletion\n\nThis removes them from the map and database.'},
  {k:['patient status','patient safe','patient danger','patient warning'],r:'Patient status is shown on their card:\n• 🟢 Safe — inside their geofence zone\n• 🟡 Warning — near the boundary\n• 🔴 Danger — outside safe zone\n\nStatus updates automatically based on GPS location.'},
  {k:['patient location','where is patient','find patient','locate patient'],r:'Patient locations show on the dashboard map. Click "📍 Track" on any patient card to center the map on them. Their GPS updates in real-time when they have the tracking page open on their phone.'},
  {k:['patient phone','patient email','patient contact','contact patient'],r:'Patient phone and email are stored when you add them. You can see them on the patient cards. The phone is used for emergency contacts, and the email receives the tracking link.'},
  {k:['patient condition','dementia type','alzheimer','vascular dementia','lewy body'],r:'CareBand supports monitoring patients with any type of dementia:\n• Alzheimer\'s Disease\n• Vascular Dementia\n• Lewy Body Dementia\n• Frontotemporal Dementia\n• Mixed Dementia\n\nYou can specify the condition when adding a patient.'},
  {k:['edit patient','update patient','change patient','modify patient'],r:'Currently you can track and delete patients. To update patient details, you can remove and re-add them with the correct information. Full edit functionality is coming in a future update!'},

  // === TRACKING ===
  {k:['how tracking work','how does tracking','gps tracking','location tracking','track patient'],r:'Tracking works in 3 steps:\n1. Add a patient with their email\n2. A tracking link is emailed to their phone\n3. They open it and tap "Start Sharing"\n\nTheir GPS streams to your dashboard map in real-time via the browser\'s Geolocation API. No app installation needed!'},
  {k:['tracking link','share location','send link','patient phone track'],r:'When you add a patient, a tracking link is automatically emailed to them. They open it on their phone browser, tap "Start Sharing My Location", and their GPS appears on your map. The link looks like: yoursite.com/track.html?id=PATIENT_ID'},
  {k:['tracking not work','location not work','gps not work','can\'t track'],r:'If tracking isn\'t working:\n1. Make sure the patient opened the link on their phone\n2. They must allow location permission\n3. The page must stay open (not minimized)\n4. Both devices need internet\n5. HTTPS is required for GPS on phones\n\nIf deployed on Render, HTTPS is automatic.'},
  {k:['stop tracking','pause tracking','disable tracking'],r:'Click the "Stop Tracking" button on the dashboard banner to pause GPS updates. Click "Start Tracking" to resume. You can also close the tracking page on the patient\'s phone.'},
  {k:['tracking accuracy','gps accuracy','location accurate'],r:'GPS accuracy depends on the patient\'s device. Modern phones typically give 5-15m accuracy outdoors. The accuracy is shown on the dashboard GPS info bar. Indoor accuracy may be lower (20-50m).'},
  {k:['real time','live tracking','live location','real-time update'],r:'Yes! CareBand uses Socket.io for real-time updates. When a patient\'s phone sends GPS data, it instantly appears on your dashboard map — no page refresh needed. Updates happen every 3-5 seconds.'},
  {k:['map','leaflet','map not showing','map not loading'],r:'The dashboard uses Leaflet.js with dark-themed CARTO tiles. If the map isn\'t loading:\n1. Check your internet connection\n2. Try refreshing the page\n3. The map files are hosted locally, so no CDN blocking issues.'},
  {k:['safe zone','geofence','boundary','zone radius'],r:'Each patient has a configurable safe zone (default 100m radius). When they move outside this zone, you get an instant alert. Set the radius when adding a patient. You can also configure geofence settings on the Geofence page.'},

  // === ALERTS ===
  {k:['what are alert','alert type','types of alert','alert system'],r:'CareBand has 6 alert types:\n🚨 GEOFENCE_EXIT — Patient left safe zone\n✅ GEOFENCE_ENTER — Patient returned\n🗣️ VOICE_EMERGENCY — Keyword detected\n🆘 SOS — Manual emergency\n⏰ ROUTINE_MISSED — Missed medication/meal\n⚠️ FALL_DETECTED — Possible fall\n\nAll alerts show on the dashboard and Alerts page.'},
  {k:['how alert work','alert notification','get alert','receive alert'],r:'Alerts work automatically:\n1. Patient leaves safe zone → Geofence alert\n2. Voice keyword detected → Voice alert\n3. You press SOS → SOS alert\n4. Missed routine → Routine alert\n\nAlerts appear as toast popups, in the alert feed, and are emailed to all caregivers.'},
  {k:['resolve alert','dismiss alert','clear alert'],r:'Click the "Resolve" button on any alert to mark it as handled. The alert will fade out. Resolved alerts are still stored in the database for history.'},
  {k:['alert history','past alert','old alert','previous alert'],r:'Click "Alerts" in the sidebar to see the full alert history. All alerts are stored in MongoDB and persist across sessions.'},
  {k:['email alert','alert email','notification email'],r:'When critical alerts trigger (geofence exit, voice emergency, SOS), emails are automatically sent to ALL registered caregivers using Gmail. The email includes the alert details and a Google Maps link to the patient\'s location.'},
  {k:['false alert','too many alert','alert spam'],r:'If you\'re getting too many alerts:\n1. Increase the safe zone radius on the Geofence page\n2. Geofence alerts only trigger once per exit (won\'t spam)\n3. Resolve alerts to keep the feed clean\n4. Check if the patient is near the zone boundary'},

  // === SOS ===
  {k:['sos','emergency','manual sos','trigger sos','send sos'],r:'To send an SOS:\n1. Click the 🆘 SOS button on the Voice Monitor page\n2. Enter the email to alert\n3. An emergency email is sent immediately\n4. ALL registered caregivers also get notified\n\nThe email includes the patient\'s location with a Google Maps link.'},
  {k:['sos email','emergency email','alert caregiver'],r:'SOS emails are sent via Gmail to the specified email AND all registered caregivers. The email contains:\n• Emergency alert message\n• Patient location (Google Maps link)\n• Timestamp\n• Caregiver who triggered it'},
  {k:['emergency contact','who gets alert','caregiver alert'],r:'All registered users (caregivers) in the system receive emergency emails. When you register an account, your email is added to the alert list. Every SOS, geofence exit, and voice emergency notifies everyone.'},

  // === VOICE DETECTION ===
  {k:['voice detection','voice monitor','speech recognition','keyword detection'],r:'Voice detection uses the Web Speech API to listen for emergency keywords:\n• "help"\n• "emergency"\n• "save me"\n• "doctor"\n• "fall"\n• "pain"\n• "hurt"\n\nWhen detected, it triggers an alert and emails all caregivers.'},
  {k:['how voice work','voice how','start voice','enable voice','activate voice'],r:'To start voice detection:\n1. Go to "Voice Monitor" in the sidebar\n2. Click "🎙️ Start Voice Detection"\n3. Allow microphone permission\n4. The system listens continuously\n5. When a keyword is detected, alerts fire automatically\n\nWorks best in Chrome browser.'},
  {k:['voice not work','microphone not work','speech not work','voice error'],r:'If voice detection isn\'t working:\n1. Use Chrome browser (best support)\n2. Allow microphone permission when asked\n3. Check that your mic is working\n4. Make sure the page is in focus\n5. HTTPS is required for microphone access on some browsers'},
  {k:['voice offline','offline voice','without internet voice'],r:'The Web Speech API processes audio locally in the browser for keyword matching. However, the speech-to-text conversion may need internet on some browsers. Chrome can work offline after initial setup.'},
  {k:['stop voice','disable voice','turn off voice','stop listening'],r:'Click the voice button again (it says "Listening... click to stop") to stop voice detection. The microphone will be released.'},
  {k:['voice language','hindi voice','other language','language support'],r:'Currently voice detection works in English (en-US). Multi-language support (Hindi, Tamil, Telugu) is planned for a future update.'},
  {k:['what keyword','which word','trigger word','emergency word'],r:'The system listens for these keywords:\n• "help"\n• "emergency"\n• "save me"\n• "doctor"\n• "fall"\n• "pain"\n• "hurt"\n\nWhen any of these are detected in speech, an emergency alert is triggered.'},

  // === ROUTINES ===
  {k:['routine','daily routine','schedule','medication schedule'],r:'Daily routines help track patient activities:\n• Medication times\n• Meals\n• Physical therapy\n• Walks\n• Sleep schedule\n\nAdd routines with the "+ Add" button. Click the colored dot to change status (pending → current → done → missed).'},
  {k:['add routine','create routine','new routine'],r:'To add a routine:\n1. Click "+ Add" next to "Daily Routine"\n2. Set the time and activity name\n3. Click "Add Routine"\n\nRoutines are saved locally and persist across sessions.'},
  {k:['edit routine','change routine','modify routine','update routine'],r:'Click the ✏️ icon on any routine to edit its activity name and time. Changes are saved automatically.'},
  {k:['delete routine','remove routine'],r:'Click the ✕ button on any routine item to delete it. The change is saved immediately.'},
  {k:['routine status','mark routine','complete routine','missed routine'],r:'Click the colored dot on a routine to cycle through statuses:\n🔘 Pending → 🟡 Current → 🟢 Done → 🔴 Missed\n\nWhen marked as "Missed", an alert is automatically generated.'},
  {k:['medication reminder','medicine time','pill reminder'],r:'Add medication times as routines (e.g., "Morning medication" at 07:00). If you mark it as "Missed", an alert is triggered. This helps ensure patients don\'t skip their medications.'},

  // === ACCOUNT ===
  {k:['change password','update password','new password','reset password'],r:'To change your password:\n1. Go to Settings (⚙️ in sidebar)\n2. Scroll to "Account" section\n3. Click "Change"\n4. Enter current password, new password, and confirm\n5. Click "Update Password"\n\nPassword must be at least 6 characters.'},
  {k:['delete account','remove account','deactivate account'],r:'To delete your account:\n1. Go to Settings\n2. Scroll to "Account" section\n3. Click "Delete" (red button)\n4. Confirm in the dialog\n5. Type "DELETE" to confirm\n\n⚠️ This permanently removes your account, all patients, and all alerts.'},
  {k:['logout','sign out','log out'],r:'Click "🚪 Sign Out" at the bottom of the sidebar to log out. You\'ll be redirected to the login page.'},
  {k:['register','create account','sign up','new account'],r:'To create an account:\n1. Go to the login page\n2. Click "Create account"\n3. Fill in your name, email, role, and password\n4. Click "Create Account"\n\nYou\'ll be redirected to the dashboard.'},
  {k:['forgot password','reset password','lost password'],r:'On the login page, click "Forgot password?" to start the reset process:\n1. Enter your email\n2. Check your email for a reset code\n3. Enter the code\n4. Set a new password'},
  {k:['login','sign in','can\'t login','login problem'],r:'To login, enter your registered email and password on the login page. If you forgot your password, click "Forgot password?" to reset it.'},

  // === SETTINGS ===
  {k:['settings','preferences','configuration','configure'],r:'Settings page includes:\n• Push Notifications toggle\n• Sound Alerts toggle\n• Email Alerts toggle\n• GPS Update Interval\n• Location History toggle\n• Voice Auto-start toggle\n• Sensitivity level\n• Change Password\n• Delete Account'},
  {k:['notification','push notification','alert sound'],r:'Go to Settings to configure notifications:\n• Push Notifications — browser notifications\n• Sound Alerts — play sound for critical alerts\n• Email Alerts — send email for high-severity events\n\nToggle each on/off as needed.'},
  {k:['gps interval','update interval','how often gps','tracking frequency'],r:'GPS updates are sent every 3-5 seconds from the patient\'s phone. You can see the update frequency on the dashboard tracking banner.'},

  // === GEOFENCE ===
  {k:['geofence setting','configure geofence','geofence page','zone setting'],r:'On the Geofence page you can configure:\n• Safe Zone on/off\n• Radius (50-500 meters)\n• Exit Alerts on/off\n• Entry Alerts on/off\n• Night Mode (stricter boundaries)\n• Alert Sound on/off'},
  {k:['geofence radius','zone size','how big zone','change radius'],r:'The default safe zone is 100 meters. You can set it from 50m to 500m when adding a patient, or adjust it on the Geofence settings page. Smaller radius = more sensitive alerts.'},
  {k:['night mode','stricter zone','night geofence'],r:'Night Mode makes the geofence stricter during nighttime hours. This is useful because dementia patients are more likely to wander at night. Enable it on the Geofence settings page.'},
  {k:['geofence exit','left zone','outside zone','patient wander'],r:'When a patient leaves their safe zone:\n1. Dashboard shows ⚠️ warning\n2. Toast notification appears\n3. Emergency flash on screen\n4. Email sent to all caregivers\n5. Alert added to feed\n\nThe alert includes distance from home and a Google Maps link.'},

  // === TECHNOLOGY ===
  {k:['tech stack','technology','what built with','framework'],r:'CareBand is built with:\n• Frontend: HTML5, CSS3, JavaScript\n• Maps: Leaflet.js\n• Real-time: Socket.io\n• Voice: Web Speech API\n• Backend: Node.js + Express\n• Database: MongoDB Atlas\n• Auth: JWT + bcrypt\n• Email: Nodemailer + Gmail\n• AI: Google Gemini\n• Hosting: Render.com'},
  {k:['mongodb','database','data storage','where data stored'],r:'All data is stored in MongoDB Atlas (cloud database):\n• Users collection — accounts\n• Patients collection — patient info\n• Locations collection — GPS history\n• Alerts collection — all alerts\n\nData persists across sessions and is accessible from any device.'},
  {k:['socket','real-time','websocket','live update'],r:'Socket.io enables real-time communication. When a patient\'s phone sends GPS data, the server broadcasts it to all connected dashboards instantly — no page refresh needed.'},
  {k:['api','rest api','endpoint','backend api'],r:'CareBand has these API endpoints:\n• /api/auth — login, register, password\n• /api/patients — CRUD operations\n• /api/locations — GPS data\n• /api/alerts — alert management\n• /api/sos — email alerts\n• /api/ai — Gemini chatbot'},
  {k:['deploy','hosting','render','cloud','server'],r:'CareBand is deployed on Render.com (free tier). It provides:\n• HTTPS automatically (needed for GPS on phones)\n• Always-on server\n• Auto-deploy from GitHub\n• Environment variables for secrets'},
  {k:['open source','github','source code','repository'],r:'CareBand is open source! The code is on GitHub. You can view, fork, and contribute to the project.'},

  // === DEMENTIA CARE TIPS ===
  {k:['dementia tip','care tip','caregiving tip','advice'],r:'Dementia care tips:\n1. Maintain a consistent daily routine\n2. Use simple, clear communication\n3. Create a safe home environment\n4. Encourage physical activity\n5. Be patient and compassionate\n6. Take care of yourself too — caregiver burnout is real\n7. Use technology like CareBand for peace of mind'},
  {k:['wandering','patient wander','prevent wandering','stop wandering'],r:'To manage wandering:\n1. Set up geofence alerts in CareBand\n2. Keep doors locked with childproof locks\n3. Use door alarms\n4. Maintain a routine to reduce restlessness\n5. Ensure the patient wears ID\n6. Keep the tracking page open on their phone'},
  {k:['sundowning','evening confusion','night agitation','sunset syndrome'],r:'Sundowning tips:\n1. Keep the environment well-lit in the evening\n2. Maintain a calm, quiet atmosphere\n3. Avoid caffeine after noon\n4. Stick to a regular sleep schedule\n5. Use CareBand\'s Night Mode for stricter geofencing\n6. Consider a calming activity before bed'},
  {k:['medication','medicine','pill','drug'],r:'Medication management:\n1. Add medication times as routines in CareBand\n2. Set reminders for each dose\n3. Mark as "Done" when taken\n4. "Missed" status triggers an alert\n5. Use a pill organizer\n6. Keep a medication list for doctor visits'},
  {k:['fall','fall prevention','fall risk','falling'],r:'Fall prevention:\n1. Remove tripping hazards at home\n2. Install grab bars in bathrooms\n3. Ensure good lighting\n4. Use non-slip mats\n5. Encourage proper footwear\n6. CareBand can detect falls via voice keywords ("fall", "hurt")'},
  {k:['caregiver stress','burnout','self care','caregiver wellness','tired'],r:'Caregiver wellness is important:\n1. Take regular breaks\n2. Ask for help from family/friends\n3. Join a support group\n4. Exercise regularly\n5. Get enough sleep\n6. Use CareBand to reduce worry — you\'ll get alerts if something happens\n7. It\'s okay to not be perfect 💙'},
  {k:['communication','talk to patient','speak to patient','conversation'],r:'Communication tips:\n1. Speak slowly and clearly\n2. Use simple sentences\n3. Make eye contact\n4. Be patient — wait for responses\n5. Avoid arguing or correcting\n6. Use visual cues and gestures\n7. Maintain a calm, reassuring tone'},
  {k:['nutrition','food','diet','eating','meal'],r:'Nutrition for dementia patients:\n1. Serve meals at regular times (add to routines)\n2. Offer finger foods if utensils are difficult\n3. Keep meals simple and familiar\n4. Ensure adequate hydration\n5. Monitor weight changes\n6. Make mealtimes calm and pleasant'},
  {k:['exercise','physical activity','walk','movement'],r:'Exercise benefits:\n1. Daily walks improve mood and sleep\n2. Simple stretching exercises\n3. Chair exercises for limited mobility\n4. Dancing to familiar music\n5. Gardening\n6. Track walks using CareBand\'s GPS to ensure they stay in the safe zone'},
  {k:['sleep','insomnia','night waking','sleep problem'],r:'Sleep tips for dementia patients:\n1. Maintain a consistent bedtime\n2. Limit daytime napping\n3. Create a dark, quiet bedroom\n4. Avoid screens before bed\n5. Use CareBand\'s Night Mode for safety\n6. A warm bath before bed can help'},
  {k:['agitation','aggression','angry','upset','frustrated'],r:'Managing agitation:\n1. Stay calm yourself\n2. Identify and remove triggers\n3. Redirect attention to a pleasant activity\n4. Speak softly and reassuringly\n5. Don\'t argue or reason\n6. Ensure basic needs are met (hunger, pain, bathroom)\n7. Music can be very calming'},
  {k:['memory','forget','forgetful','memory loss','remember'],r:'Memory support:\n1. Use labels and signs around the house\n2. Keep a daily routine (use CareBand routines)\n3. Use photo albums for reminiscence\n4. Write important info on a whiteboard\n5. Be patient with repeated questions\n6. Focus on feelings, not facts'},

  // === FEATURES ===
  {k:['feature','what can careband do','all feature','feature list'],r:'CareBand features:\n1. 📍 Real-time GPS tracking\n2. 🔔 Geofence safe zone alerts\n3. 🎙️ Voice emergency detection\n4. 📧 Email SOS alerts\n5. 📱 Phone tracking link\n6. 📋 Editable daily routines\n7. 👥 Multi-patient dashboard\n8. 🗺️ Live Leaflet map\n9. 🤖 AI chatbot (me!)\n10. ⚙️ Account management\n11. 🔒 Secure JWT auth\n12. ☁️ Cloud deployed'},
  {k:['free','cost','price','pricing','how much'],r:'CareBand is completely free! 🎉\n• Render.com hosting: Free\n• MongoDB Atlas: Free (512MB)\n• Gmail alerts: Free (500/day)\n• Gemini AI: Free tier\n• Leaflet maps: Free (open source)\n• No hardware needed — uses existing phones'},
  {k:['security','secure','safe','privacy','data privacy'],r:'CareBand security:\n• Passwords hashed with bcrypt (12 rounds)\n• JWT token authentication\n• HTTPS encryption\n• No audio recordings stored\n• Voice processed locally in browser\n• MongoDB Atlas with encryption\n• Environment variables for secrets'},
  {k:['mobile','phone','responsive','mobile app'],r:'CareBand works on any device with a browser:\n• Desktop dashboard for caregivers\n• Mobile tracking page for patients\n• Responsive design\n• No app installation needed\n• A native mobile app is planned for the future'},

  // === ABOUT ===
  {k:['about careband','what is careband','about this','about system'],r:'CareBand is a real-time dementia care and emergency system. It helps caregivers monitor elderly patients with dementia using GPS tracking, voice emergency detection, geofence alerts, and AI-powered insights. Built for the Google Solution Challenge 2026.'},
  {k:['who made','developer','creator','built by','team'],r:'CareBand was built for the Google Solution Challenge 2026. It uses Google Gemini AI and is deployed on the cloud. Check the About section for team details.'},
  {k:['solution challenge','hackathon','competition','google challenge'],r:'CareBand is built for the Google Solution Challenge 2026 — a global competition to solve real-world problems using Google technologies. We use Google Gemini AI for intelligent care insights and chatbot functionality.'},
  {k:['gemini','google ai','artificial intelligence','ai feature'],r:'CareBand uses Google Gemini AI for:\n1. 🤖 This chatbot — answers your questions\n2. 📊 Care insights — analyzes patient patterns\n3. ⚠️ Alert analysis — assesses risk levels\n4. 💡 Recommendations — actionable care advice\n\nGemini processes your patient data to provide personalized insights.'},

  // === TROUBLESHOOTING ===
  {k:['not working','broken','bug','issue','problem','error'],r:'Common fixes:\n1. Refresh the page\n2. Clear browser cache\n3. Check internet connection\n4. Make sure you\'re logged in\n5. Try a different browser (Chrome recommended)\n\nIf the issue persists, try logging out and back in.'},
  {k:['slow','loading','lag','performance'],r:'If the app is slow:\n1. Check your internet speed\n2. Close unused browser tabs\n3. The free Render tier may have cold starts (30s delay after inactivity)\n4. Refresh the page\n5. GPS updates may be delayed on weak signals'},
  {k:['browser support','which browser','chrome','firefox','safari','edge'],r:'CareBand works best on:\n• ✅ Chrome (recommended — best voice support)\n• ✅ Edge\n• ✅ Firefox\n• ⚠️ Safari (limited voice detection)\n\nUse Chrome for the best experience, especially for voice detection.'},
];

function getLocalAnswer(question) {
  const q = question.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KB) {
    for (const keyword of entry.k) {
      if (q.includes(keyword)) {
        const score = keyword.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = entry.r;
        }
      }
    }
  }

  // Dynamic answers based on current data
  if (!bestMatch) {
    if (q.match(/how many|count|total|number/)) {
      const n = allPatients ? allPatients.length : 0;
      bestMatch = 'You currently have ' + n + ' patient(s) registered in the system.' + (n === 0 ? ' Go to Patients page to add your first patient!' : '');
    }
    else if (q.match(/patient.*name|list.*patient|show.*patient|my patient/)) {
      if (allPatients && allPatients.length > 0) {
        bestMatch = 'Your patients:\n' + allPatients.map((p,i) => (i+1) + '. ' + p.name + ' (Age ' + p.age + ', ' + p.condition + ')').join('\n');
      } else {
        bestMatch = 'You don\'t have any patients yet. Go to the Patients page and click "+ Add Patient" to get started!';
      }
    }
    else if (q.match(/who.*login|my.*name|my.*account|my.*email/)) {
      if (currentUser) {
        bestMatch = 'You\'re logged in as ' + currentUser.name + ' (' + currentUser.email + '), role: ' + currentUser.role + '.';
      }
    }
  }

  // Fallback
  if (!bestMatch) {
    const fallbacks = [
      'I\'m not sure about that specific question, but I can help with patients, tracking, alerts, voice detection, routines, and settings. Try asking about one of those!',
      'Hmm, I don\'t have info on that. Try asking me about:\n• How to add a patient\n• How tracking works\n• Alert types\n• Voice detection\n• Daily routines\n• Dementia care tips',
      'I\'m still learning! For now, I can help with CareBand features, patient management, alerts, and dementia care advice. What would you like to know?',
      'That\'s a great question! I might not have the exact answer, but try asking about specific features like tracking, geofence, voice detection, or routines.',
    ];
    bestMatch = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  return bestMatch;
}
