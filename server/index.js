// Enhanced server.js - Handles contact purchases, teacher premium, and student premium subscriptions
const stripe = require('stripe')('sk_test_51RlPFJPLqHqCP926QLDWR2bTke471MpnYncdf6KDgjF2Auq67G4jdBO3Hzfm9bxelP6oYsQF9diuHmhSsGDMABaQ00OIQHSYSd');
const express = require('express');
const cors = require('cors');
const { executeQuery, generateId } = require('../server/setupDatabase'); // MySQL helper functions
const app = express();

// Import MySQL route modules
const studentPremiumRoutes = require('./studentPremium');
const teacherPremiumRoutes = require('./teacherPremium');
const subscriptionsRoutes = require('./subscriptions');

// Middleware for JSON parsing (but not for webhook)
app.use('/webhook', express.raw({type: 'application/json'}));
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: ['http://88.222.215.134:8081', 'http://localhost:3000']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tutoring Platform MySQL API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes for MySQL backend
app.use('/api/collections/findtitor_premium_student/records', studentPremiumRoutes);
app.use('/api/collections/findtutor_premium_teachers/records', teacherPremiumRoutes);
app.use('/api/collections/findtutor_subcriptions/records', subscriptionsRoutes);

const YOUR_DOMAIN = 'http://88.222.215.134:8081';

// ==================== CONTACT PURCHASE FLOW ====================

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { requestId, teacherId } = req.body;
    
    if (!requestId || !teacherId) {
      return res.status(400).json({ error: 'Request ID and Teacher ID are required' });
    }

    console.log('🛒 Creating checkout session for contact purchase:', { requestId, teacherId });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Student Contact Information',
              description: 'Access to student contact details for tutoring connection',
            },
            unit_amount: 700, // £7.00 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}&request_id=${requestId}&teacher_id=${teacherId}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      metadata: {
        type: 'contact_purchase',
        requestId: requestId.toString(),
        teacherId: teacherId.toString(),
      },
    });

    console.log('✅ Contact purchase checkout session created:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('❌ Error creating contact purchase checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ==================== TEACHER PREMIUM SUBSCRIPTION FLOW ====================

app.post('/create-premium-checkout-session', async (req, res) => {
  try {
    const { teacherEmail, teacherName } = req.body;
    
    if (!teacherEmail) {
      return res.status(400).json({ error: 'Teacher email is required' });
    }

    console.log('🌟 Creating teacher premium checkout session for:', { teacherEmail, teacherName });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Premium Teaching Subscription',
              description: 'Premium subscription with video showcase and direct contact features',
              images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400'],
            },
            unit_amount: 4900, // £49.00 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/premium-success?session_id={CHECKOUT_SESSION_ID}&teacher_email=${encodeURIComponent(teacherEmail)}`,
      cancel_url: `${YOUR_DOMAIN}/dashboard/teacher?tab=premium&cancelled=true`,
      metadata: {
        type: 'premium_subscription',
        teacherEmail: teacherEmail,
        teacherName: teacherName || '',
      },
      customer_email: teacherEmail,
    });

    console.log('✅ Teacher premium checkout session created:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('❌ Error creating teacher premium checkout session:', error);
    res.status(500).json({ error: 'Failed to create premium checkout session' });
  }
});

// ==================== STUDENT PREMIUM SUBSCRIPTION FLOW ====================

app.post('/create-student-premium-checkout-session', async (req, res) => {
  try {
    const { studentData } = req.body;
    
    if (!studentData || !studentData.email) {
      return res.status(400).json({ error: 'Student data and email are required' });
    }

    console.log('🎓 Creating student premium checkout session for:', studentData.email);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Premium Student Subscription',
              description: 'Premium student subscription with 2 free lessons per month and teacher matching',
              images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400'],
            },
            unit_amount: 2900, // £29.00 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/student-premium-success?session_id={CHECKOUT_SESSION_ID}&student_email=${encodeURIComponent(studentData.email)}`,
      cancel_url: `${YOUR_DOMAIN}/dashboard/student?tab=subscriptions&cancelled=true`,
      metadata: {
        type: 'student_premium_subscription',
        studentEmail: studentData.email,
        subject: studentData.subject,
        mobile: studentData.mobile,
        topix: studentData.topix,
        descripton: studentData.descripton,
      },
      customer_email: studentData.email,
    });

    console.log('✅ Student premium checkout session created:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('❌ Error creating student premium checkout session:', error);
    res.status(500).json({ error: 'Failed to create student premium checkout session' });
  }
});

