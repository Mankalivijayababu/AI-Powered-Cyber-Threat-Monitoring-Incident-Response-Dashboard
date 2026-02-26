const express = require("express");
const Alert = require("../models/Alert");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");

const router = express.Router();


// ==============================
// ASSIGN INCIDENT
// ==============================
router.put("/assign/:id", verifyFirebaseToken, async (req, res) => {
  const { analyst } = req.body;

  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: analyst,
      $push: {
        timeline: {
          action: "Assigned incident",
          by: req.user.email
        }
      }
    },
    { new: true }
  );

  res.json(alert);
});


// ==============================
// UPDATE STATUS
// ==============================
router.put("/status/:id", verifyFirebaseToken, async (req, res) => {
  const { status } = req.body;

  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    {
      status,
      $push: {
        timeline: {
          action: `Status changed to ${status}`,
          by: req.user.email
        }
      }
    },
    { new: true }
  );

  res.json(alert);
});


// ==============================
// ADD INVESTIGATION NOTE
// ==============================
router.post("/note/:id", verifyFirebaseToken, async (req, res) => {
  const { text } = req.body;

  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        notes: {
          text,
          addedBy: req.user.email
        },
        timeline: {
          action: "Note added",
          by: req.user.email
        }
      }
    },
    { new: true }
  );

  res.json(alert);
});

module.exports = router;