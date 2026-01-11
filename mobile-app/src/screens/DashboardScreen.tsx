import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

interface DashboardData {
  user: any;
  todayAttendance: any;
  pendingLeaves: number;
  announcements: any[];
  quickStats: {
    totalAttendance: number;
    totalLeaves: number;
    upcomingEvents: number;
  };
}

const DashboardScreen: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/employees/summary', {
        headers: {
          'Authorization': `Bearer ${await require('@react-native-async-storage/async-storage').default.getItem('authToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'clock-in':
        // Navigate to attendance screen with clock-in mode
        break;
      case 'leave':
        // Navigate to leave request screen
        break;
      case 'profile':
        // Navigate to profile screen
        break;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header with greeting */}
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <Avatar.Text 
                size={60} 
                label={dashboardData?.user?.firstName?.charAt(0) || 'U'} 
                style={styles.avatar}
              />
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Good Morning!</Text>
                <Text style={styles.userName}>{dashboardData?.user?.firstName} {dashboardData?.user?.lastName}</Text>
                <Text style={styles.userRole}>{dashboardData?.user?.role}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Today's Status */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardTitle}>Today's Status</Text>
              <View style={styles.statusRow}>
                <Icon 
                  name={dashboardData?.todayAttendance ? "clock-in" : "clock-out"} 
                  size={24} 
                  color={dashboardData?.todayAttendance ? "#4CAF50" : "#FF9800"} 
                />
                <Text style={styles.statusText}>
                  {dashboardData?.todayAttendance ? 'Clocked In' : 'Not Clocked In'}
                </Text>
              </View>
              
              {dashboardData?.todayAttendance && (
                <View style={styles.timeDetails}>
                  <Text style={styles.timeText}>
                    In: {dashboardData.todayAttendance.checkIn}
                  </Text>
                  {dashboardData.todayAttendance.checkOut && (
                    <Text style={styles.timeText}>
                      Out: {dashboardData.todayAttendance.checkOut}
                    </Text>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleQuickAction('clock-in')}
                >
                  <Icon name="clock-in" size={32} color="#2196F3" />
                  <Text style={styles.actionText}>Clock In/Out</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleQuickAction('leave')}
                >
                  <Icon name="calendar-clock" size={32} color="#4CAF50" />
                  <Text style={styles.actionText}>Request Leave</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleQuickAction('profile')}
                >
                  <Icon name="account-edit" size={32} color="#FF9800" />
                  <Text style={styles.actionText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          {/* Statistics */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardTitle}>This Month</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dashboardData?.quickStats?.totalAttendance || 0}</Text>
                  <Text style={styles.statLabel}>Days Present</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dashboardData?.quickStats?.totalLeaves || 0}</Text>
                  <Text style={styles.statLabel}>Leaves Taken</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{dashboardData?.quickStats?.upcomingEvents || 0}</Text>
                  <Text style={styles.statLabel}>Upcoming</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Pending Items */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardTitle}>Pending Items</Text>
              
              {dashboardData?.pendingLeaves > 0 && (
                <View style={styles.pendingItem}>
                  <Icon name="clock-alert" size={20} color="#FF9800" />
                  <Text style={styles.pendingText}>
                    {dashboardData.pendingLeaves} leave request(s) pending approval
                  </Text>
                  <Chip icon="arrow-right" mode="outlined" style={styles.pendingChip}>
                    Review
                  </Chip>
                </View>
              )}

              {dashboardData?.pendingLeaves === 0 && (
                <Text style={styles.noPendingItems}>No pending items!</Text>
              )}
            </Card.Content>
          </Card>

          {/* Announcements */}
          {dashboardData?.announcements?.length > 0 && (
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>Announcements</Text>
                {dashboardData.announcements.map((announcement, index) => (
                  <View key={index} style={styles.announcement}>
                    <Icon name="bullhorn" size={20} color="#2196F3" />
                    <Text style={styles.announcementText}>{announcement.message}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  timeDetails: {
    marginTop: 12,
    paddingLeft: 36,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  pendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
    paddingLeft: 12,
  },
  pendingText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  pendingChip: {
    marginLeft: 8,
  },
  noPendingItems: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  announcement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  announcementText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
});

export default DashboardScreen;
