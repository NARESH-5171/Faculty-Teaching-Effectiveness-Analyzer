const mongoose = require('mongoose');
require('dotenv').config();

// Test different connection methods
const testConnections = async () => {
  const connectionStrings = [
    process.env.MONGO_URI,
    'mongodb+srv://naresh:naresh2004@cluster0.37rhb6e.mongodb.net/faculty_analyzer',
    'mongodb+srv://naresh:naresh2004@cluster0.37rhb6e.mongodb.net/faculty_analyzer?ssl=true',
    'mongodb+srv://naresh:naresh2004@cluster0.37rhb6e.mongodb.net/faculty_analyzer?tls=true&tlsInsecure=true'
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    console.log(`\nTesting connection ${i + 1}...`);
    try {
      await mongoose.connect(connectionStrings[i], {
        serverSelectionTimeoutMS: 5000,
        ssl: true,
        sslValidate: false,
        tlsAllowInvalidCertificates: true
      });
      console.log(`✅ Connection ${i + 1} successful!`);
      console.log(`Working connection string: ${connectionStrings[i]}`);
      await mongoose.disconnect();
      return;
    } catch (error) {
      console.log(`❌ Connection ${i + 1} failed: ${error.message}`);
      await mongoose.disconnect().catch(() => {});
    }
  }
  
  console.log('\n❌ All connection attempts failed');
};

testConnections();