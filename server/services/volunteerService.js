const mongoose = require('mongoose');
const VolunteerNeed = require('../models/VolunteerNeed');
const VolunteerApplication = require('../models/VolunteerApplication');

/**
 * Approve a volunteer application atomically.
 * Prevents race conditions where multiple simultaneous approvals could exceed slotsTotal.
 */
exports.approveApplication = async (applicationId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const application = await VolunteerApplication.findById(applicationId).session(session);
    if (!application) {
      throw new Error('Application not found');
    }

    if (application.status === 'Approved') {
      throw new Error('Application is already approved');
    }

    // Attempt to increment slotsFilled atomically ONLY if slotsFilled < slotsTotal
    const need = await VolunteerNeed.findOneAndUpdate(
      { 
        _id: application.volunteerNeedId,
        $expr: { $lt: ['$slotsFilled', '$slotsTotal'] } 
      },
      { $inc: { slotsFilled: 1 } },
      { new: true, session }
    );

    if (!need) {
      throw new Error('No available slots remaining for this volunteer need');
    }

    // Update the application status
    application.status = 'Approved';
    await application.save({ session });

    // If slots are now full, update the need status
    if (need.slotsFilled >= need.slotsTotal) {
      need.status = 'Full';
      await need.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return { application, need };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