// ==================== WEBHOOK HANDLER ====================

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('💳 Processing successful payment:', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata
    });

    const { type } = session.metadata;

    if (type === 'contact_purchase') {
      await handleContactPurchase(session);
    } else if (type === 'premium_subscription') {
      await handleTeacherPremiumSubscription(session);
    } else if (type === 'student_premium_subscription') {
      await handleStudentPremiumSubscription(session);
    } else {
      console.error('❌ Unknown payment type:', type);
    }
  }

  res.json({ received: true });
});

// ==================== WEBHOOK HANDLERS (Updated for MySQL) ====================

async function handleContactPurchase(session) {
  const { requestId, teacherId } = session.metadata;

  if (!requestId || !teacherId) {
    console.error('❌ Missing metadata in contact purchase session:', session.metadata);
    return;
  }

  try {
    // Update the ConnectionRequests table using MySQL
    const updateQuery = `
      UPDATE ConnectionRequests 
      SET 
        status = 'purchased',
        paymentStatus = 'paid',
        contactRevealed = TRUE,
        purchaseDate = NOW(),
        stripeSessionId = ?
      WHERE id = ? AND teacherId = ?
    `;

    const result = await executeQuery(updateQuery, [session.id, requestId, teacherId]);
    
    console.log('✅ ConnectionRequest updated successfully:', {
      requestId,
      teacherId,
      affectedRows: result.affectedRows
    });
    
    if (result.affectedRows === 0) {
      console.warn('⚠️ No rows were updated. Request may not exist or already processed.');
    }

  } catch (dbError) {
    console.error('❌ Database error in contact purchase webhook:', dbError);
  }
}

