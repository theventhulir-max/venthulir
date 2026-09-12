const mongoose = require('mongoose');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e){}

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://Nithya:123456Nith@ac-ypjxfsu-shard-00-00.dwrbhgg.mongodb.net:27017,ac-ypjxfsu-shard-00-01.dwrbhgg.mongodb.net:27017,ac-ypjxfsu-shard-00-02.dwrbhgg.mongodb.net:27017/ecomVen?ssl=true&replicaSet=atlas-10jm2p-shard-0&authSource=admin&retryWrites=true&w=majority';
        await mongoose.connect(MONGO_URI);
        console.log('🌿 Royal Venthulir Database Connected (Production Ready)');
    } catch (err) {
        console.error('❌ Connection Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
