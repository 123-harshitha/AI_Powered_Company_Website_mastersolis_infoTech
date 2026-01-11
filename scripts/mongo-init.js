// MongoDB initialization script
db = db.getSiblingDB('fwc_hrms');

// Create a user for the application
db.createUser({
  user: "app_user",
  pwd: "app_password",
  roles: [
    {
      role: "readWrite",
      db: "fwc_hrms"
    }
  ]
});

// Create initial collections
db.createCollection("users");
db.createCollection("employees");

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.employees.createIndex({ "userId": 1 }, { unique: true });
db.employees.createIndex({ "department": 1 });
db.employees.createIndex({ "isActive": 1 });

print("Database initialization completed");
