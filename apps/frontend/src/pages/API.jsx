import React, { useState } from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'

const API = () => {
  const [activeEndpoint, setActiveEndpoint] = useState('authentication')

  const endpoints = [
    {
      id: 'authentication',
      title: 'Authentication',
      method: 'POST',
      path: '/api/auth/login',
      description: 'Authenticate users and get access tokens'
    },
    {
      id: 'employees',
      title: 'Employees',
      method: 'GET',
      path: '/api/employees',
      description: 'Retrieve employee data and manage employee records'
    },
    {
      id: 'attendance',
      title: 'Attendance',
      method: 'GET',
      path: '/api/attendance',
      description: 'Manage attendance records and time tracking'
    },
    {
      id: 'payroll',
      title: 'Payroll',
      method: 'GET',
      path: '/api/payroll',
      description: 'Process payroll and manage compensation'
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      method: 'POST',
      path: '/api/webhooks',
      description: 'Set up real-time event notifications'
    }
  ]

  const apiExamples = {
    authentication: {
      request: `POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "your_password"
}`,
      response: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@company.com",
    "role": "HR",
    "employee": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}`
    },
    employees: {
      request: `GET /api/employees
Authorization: Bearer your_token_here
Content-Type: application/json`,
      response: `{
  "success": true,
  "data": [
    {
      "id": "emp_001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "position": "Software Engineer",
      "department": "Engineering",
      "hireDate": "2023-01-15",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}`
    },
    attendance: {
      request: `GET /api/attendance?employeeId=emp_001&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer your_token_here
Content-Type: application/json`,
      response: `{
  "success": true,
  "data": [
    {
      "id": "att_001",
      "employeeId": "emp_001",
      "date": "2024-01-15",
      "clockIn": "09:00:00",
      "clockOut": "17:30:00",
      "totalHours": 8.5,
      "overtimeHours": 0.5,
      "status": "approved"
    }
  ]
}`
    },
    payroll: {
      request: `POST /api/payroll/process
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "payPeriod": "2024-01",
  "employeeIds": ["emp_001", "emp_002"]
}`,
      response: `{
  "success": true,
  "data": {
    "payrollId": "pay_001",
    "payPeriod": "2024-01",
    "totalEmployees": 2,
    "totalGrossPay": 15000.00,
    "totalNetPay": 12000.00,
    "status": "processed"
  }
}`
    },
    webhooks: {
      request: `POST /api/webhooks
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["employee.created", "attendance.updated"],
  "secret": "your_webhook_secret"
}`,
      response: `{
  "success": true,
  "data": {
    "webhookId": "webhook_001",
    "url": "https://your-app.com/webhook",
    "events": ["employee.created", "attendance.updated"],
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}`
    }
  }

  const sdkExamples = [
    {
      language: 'JavaScript',
      code: `// Install the SDK
npm install @mastersolis/sdk

// Initialize the client
import { MastersolisClient } from '@mastersolis/sdk';

const client = new MastersolisClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.mastersolis.com'
});

// Get employees
const employees = await client.employees.list();
console.log(employees);

// Create a new employee
const newEmployee = await client.employees.create({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@company.com',
  position: 'Product Manager',
  department: 'Product'
});`
    },
    {
      language: 'Python',
      code: `# Install the SDK
pip install mastersolis-sdk

# Initialize the client
from mastersolis import MastersolisClient

client = MastersolisClient(
    api_key='your_api_key',
    base_url='https://api.mastersolis.com'
)

# Get employees
employees = client.employees.list()
print(employees)

# Create a new employee
new_employee = client.employees.create({
    'firstName': 'Jane',
    'lastName': 'Smith',
    'email': 'jane.smith@company.com',
    'position': 'Product Manager',
    'department': 'Product'
})`
    },
    {
      language: 'PHP',
      code: `<?php
// Install via Composer
composer require mastersolis/php-sdk

// Initialize the client
use Mastersolis\MastersolisClient;

$client = new MastersolisClient([
    'api_key' => 'your_api_key',
    'base_url' => 'https://api.mastersolis.com'
]);

// Get employees
$employees = $client->employees()->list();
print_r($employees);

// Create a new employee
$newEmployee = $client->employees()->create([
    'firstName' => 'Jane',
    'lastName' => 'Smith',
    'email' => 'jane.smith@company.com',
    'position' => 'Product Manager',
    'department' => 'Product'
]);
?>`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              API Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Integrate Mastersolis Infotech with your existing systems using our RESTful API. 
              Access all HR data and functionality programmatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  API Endpoints
                </h2>
                <nav className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => setActiveEndpoint(endpoint.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeEndpoint === endpoint.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{endpoint.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {endpoint.method}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {endpoint.path}
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {/* Endpoint Details */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {endpoints.find(e => e.id === activeEndpoint)?.title}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        endpoints.find(e => e.id === activeEndpoint)?.method === 'GET' ? 'bg-green-100 text-green-700' :
                        endpoints.find(e => e.id === activeEndpoint)?.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {endpoints.find(e => e.id === activeEndpoint)?.method}
                      </span>
                    </div>
                    <code className="text-gray-600 bg-gray-100 px-3 py-1 rounded">
                      {endpoints.find(e => e.id === activeEndpoint)?.path}
                    </code>
                    <p className="text-gray-600 mt-3">
                      {endpoints.find(e => e.id === activeEndpoint)?.description}
                    </p>
                  </div>

                  {/* Request Example */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Example</h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{apiExamples[activeEndpoint]?.request}</code>
                    </pre>
                  </div>

                  {/* Response Example */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Example</h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{apiExamples[activeEndpoint]?.response}</code>
                    </pre>
                  </div>
                </div>

                {/* SDK Examples */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    SDK Examples
                  </h2>
                  <div className="space-y-6">
                    {sdkExamples.map((sdk, index) => (
                      <div key={index}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {sdk.language}
                        </h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <code>{sdk.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Limits */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    API Limits & Pricing
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Tier</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-2">1,000</div>
                      <div className="text-gray-600">API calls per month</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional</h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">10,000</div>
                      <div className="text-gray-600">API calls per month</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
                      <div className="text-3xl font-bold text-purple-600 mb-2">Unlimited</div>
                      <div className="text-gray-600">API calls per month</div>
                    </div>
                  </div>
                </div>

                {/* Getting Started */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="text-blue-100 mb-6">
                    Get your API key and start integrating Mastersolis Infotech with your applications today.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                      Get API Key
                    </button>
                    <button className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                      View Postman Collection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

export default API
