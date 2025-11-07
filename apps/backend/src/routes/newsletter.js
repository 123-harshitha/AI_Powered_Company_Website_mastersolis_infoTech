const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/connection');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  try {
    // Check if email already exists
    if (database.isConnected) {
      const existing = await database.findOne('newsletter_subscriptions', { email });
      
      if (existing) {
        // Update subscription status if exists
        if (existing.status === 'unsubscribed') {
          await database.updateOne(
            'newsletter_subscriptions',
            { email },
            {
              $set: {
                status: 'subscribed',
                subscribedAt: new Date(),
                updatedAt: new Date()
              }
            }
          );
          return res.json({
            success: true,
            message: 'Successfully resubscribed to newsletter!'
          });
        }
        
        return res.json({
          success: true,
          message: 'You are already subscribed to our newsletter!'
        });
      }

      // Create new subscription
      const subscription = {
        email,
        status: 'subscribed',
        source: req.headers.referer || 'website',
        subscribedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await database.insertOne('newsletter_subscriptions', subscription);
    }

    // Send confirmation email (optional - if Resend is configured)
    // This can be added later if email service is set up

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter! You will receive our latest updates.'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing subscription. Please try again later.'
    });
  }
}));

// Unsubscribe from newsletter
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  try {
    if (database.isConnected) {
      await database.updateOne(
        'newsletter_subscriptions',
        { email },
        {
          $set: {
            status: 'unsubscribed',
            unsubscribedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter.'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing unsubscribe request.'
    });
  }
}));

// Get subscription status (for checking)
router.get('/status/:email', asyncHandler(async (req, res) => {
  const { email } = req.params;

  try {
    if (database.isConnected) {
      const subscription = await database.findOne('newsletter_subscriptions', { email });
      
      if (subscription) {
        return res.json({
          success: true,
          subscribed: subscription.status === 'subscribed',
          status: subscription.status
        });
      }
    }

    res.json({
      success: true,
      subscribed: false,
      status: 'not_subscribed'
    });
  } catch (error) {
    console.error('Newsletter status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status.'
    });
  }
}));

module.exports = router;
