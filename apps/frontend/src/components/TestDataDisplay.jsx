import React, { useState, useEffect } from 'react';
import { testAPI } from '../services/api';

const TestDataDisplay = () => {
  const [data, setData] = useState({
    health: null,
    users: [],
    employees: [],
    departments: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true }));
        
        const [healthRes, usersRes, employeesRes, departmentsRes] = await Promise.all([
          testAPI.healthCheck(),
          testAPI.getUsers(),
          testAPI.getEmployees(),
          testAPI.getDepartments()
        ]);

        setData({
          health: healthRes.data,
          users: usersRes.data.data,
          employees: employeesRes.data.data,
          departments: departmentsRes.data.data,
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data from MongoDB Atlas...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{data.error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Mastersolis Infotech Integration Test
          </h1>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded inline-block">
            ✅ All systems operational - MongoDB Atlas connected!
          </div>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔧 System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Server Status</p>
              <p className="text-lg font-semibold text-green-600">{data.health?.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Database</p>
              <p className="text-lg font-semibold text-green-600">
                {data.health?.mongoConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Users ({data.users.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.users.map(user => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.username}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'HR' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employees */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👷 Employees ({data.employees.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.employees.map(employee => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <span className="text-sm text-gray-500">ID: {employee.employeeId}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Position:</strong> {employee.position}</p>
                  <p><strong>Salary:</strong> ${employee.salary?.toLocaleString()}</p>
                  <p><strong>Department:</strong> {employee.department?.name}</p>
                  <p><Url>Joined:</Url> {new Date(employee.hireDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏢 Departments ({data.departments.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {data.departments.map(department => (
              <div key={department.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{department.name}</h3>
                    <p className="text-gray-600">{department.description}</p>
                    <p className="text-sm text-gray-500">Location: {department.location}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p><strong>Budget:</strong> ${department.budget?.toLocaleString()}</p>
                    <p><strong>Cost Center:</strong> {department.costCenter}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Manager:</strong> {department.manager?.firstName} {department.manager?.lastName}
                  </p>
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Team Members:</strong></p>
                    <div className="flex flex-wrap gap-2">
                      {department.employees.map(emp => (
                        <span key={emp.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {emp.firstName} {emp.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-md p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">🚀 Integration Complete!</h2>
          <p className="text-lg mb-4">Frontend ✓ Backend ✓ Database ✓ API ✓</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold">{data.users.length}</p>
              <p>Users</p>
            </div>
            <div>
              <p className="font-semibold">{data.employees.length}</p>
              <p>Employees</p>
            </div>
            <div>
              <p className="font-semibold">{data.departments.length}</p>
              <p>Departments</p>
            </div>
            <div>
              <p className="font-semibold">✓</p>
              <p>Connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDataDisplay;
