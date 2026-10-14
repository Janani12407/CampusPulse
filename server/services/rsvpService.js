const mongoose = require('mongoose');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');

/**
 * Creates an RSVP for an event.
 * Atomically determines if the user gets "Confirmed" or "Waitlisted" status.
 */
exports.createRSVP = async (eventId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user already RSVP'd
    const existingRsvp = await RSVP.findOne({ eventId, userId }).session(session);
    if (existingRsvp) {
      throw new Error('User has already RSVPd to this event');
    }

    let status = 'Confirmed';

    if (event.capacity !== null) {
      // Count confirmed RSVPs
      const confirmedCount = await RSVP.countDocuments({ eventId, status: 'Confirmed' }).session(session);
      
      if (confirmedCount >= event.capacity) {
        status = 'Waitlisted';
      }
    }

    const newRsvp = new RSVP({
      eventId,
      userId,
      status,
    });

    await newRsvp.save({ session });

    await session.commitTransaction();
    session.endSession();

    return newRsvp;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Cancels an RSVP.
 * If a "Confirmed" RSVP is cancelled, atomically promotes the oldest "Waitlisted" user.
 */
exports.cancelRSVP = async (eventId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rsvp = await RSVP.findOneAndDelete({ eventId, userId }).session(session);
    
    if (!rsvp) {
      throw new Error('RSVP not found');
    }

    let promotedRsvp = null;

    if (rsvp.status === 'Confirmed') {
      const event = await Event.findById(eventId).session(session);
      
      if (event && event.capacity !== null) {
        // Find the oldest waitlisted RSVP and promote to Confirmed
        promotedRsvp = await RSVP.findOneAndUpdate(
          { eventId, status: 'Waitlisted' },
          { $set: { status: 'Confirmed' } },
          { sort: { createdAt: 1 }, session, new: true }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return { cancelled: rsvp, promoted: promotedRsvp };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
