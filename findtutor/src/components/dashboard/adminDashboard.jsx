import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  // State for all the data
  const [adminDetails, setAdminDetails] = useState({
    name: '',
    email: '',
    lastLogin: '',
    role: 'Administrator'
  });
  
  const [subscriptionEmails, setSubscriptionEmails] = useState([]);
  const [teacherSubscriptions, setTeacherSubscriptions] = useState([]);
  const [studentSubscriptions, setStudentSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('admin');
  const [error, setError] = useState(null);

  // API base URL - adjust this to match your backend
  const API_BASE_URL = 'http://82.25.180.10:4242/api/collections';

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Set admin details (this could come from an auth context in a real app)
        setAdminDetails({
          name: 'Admin User',
          email: 'admin@school.com',
          lastLogin: new Date().toLocaleString(),
          role: 'Super Administrator'
        });

        // Fetch subscription emails
        const subscriptionsResponse = await fetch(`${API_BASE_URL}/findtutor_subcriptions/records`);
        console.log('subcription record', subscriptionsResponse);
        
        if (!subscriptionsResponse.ok) {
          throw new Error(`Failed to fetch subscriptions: ${subscriptionsResponse.status}`);
        }
        const subscriptionsData = await subscriptionsResponse.json();
        
        // Transform the data to match your expected format
        const formattedSubscriptions = subscriptionsData.items.map((item, index) => ({
          id: item.id,
          email: item.field, // The field column contains the email
          subscribedAt: new Date(item.created).toLocaleDateString(),
          plan: 'Basic' // Default plan since not in your schema
        }));
        setSubscriptionEmails(formattedSubscriptions);

        // Fetch teacher premium subscriptions
        const teacherResponse = await fetch(`${API_BASE_URL}/findtutor_premium_teachers/records`);
        if (!teacherResponse.ok) {
          throw new Error(`Failed to fetch teacher premiums: ${teacherResponse.status}`);
        }
        const teacherData = await teacherResponse.json();
        
        const formattedTeachers = teacherData.items.map(item => ({
          id: item.id,
          name: item.mail.split('@')[0], // Extract name from email
          email: item.mail,
          subscriptionType: item.ispaid ? 'Premium' : 'Free',
          expiryDate: item.paymentDate ? 
            new Date(new Date(item.paymentDate).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
            'N/A',
          isPaid: item.ispaid,
          paymentAmount: item.paymentAmount
        }));
        setTeacherSubscriptions(formattedTeachers);

        // Fetch student premium subscriptions
        const studentResponse = await fetch(`${API_BASE_URL}/findtitor_premium_student/records/`);
        console.log('studentResponse', studentResponse);
        
        if (!studentResponse.ok) {
          throw new Error(`Failed to fetch student premiums: ${studentResponse.status}`);
        }
        const studentData = await studentResponse.json();
        
        const formattedStudents = studentData.items.map(item => ({
          id: item.id,
          name: item.email.split('@')[0], // Extract name from email
          email: item.email,
          grade: 'N/A', // Not in your schema, could add this field
          subject: item.subject || 'N/A',
          subscriptionType: item.ispayed ? 'Premium' : 'Free',
          expiryDate: item.paymentDate ? 
            new Date(new Date(item.paymentDate).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
            'N/A',
          isPaid: item.ispayed,
          paymentAmount: item.paymentAmount
        }));
        setStudentSubscriptions(formattedStudents);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to refresh data
  const refreshData = () => {
    setIsLoading(true);
    const fetchData = async () => {
      // Repeat the same fetch logic as in useEffect
      try {
        const subscriptionsResponse = await fetch(`${API_BASE_URL}/findtutor_subcriptions/records`);
        const subscriptionsData = await subscriptionsResponse.json();
        
        const formattedSubscriptions = subscriptionsData.items.map((item, index) => ({
          id: item.id,
          email: item.field,
          subscribedAt: new Date(item.created).toLocaleDateString(),
          plan: 'Basic'
        }));
        setSubscriptionEmails(formattedSubscriptions);

        const teacherResponse = await fetch(`${API_BASE_URL}/findtutor_premium_teachers/records`);
        const teacherData = await teacherResponse.json();
        
        const formattedTeachers = teacherData.items.map(item => ({
          id: item.id,
          name: item.mail.split('@')[0],
          email: item.mail,
          subscriptionType: item.ispaid ? 'Premium' : 'Free',
          expiryDate: item.paymentDate ? 
            new Date(new Date(item.paymentDate).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
            'N/A',
          isPaid: item.ispaid,
          paymentAmount: item.paymentAmount
        }));
        setTeacherSubscriptions(formattedTeachers);

        const studentResponse = await fetch(`${API_BASE_URL}/findtitor_premium_student/records`);
        const studentData = await studentResponse.json();
        
        const formattedStudents = studentData.items.map(item => ({
          id: item.id,
          name: item.email.split('@')[0],
          email: item.email,
          grade: 'N/A',
          subject: item.subject || 'N/A',
          subscriptionType: item.ispayed ? 'Premium' : 'Free',
          expiryDate: item.paymentDate ? 
            new Date(new Date(item.paymentDate).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
            'N/A',
          isPaid: item.ispayed,
          paymentAmount: item.paymentAmount
        }));
        setStudentSubscriptions(formattedStudents);

        setIsLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error refreshing data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    fetchData();
  };

  // Render error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h3>Error loading dashboard</h3>
        <p>{error}</p>
        <button onClick={refreshData} style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
        Loading dashboard...
      </div>
    );
  }

  const styles = {
    dashboard: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    tabs: {
      display: 'flex',
      marginBottom: '20px',
      borderBottom: '1px solid #ddd'
    },
    tab: {
      padding: '10px 20px',
      marginRight: '5px',
      background: '#f5f5f5',
      border: 'none',
      borderRadius: '4px 4px 0 0',
      cursor: 'pointer',
      fontSize: '16px'
    },
    activeTab: {
      padding: '10px 20px',
      marginRight: '5px',
      background: '#1976d2',
      color: 'white',
      border: 'none',
      borderRadius: '4px 4px 0 0',
      cursor: 'pointer',
      fontSize: '16px'
    },
    content: {
      background: 'white',
      padding: '20px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    detailItem: {
      marginBottom: '15px'
    },
    label: {
      fontWeight: 'bold',
      marginRight: '10px'
    },
    tableContainer: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: '12px 15px',
      textAlign: 'left',
      borderBottom: '1px solid #ddd',
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold'
    },
    td: {
      padding: '12px 15px',
      textAlign: 'left',
      borderBottom: '1px solid #ddd'
    },
    refreshButton: {
      padding: '8px 16px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '20px'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    paidBadge: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    unpaidBadge: {
      backgroundColor: '#f44336',
      color: 'white'
    }
  };

  return (
    <div style={styles.dashboard}>
      <h1>Admin Dashboard</h1>
      
      <button onClick={refreshData} style={styles.refreshButton}>
        Refresh Data
      </button>
      
      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        <button 
          style={activeTab === 'admin' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('admin')}
        >
          Admin Details
        </button>
        <button 
          style={activeTab === 'emails' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('emails')}
        >
          Subscription Emails ({subscriptionEmails.length})
        </button>
        <button 
          style={activeTab === 'teachers' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('teachers')}
        >
          Teacher Subscriptions ({teacherSubscriptions.length})
        </button>
        <button 
          style={activeTab === 'students' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('students')}
        >
          Student Subscriptions ({studentSubscriptions.length})
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div style={styles.content}>
        {activeTab === 'admin' && (
          <div>
            <h2>Admin Information</h2>
            <div style={styles.detailItem}>
              <span style={styles.label}>Name:</span>
              <span>{adminDetails.name}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Email:</span>
              <span>{adminDetails.email}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Role:</span>
              <span>{adminDetails.role}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Last Login:</span>
              <span>{adminDetails.lastLogin}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Total Users:</span>
              <span>{subscriptionEmails.length + teacherSubscriptions.length + studentSubscriptions.length}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Paid Subscriptions:</span>
              <span>{teacherSubscriptions.filter(t => t.isPaid).length + studentSubscriptions.filter(s => s.isPaid).length}</span>
            </div>
          </div>
        )}
        
        {activeTab === 'emails' && (
          <div>
            <h2>Subscription Emails</h2>
            {subscriptionEmails.length === 0 ? (
              <p>No subscription emails found.</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Subscribed At</th>
                      <th style={styles.th}>Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionEmails.map(email => (
                      <tr key={email.id}>
                        <td style={styles.td}>{email.id.substring(0, 8)}...</td>
                        <td style={styles.td}>{email.email}</td>
                        <td style={styles.td}>{email.subscribedAt}</td>
                        <td style={styles.td}>{email.plan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'teachers' && (
          <div>
            <h2>Teacher Subscriptions</h2>
            {teacherSubscriptions.length === 0 ? (
              <p>No teacher subscriptions found.</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Subscription Type</th>
                      <th style={styles.th}>Payment Status</th>
                      {/* <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Expiry Date</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSubscriptions.map(teacher => (
                      <tr key={teacher.id}>
                        <td style={styles.td}>{teacher.id.substring(0, 8)}...</td>
                        <td style={styles.td}>{teacher.email}</td>
                        <td style={styles.td}>{teacher.subscriptionType}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...(teacher.isPaid ? styles.paidBadge : styles.unpaidBadge)
                          }}>
                            {teacher.isPaid ? 'PAID' : 'FREE'}
                          </span>
                        </td>
                        {/* <td style={styles.td}>
                          {teacher.paymentAmount ? `£${teacher.paymentAmount}` : 'N/A'}
                        </td>
                        <td style={styles.td}>{teacher.expiryDate}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'students' && (
          <div>
            <h2>Student Subscriptions</h2>
            {studentSubscriptions.length === 0 ? (
              <p>No student subscriptions found.</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Subscription Type</th>
                      <th style={styles.th}>Payment Status</th>
                      {/* <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Expiry Date</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {studentSubscriptions.map(student => (
                      <tr key={student.id}>
                        <td style={styles.td}>{student.id.substring(0, 8)}...</td>
                        <td style={styles.td}>{student.email}</td>
                        <td style={styles.td}>{student.subject}</td>
                        <td style={styles.td}>{student.subscriptionType}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...(student.isPaid ? styles.paidBadge : styles.unpaidBadge)
                          }}>
                            {student.isPaid ? 'PAID' : 'FREE'}
                          </span>
                        </td>
                        {/* <td style={styles.td}>
                          {student.paymentAmount ? `£${student.paymentAmount}` : 'N/A'}
                        </td>
                        <td style={styles.td}>{student.expiryDate}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;