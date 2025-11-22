import { Request, Response } from 'express';
import Event, { EventStatus } from '../models/Event';
import mongoose from 'mongoose';

/**
 * GET /api/events
 * Fetch user's events with optional status filter
 * Requirements: 4.4, 8.1, 8.2, 8.3
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    const { status } = req.query;
    
    // Build query
    const query: any = { userId: req.user.userId };
    
    // Add status filter if provided
    if (status && (status === 'upcoming' || status === 'completed')) {
      query.status = status;
    }

    // Fetch events sorted by date (ascending)
    const events = await Event.find(query).sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch events',
        code: 'FETCH_EVENTS_ERROR',
      },
    });
  }
};

/**
 * POST /api/events
 * Create a new event
 * Requirements: 5.3, 5.4
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    const { title, date, time, imageUrl } = req.body;

    // Validate required fields
    if (!title || !date || !time) {
      res.status(400).json({
        error: {
          message: 'Missing required fields: title, date, and time are required',
          code: 'VALIDATION_ERROR',
        },
      });
      return;
    }

    // Combine date and time into a single Date object
    const eventDateTime = new Date(`${date}T${time}`);

    // Validate that the date is valid
    if (isNaN(eventDateTime.getTime())) {
      res.status(400).json({
        error: {
          message: 'Invalid date or time format',
          code: 'INVALID_DATE',
        },
      });
      return;
    }

    // Create new event
    const event = new Event({
      userId: req.user.userId,
      title: title.trim(),
      date: eventDateTime,
      imageUrl: imageUrl?.trim(),
      status: EventStatus.UPCOMING,
      notificationSent: false,
    });

    await event.save();

    res.status(201).json({ event });
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        message: 'Failed to create event',
        code: 'CREATE_EVENT_ERROR',
      },
    });
  }
};

/**
 * PATCH /api/events/:id
 * Update an event (status and other fields)
 * Requirements: 7.1, 7.2
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    const { id } = req.params;
    const { status, title, date, time, imageUrl } = req.body;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: {
          message: 'Invalid event ID',
          code: 'INVALID_ID',
        },
      });
      return;
    }

    // Find event and verify ownership
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        error: {
          message: 'Event not found',
          code: 'EVENT_NOT_FOUND',
        },
      });
      return;
    }

    // Verify user owns the event
    if (event.userId.toString() !== req.user.userId) {
      res.status(403).json({
        error: {
          message: 'You do not have permission to update this event',
          code: 'FORBIDDEN',
        },
      });
      return;
    }

    // Update fields if provided
    if (status && (status === 'upcoming' || status === 'completed')) {
      event.status = status;
    }

    if (title) {
      event.title = title.trim();
    }

    if (date && time) {
      const eventDateTime = new Date(`${date}T${time}`);
      if (!isNaN(eventDateTime.getTime())) {
        event.date = eventDateTime;
      }
    }

    if (imageUrl !== undefined) {
      event.imageUrl = imageUrl?.trim();
    }

    await event.save();

    res.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        message: 'Failed to update event',
        code: 'UPDATE_EVENT_ERROR',
      },
    });
  }
};

/**
 * DELETE /api/events/:id
 * Delete an event
 * Requirements: 7.1
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    const { id } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: {
          message: 'Invalid event ID',
          code: 'INVALID_ID',
        },
      });
      return;
    }

    // Find event and verify ownership
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        error: {
          message: 'Event not found',
          code: 'EVENT_NOT_FOUND',
        },
      });
      return;
    }

    // Verify user owns the event
    if (event.userId.toString() !== req.user.userId) {
      res.status(403).json({
        error: {
          message: 'You do not have permission to delete this event',
          code: 'FORBIDDEN',
        },
      });
      return;
    }

    await Event.findByIdAndDelete(id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete event',
        code: 'DELETE_EVENT_ERROR',
      },
    });
  }
};

/**
 * GET /api/events/public
 * Fetch upcoming events for home page (no authentication required)
 * Requirements: 3.4, 3.5, 7.4
 */
export const getPublicEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Fetch only upcoming events, sorted by date
    const events = await Event.find({ 
      status: EventStatus.UPCOMING 
    }).sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch public events',
        code: 'FETCH_PUBLIC_EVENTS_ERROR',
      },
    });
  }
};
