const mongo = require("mongoose")

module.exports = async (arg1, arg2, arg3) => {

            await mongo().then(async mongoose => {
                try{
                    console.log('Connected to mongo!!');
                    await command.execute(client, message, args);
                }
                finally{
                    mongoose.connection.close();
                }
            });

};