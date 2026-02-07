/************************************************
  ShiokLah Feedback & Complaint Storage System
  Frontend only (localStorage)
************************************************/


/* ================================
   Helpers
================================ */

// generate unique ID
function generateId(prefix) {
  return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

// get storage safely
function readStorage(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

// save storage safely
function writeStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


/* ================================
   FEEDBACK OBJECTS
================================ */

function createFeedbackObject({
  atmosphere,
  food,
  service,
  stalls,
  feedback
}) {
  return {
    id: generateId("FB"),
    type: "feedback",
    createdAt: new Date().toISOString(),

    atmosphere: Number(atmosphere),
    food: Number(food),
    service: Number(service),

    stalls: stalls || [],
    feedback: feedback || ""
  };
}

function saveFeedback(feedbackObj) {
  const key = "shioklah_feedback";

  const list = readStorage(key);

  list.unshift(feedbackObj); // newest first

  writeStorage(key, list);
}

function getAllFeedback() {
  return readStorage("shioklah_feedback");
}

function clearAllFeedback() {
  localStorage.removeItem("shioklah_feedback");
}


/* ================================
   COMPLAINT OBJECTS
================================ */

function createComplaintObject({
  name,
  email,
  phone,
  stalls,
  category,
  details,
  outcomes,
  imageData
}) {
  return {
    id: generateId("CP"),
    type: "complaint",
    createdAt: new Date().toISOString(),

    name: name || "",
    email: email || "",
    phone: phone || "",

    stalls: stalls || [],
    category: category || "",
    details: details || "",

    outcomes: outcomes || [],

    // optional image (base64 string)
    image: imageData || null
  };
}

function saveComplaint(complaintObj) {
  const key = "shioklah_complaints";

  const list = readStorage(key);

  list.unshift(complaintObj);

  writeStorage(key, list);
}

function getAllComplaints() {
  return readStorage("shioklah_complaints");
}

function clearAllComplaints() {
  localStorage.removeItem("shioklah_complaints");
}


/* ================================
   OPTIONAL: Image helper (no backend)
   converts file → base64
================================ */

function fileToBase64(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.readAsDataURL(file);
  });
}


/* ================================
   Export to global (so HTML can use)
================================ */

window.createFeedbackObject = createFeedbackObject;
window.saveFeedback = saveFeedback;
window.getAllFeedback = getAllFeedback;
window.clearAllFeedback = clearAllFeedback;

window.createComplaintObject = createComplaintObject;
window.saveComplaint = saveComplaint;
window.getAllComplaints = getAllComplaints;
window.clearAllComplaints = clearAllComplaints;

window.fileToBase64 = fileToBase64;
