import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiService from '../services/ApiService';

interface AttendanceData {
  todayRecord?: any;
  monthlyStats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    workingHours: number;
  };
  recentRecords: any[];
}

const AttendanceScreen: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      const [todayResponse, monthlyResponse, recentResponse] = await Promise.all([
        ApiService.makeRequest('/attendance/today'),
        ApiService.makeRequest('/attendance/monthly'),
        ApiService.makeRequest('/attendance/recent'),
      ]);

      setAttendanceData({
        todayRecord: todayResponse.data,
        monthlyStats: monthlyResponse.stats,
        recentRecords: recentResponse.data,
      });
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockInOut = async () => {
    try {
      setClockingIn(true);
      
      const action = attendanceData?.todayRecord?.checkIn ? 'OUT' : 'IN';
      const response = await ApiService.clockInOut('IN');
      
      if (response.success) {
        Alert.alert(
          'Success', 
          `Clocked ${action} successfully at ${new Date().toLocaleTimeString()}`
        );
        loadAttendanceData(); // Refresh data
      } else {
        Alert.alert('Error', response.message || 'Failed to clock in/out');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setClockingIn(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return '#4CAF50';
      case 'LATE': return '#FF9800';
      case 'ABSENT': return '#F44336';
      case 'HALF_DAY': return '#2196F3';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'check-circle';
      case 'LATE': return 'clock-alert';
      case 'ABSENT': return 'close-circle';
      case 'HALF_DAY': return 'clock-half-full';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Today's Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Today's Attendance</Text>
            
            {attendanceData?.todayRecord ? (
              <View style={styles.todayStatus}>
                <View style={styles.timeDisplay}>
                  <Icon name="clock-in" size={24} color="#4CAF50" />
                  <Text style={styles.timeText}>
                    In: {new Date(attendanceData.todayRecord.checkIn).toLocaleTimeString()}
                  </Text>
                </View>
                
                {attendanceData.todayRecord.checkOut && (
                  <View style={styles.timeDisplay}>
                    <Icon name="clock-out" size={24} color="#FF9800" />
                    <Text style={styles.timeText}>
                      Out: {new Date(attendanceData.todayRecord.checkOut).toLocaleTimeString()}
                    </Text>
                  </View>
                )}
                
                <View style={styles.hoursWorked}>
                  <Text style={styles.hoursText}>
                    Worked: {attendanceData.todayRecord.workingHours || 0} hours
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noClockIn}>
                <Icon name="clock-out" size={32} color="#757575" />
                <Text style={styles.noClockText}>Not clocked in yet</Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleClockInOut}
              loading={clockingIn}
              disabled={clockingIn}
              style={styles.clockButton}
              icon={attendanceData?.todayRecord?.checkIn ? 'clock-out' : 'clock-in'}
            >
              Clock {attendanceData?.todayRecord?.checkIn ? 'Out' : 'In'}
            </Button>
          </Card.Content>
        </Card>

        {/* Monthly Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>This Month Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {attendanceData?.monthlyStats?.present || 0}
                </Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {attendanceData?.monthlyStats?.absent || 0}
                </Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {attendanceData?.monthlyStats?.late || 0}
                </Text>
                <Text style={styles.statLabel}>Late</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {attendanceData?.monthlyStats?.workingHours || 0}h
                </Text>
                <Text style={styles.statLabel}>Total Hours</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Attendance Records */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Recent Records</Text>
            
            {attendanceData?.recentRecords?.length > 0 ? (
              attendanceData.recentRecords.map((record, index) => (
                <View key={record.id || index}>
                  <View style={styles.recordItem}>
                    <View style={styles.recordDate}>
                      <Text style={styles.dateText}>
                        {new Date(record.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.dayText}>
                        {new Date(record.date).toLocaleDateString('en', { weekday: 'short' })}
                      </Text>
                    </View>
                    
                    <View style={styles.recordStatus}>
                      <Icon 
                        name={getStatusIcon(record.status)} 
                        size={20} 
                        color={getStatusColor(record.status)} 
                      />
                      <Chip 
                        mode="outlined" 
                        textStyle={{ color: getStatusColor(record.status) }}
                        style={{ marginLeft: 8 }}
                      >
                        {record.status}
                      </Chip>
                    </View>
                    
                    <View style={styles.recordTimes}>
                      <Text style={styles.timeText}>
                        {record.checkIn && new Date(record.checkIn).toLocaleTimeString()}
                      </Text>
                      {record.checkOut && (
                        <Text style={styles.timeText}>
                          - {new Date(record.checkOut).toLocaleTimeString()}
                        </Text>
                      )}
                    </View>
                  </View>
                  {index < attendanceData.recentRecords.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noRecords}>No attendance records found</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  todayStatus: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  hoursWorked: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  hoursText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  noClockIn: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noClockText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  clockButton: {
    marginTop: 20,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
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
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recordDate: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recordStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  recordTimes: {
    alignItems: 'flex-end',
  },
  divider: {
    marginVertical: 8,
  },
  noRecords: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default AttendanceScreen;
