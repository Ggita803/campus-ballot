import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { FaRoute } from 'react-icons/fa';
import OutreachStats from './outreach/OutreachStats';
import OutreachActivities from './outreach/OutreachActivities';
import EventsCalendar from './outreach/EventsCalendar';

const VoterOutreach = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('activities');

  useEffect(() => {
    fetchOutreachData();
  }, []);

  const fetchOutreachData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/agent/outreach', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(response.data.activities);
      setEvents(response.data.events);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching outreach data:', error);
      // Fallback dummy data
      setActivities([
        {
          _id: '1',
          type: 'door-to-door',
          location: 'Hostel Block A',
          contactsReached: 45,
          positiveResponses: 32,
          neutralResponses: 10,
          negativeResponses: 3,
          agentName: 'John Smith',
          date: '2025-01-14',
          notes: 'Great response from first-year students. Many interested in mental health initiatives.'
        },
        {
          _id: '2',
          type: 'event',
          location: 'Student Center',
          contactsReached: 120,
          positiveResponses: 89,
          neutralResponses: 25,
          negativeResponses: 6,
          agentName: 'Jane Doe',
          date: '2025-01-13',
          notes: 'Campus town hall was well attended. Distributed 100 flyers.'
        },
        {
          _id: '3',
          type: 'phone-banking',
          location: 'Remote',
          contactsReached: 67,
          positiveResponses: 45,
          neutralResponses: 18,
          negativeResponses: 4,
          agentName: 'Mike Johnson',
          date: '2025-01-12',
          notes: 'Called student organizations leaders. Secured endorsements from 3 clubs.'
        }
      ]);
      setEvents([
        {
          _id: '1',
          title: 'Campus Rally',
          description: 'Main campaign rally at the quad',
          location: 'Main Quad',
          date: '2025-01-20',
          time: '15:00',
          expectedAttendance: 200,
          status: 'upcoming'
        },
        {
          _id: '2',
          title: 'Meet & Greet - Engineering',
          description: 'Informal meeting with engineering students',
          location: 'Engineering Building',
          date: '2025-01-18',
          time: '12:00',
          expectedAttendance: 50,
          status: 'upcoming'
        }
      ]);
      setLoading(false);
    }
  };

  const stats = {
    totalActivities: activities.length,
    totalContacts: activities.reduce((sum, a) => sum + a.contactsReached, 0),
    positiveResponses: activities.reduce((sum, a) => sum + a.positiveResponses, 0),
    upcomingEvents: events.filter(e => e.status === 'upcoming').length
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2" style={{ color: colors.text }}>
          <FaRoute className="me-2" style={{ color: '#3b82f6' }} />
          Voter Outreach
        </h2>
        <p className="text-muted mb-0">Track campaign activities and events</p>
      </div>

      {/* Stats */}
      <OutreachStats stats={stats} />

      {/* Tabs */}
      <div className="mb-4">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'activities' ? 'active' : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              Activities ({activities.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              Events ({events.length})
            </button>
          </li>
        </ul>
      </div>

      {/* Content */}
      {activeTab === 'activities' && (
        <OutreachActivities
          activities={activities}
          onRefresh={fetchOutreachData}
        />
      )}
      {activeTab === 'events' && (
        <EventsCalendar
          events={events}
          onRefresh={fetchOutreachData}
        />
      )}
    </div>
  );
};

export default VoterOutreach;
