const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const database = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCmR_wq6S2eXY2vqrphxaKo0VXNt7zkCWI';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * Generate AI-powered service descriptions using Gemini
 */
router.post('/generate-descriptions', checkRole('ADMIN'), [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('targetAudience').notEmpty().withMessage('Target audience is required'),
  body('toneOfVoice').notEmpty().withMessage('Tone of voice is required'),
  body('serviceList').isArray().notEmpty().withMessage('Service list must be a non-empty array'),
  body('serviceList.*').isString().notEmpty().withMessage('Each service name must be a non-empty string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { companyName, industry, targetAudience, toneOfVoice, serviceList } = req.body;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Build comprehensive prompt for Gemini
    const prompt = `You are an expert content writer specializing in creating professional, SEO-optimized service descriptions for corporate websites.

Company Information:
- Company Name: ${companyName}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Tone of Voice: ${toneOfVoice}

Service Names to Generate Descriptions For:
${serviceList.map((service, index) => `${index + 1}. ${service}`).join('\n')}

Requirements for each service:
1. Keep the service title EXACTLY as provided (do not modify it)
2. Write a SHORT description (30-50 words) - concise, engaging, and SEO-friendly
3. Write a LONG description (80-150 words) - detailed, professional, persuasive, highlighting benefits, features, and technology aspects
4. Add 3-5 key features in bullet format
5. Ensure the writing is original, natural, and SEO-friendly, using relevant keywords for the company's domain
6. Focus on AI-powered solutions, automation, and digital transformation where applicable

Return the response in STRICT JSON format as follows (no markdown, no code blocks, just pure JSON):
[
  {
    "service_name": "Exact Service Name As Provided",
    "short_description": "Short AI-generated summary (30-50 words)",
    "long_description": "Detailed AI-generated description (80-150 words) explaining the service, its benefits, use of technology, and value to customers. Maintain a professional and SEO-optimized tone suitable for a corporate website.",
    "key_features": [
      "Feature 1",
      "Feature 2",
      "Feature 3",
      "Feature 4",
      "Feature 5"
    ]
  }
]

IMPORTANT: Return ONLY valid JSON array. Do not include any markdown formatting, code blocks, or explanatory text.`;

    // Generate descriptions with retry logic
    let responseText = '';
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        responseText = response.text();
        
        // Clean up the response (remove markdown code blocks if present)
        responseText = responseText.trim();
        if (responseText.startsWith('```json')) {
          responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (responseText.startsWith('```')) {
          responseText = responseText.replace(/```\n?/g, '');
        }
        responseText = responseText.trim();
        
        // Validate and parse JSON
        const parsedResponse = JSON.parse(responseText);
        
        if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
          // Validate structure
          const isValid = parsedResponse.every(item => 
            item.service_name && 
            item.short_description && 
            item.long_description && 
            Array.isArray(item.key_features) && 
            item.key_features.length >= 3
          );
          
          if (isValid) {
            return res.json({
              success: true,
              message: 'Service descriptions generated successfully',
              data: parsedResponse
            });
          }
        }
        
        throw new Error('Invalid response structure from AI');
      } catch (parseError) {
        attempts++;
        console.error(`Gemini API attempt ${attempts} failed:`, parseError.message);
        console.error('Response text:', responseText.substring(0, 500));
        
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate valid service descriptions after ${maxAttempts} attempts: ${parseError.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  } catch (error) {
    console.error('Error generating service descriptions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate service descriptions',
      error: error.message
    });
  }
}));

/**
 * Get all services
 */
router.get('/', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  try {
    const services = await database.find('services', {});
    res.json({
      success: true,
      data: services || []
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
}));

/**
 * Get a single service by ID
 */
router.get('/:id', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const service = await database.findOne('services', { _id: new ObjectId(id) });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
}));

/**
 * Create a new service
 */
router.post('/', checkRole('ADMIN'), [
  body('service_name').notEmpty().withMessage('Service name is required'),
  body('short_description').notEmpty().withMessage('Short description is required'),
  body('long_description').notEmpty().withMessage('Long description is required'),
  body('key_features').isArray().withMessage('Key features must be an array'),
  body('key_features.*').isString().notEmpty().withMessage('Each feature must be a non-empty string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    const serviceData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.userId
    };

    const result = await database.insertOne('services', serviceData);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { _id: result.insertedId, ...serviceData }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
}));

/**
 * Update a service
 */
router.put('/:id', checkRole('ADMIN'), [
  body('service_name').optional().notEmpty().withMessage('Service name cannot be empty'),
  body('short_description').optional().notEmpty().withMessage('Short description cannot be empty'),
  body('long_description').optional().notEmpty().withMessage('Long description cannot be empty'),
  body('key_features').optional().isArray().withMessage('Key features must be an array')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };

    const result = await database.updateOne(
      'services',
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const updatedService = await database.findOne('services', { _id: new ObjectId(id) });
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
}));

/**
 * Delete a service
 */
router.delete('/:id', checkRole('ADMIN'), asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const result = await database.deleteOne('services', { _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
}));

module.exports = router;