async function handleTeacherPremiumSubscription(session) {
  const { teacherEmail, teacherName } = session.metadata;

  if (!teacherEmail) {
    console.error('❌ Missing teacher email in premium subscription session:', session.metadata);
    return;
  }

  try {
    console.log('🌟 Processing teacher premium subscription for:', teacherEmail);

    // Check if teacher already has a premium record
    const checkQuery = 'SELECT * FROM findtutor_premium_teachers WHERE mail = ?';
    const existing = await executeQuery(checkQuery, [teacherEmail]);

    const updateData = {
      ispaid: true,
      paymentDate: new Date().toISOString(),
      stripeSessionId: session.id,
      paymentAmount: session.amount_total / 100,
    };

    if (existing.length > 0) {
      // Update existing record
      const existingRecord = existing[0];
      
      const updateQuery = `
        UPDATE findtutor_premium_teachers 
        SET ispaid = ?, paymentDate = ?, stripeSessionId = ?, paymentAmount = ?, updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, [
        updateData.ispaid,
        updateData.paymentDate,
        updateData.stripeSessionId,
        updateData.paymentAmount,
        existingRecord.id
      ]);

      console.log('✅ Teacher premium status updated for existing teacher:', teacherEmail);
    } else {
      // Create new premium record
      const id = await generateId();
      
      const createQuery = `
        INSERT INTO findtutor_premium_teachers 
        (id, mail, ispaid, link_or_video, link1, link2, link3, paymentDate, stripeSessionId, paymentAmount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(createQuery, [
        id,
        teacherEmail,
        updateData.ispaid,
        true, // Default to links
        '',
        '',
        '',
        updateData.paymentDate,
        updateData.stripeSessionId,
        updateData.paymentAmount
      ]);

      console.log('✅ Teacher premium record created for new teacher:', teacherEmail);
    }

    console.log('✅ Teacher premium subscription processed successfully for:', teacherEmail);

  } catch (error) {
    console.error('❌ MySQL error in teacher premium subscription webhook:', error);
  }
}

async function handleStudentPremiumSubscription(session) {
  const { studentEmail, subject, mobile, topix, descripton } = session.metadata;

  if (!studentEmail) {
    console.error('❌ Missing student email in premium subscription session:', session.metadata);
    return;
  }

  try {
    console.log('🎓 Processing student premium subscription for:', studentEmail);

    // Check if student already has a premium record
    const checkQuery = 'SELECT * FROM findtitor_premium_student WHERE email = ?';
    const existing = await executeQuery(checkQuery, [studentEmail]);

    console.log('🔍 Existing records found:', existing.length);

    // Fix the paymentDate format for MySQL DATETIME
    const currentDateTime = getCurrentMySQLDateTime();
    
    const updateData = {
      email: studentEmail,
      subject: subject || '',
      mobile: mobile || '',
      topix: topix || '',
      descripton: descripton || '',
      ispayed: true,
      paymentDate: currentDateTime, // Now in correct MySQL format
      stripeSessionId: session.id,
      paymentAmount: session.amount_total / 100,
    };

    console.log('💾 Prepared data with formatted date:', updateData);

    if (existing.length > 0) {
      // Update existing record
      const existingRecord = existing[0];
      
      console.log('📝 Updating existing student record:', existingRecord.id);
      
      const updateQuery = `
        UPDATE findtitor_premium_student 
        SET subject = ?, mobile = ?, topix = ?, descripton = ?, ispayed = ?, 
            paymentDate = ?, stripeSessionId = ?, paymentAmount = ?, updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const result = await executeQuery(updateQuery, [
        updateData.subject,
        updateData.mobile,
        updateData.topix,
        updateData.descripton,
        updateData.ispayed,
        updateData.paymentDate, // Now properly formatted
        updateData.stripeSessionId,
        updateData.paymentAmount,
        existingRecord.id
      ]);

      console.log('✅ Student premium status updated - affected rows:', result.affectedRows);
    } else {
      // Create new premium record
      console.log('➕ Creating new student premium record');
      
      const id = await generateId();
      console.log('🆔 Generated ID:', id);
      
      const createQuery = `
        INSERT INTO findtitor_premium_student 
        (id, email, subject, mobile, topix, descripton, ispayed, paymentDate, stripeSessionId, paymentAmount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const createValues = [
        id,
        updateData.email,
        updateData.subject,
        updateData.mobile,
        updateData.topix,
        updateData.descripton,
        updateData.ispayed,
        updateData.paymentDate, // Now properly formatted
        updateData.stripeSessionId,
        updateData.paymentAmount
      ];

      console.log('💾 Creating record with formatted values:', createValues);

      const result = await executeQuery(createQuery, createValues);
      
      console.log('✅ Student premium record created - insert ID:', result.insertId);
      console.log('✅ Affected rows:', result.affectedRows);
    }

    // Verify the record was created/updated
    const verifyQuery = 'SELECT * FROM findtitor_premium_student WHERE email = ?';
    const verifyResult = await executeQuery(verifyQuery, [studentEmail]);
    
    console.log('🔍 Verification - Records found:', verifyResult.length);
    if (verifyResult.length > 0) {
      console.log('✅ Student premium subscription processed successfully for:', studentEmail);
      console.log('📋 Final record:', {
        id: verifyResult[0].id,
        email: verifyResult[0].email,
        isPaid: verifyResult[0].ispayed,
        paymentAmount: verifyResult[0].paymentAmount,
        paymentDate: verifyResult[0].paymentDate
      });
    } else {
      console.error('❌ Record verification failed - no record found after processing');
    }

  } catch (error) {
    console.error('❌ MySQL error in student premium subscription webhook:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
  }
}

// ==================== STATUS CHECK ENDPOINTS (Updated for MySQL) ====================

// Check payment status (for Success page)
app.get('/check-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      paymentStatus: session.payment_status,
      metadata: session.metadata,
      paymentType: session.metadata.type
    });
  } catch (error) {
    console.error('Error checking payment:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Check teacher premium status
app.get('/check-premium-status/:teacherEmail', async (req, res) => {
  try {
    const { teacherEmail } = req.params;

    // Check for existing record
    const query = 'SELECT * FROM findtutor_premium_teachers WHERE mail = ?';
    const records = await executeQuery(query, [teacherEmail]);

    if (records.length > 0) {
      const premiumData = records[0];
      return res.json({
        hasPremium: true,
        isPaid: premiumData.ispaid,
        premiumData: premiumData
      });
    }

    // Create record if not found - ADD AWAIT HERE
    const id = await generateId(); // <-- This is the critical fix
    const createQuery = `
      INSERT INTO findtutor_premium_teachers 
      (id, link_or_video, link1, link2, link3, ispaid, mail)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(createQuery, [
      id,       // Now properly awaited
      true,     // link_or_video
      '',       // link1
      '',       // link2
      '',       // link3
      true,     // ispaid
      teacherEmail
    ]);

    // Return the created record
    const [newRecord] = await executeQuery(
      'SELECT * FROM findtutor_premium_teachers WHERE id = ?', 
      [id]
    );

    return res.status(201).json({
      hasPremium: true,
      isPaid: true,
      premiumData: newRecord
    });

  } catch (error) {
    console.error('Error checking/creating teacher premium status:', error);
    res.status(500).json({ 
      error: 'Failed to check or create premium status',
      details: error.message // Include error details for debugging
    });
  }
});

// Check student premium status
app.get('/check-student-premium-status/:studentEmail', async (req, res) => {
  try {
    const { studentEmail } = req.params;

    console.log('Checking student premium status for:', studentEmail);

    const query = 'SELECT * FROM findtitor_premium_student WHERE email = ?';
    const records = await executeQuery(query, [studentEmail]);

    console.log('MySQL response:', records);

    if (records.length > 0) {
      const premiumData = records[0];
      
      console.log('Found premium data:', {
        id: premiumData.id,
        email: premiumData.email,
        isPaid: premiumData.ispayed
      });
      
      return res.json({
        hasPremium: true,
        isPaid: premiumData.ispayed,
        premiumData: premiumData
      });
    }

    console.log('No premium record found for:', studentEmail);
    
    return res.json({
      hasPremium: false,
      isPaid: false,
      premiumData: null
    });

  } catch (error) {
    console.error('Error checking student premium status:', error);
    
    res.status(500).json({ 
      error: 'Failed to check student premium status',
      details: error.message
    });
  }
});

// ==================== PREMIUM CONTENT MANAGEMENT (Updated for MySQL) ====================

// Update premium content after payment (for teachers)
app.post('/update-premium-content', async (req, res) => {
  try {
    const { teacherEmail, contentData } = req.body;

    if (!teacherEmail) {
      return res.status(400).json({ error: 'Teacher email is required' });
    }

    if (!contentData) {
      return res.status(400).json({ error: 'Content data is required' });
    }

    console.log('Received contentData:', contentData);

    // Find the premium record
    const checkQuery = 'SELECT * FROM findtutor_premium_teachers WHERE mail = ? AND ispaid = true';
    const existing = await executeQuery(checkQuery, [teacherEmail]);

    if (existing.length === 0) {
      return res.status(403).json({ error: 'Premium subscription required or not found' });
    }

    const premiumRecord = existing[0];
    console.log('Found premium record:', premiumRecord.id);

    // Prepare update data
    let updateQuery;
    let updateValues;
    
    if (contentData.link_or_video === true) {
      // YouTube links
      updateQuery = `
        UPDATE findtutor_premium_teachers 
        SET link_or_video = ?, link1 = ?, link2 = ?, link3 = ?, updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      updateValues = [
        true,
        contentData.link1 || '',
        contentData.link2 || '',
        contentData.link3 || '',
        premiumRecord.id
      ];
      
      console.log('Updating with links:', updateValues);
    } else {
      // Video files
      updateQuery = `
        UPDATE findtutor_premium_teachers 
        SET link_or_video = ?, video1 = ?, video2 = ?, video3 = ?, updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      updateValues = [
        false,
        contentData.video1 || null,
        contentData.video2 || null,
        contentData.video3 || null,
        premiumRecord.id
      ];
    }

    await executeQuery(updateQuery, updateValues);

    // Return updated record
    const updatedRecord = await executeQuery(
      'SELECT * FROM findtutor_premium_teachers WHERE id = ?', 
      [premiumRecord.id]
    );

    res.json({
      success: true,
      message: 'Premium content updated successfully',
      data: updatedRecord[0]
    });

  } catch (error) {
    console.error('Error updating premium content:', error);
    
    res.status(500).json({ 
      error: 'Failed to update premium content',
      details: error.message
    });
  }
});

console.log('🚀 Enhanced Stripe server with MySQL backend running on port 4242');
app.listen(4242, () => console.log('Server started successfully!'));