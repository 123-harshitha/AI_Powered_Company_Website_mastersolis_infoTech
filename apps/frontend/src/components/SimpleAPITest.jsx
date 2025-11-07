import React, { useState } from 'react';
import { testAPI } from '../services/api';

const SimpleAPITest = () => {
  const [status, setStatus] = useState('Not tested');
  const [details, setDetails] = useState('');

  const testConnection = async () => {
    setStatus('Testing...');
    setDetails('');

    try {
      // Test health endpoint first
      const response = await testAPI.healthCheck();
      setStatus('✅ Success!');
      setDetails(`Health Status: ${response.data.status} | MongoDB: ${response.data.mongoConnected ? 'Connected' : 'Disconnected'}`);
    } catch (error) {
      setStatus('❌ Failed');
      setDetails(`Error: ${error.message}`);
      console.error('API Test Error:', error);
    }
  };

  const testUsers = async () => {
    setStatus('Testing Users...');
    setDetails('');

    try {
      const response = await testAPI.getUsers();
      setStatus('✅ Users API Success!');
      setDetails(`Found ${response.data.data.length} users: ${response.data.data.map(u => u.username).join(', ')}`);
    } catch (error) {
      setStatus('❌ Users API Failed');
      setDetails(`Error: ${error.message}`);
      console.error('Users API Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔧 Mastersolis Infotech Connection Test
          </h1>
          <p className="text-gray-600">Testing frontend-backend-database integration</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">API Connection Tests</h2>
          
          <div className="space-y-4">
            <button 
              onClick={testConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Test Health Endpoint
            </button>
            
            <button 
              onClick={testUsers}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Test Users API
            </button>
          </div>

          <div className="mt-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">Test Results:</h3>
              <div className="text-lg font-semibold text-gray-900 mb-2">{status}</div>
              <div className="text-sm text-gray-700">{details}</div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">Connection Info:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Frontend:</strong> http://localhost:5173</div>
              <div><strong>Backend:</strong> http://localhost:3001</div>
              <div><strong>Database:</strong> MongoDB Atlas (HRMS)</div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold">Frontend</div>
              <div className="text-sm text-gray-600">React + Vite</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold">Backend</div>
              <div className="text-sm text-gray-600">Express + Prisma</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold">Database</div>
              <div className="text-sm text-gray-600">MongoDB Atlas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAPITest;
