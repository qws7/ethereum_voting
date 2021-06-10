var BaseofVoting = artifacts.require("BaseofVotings");
var registration=artifacts.require("registration");
const fs = require('fs');
module.exports = function (deployer) {
    deployer.then(async () => {
        await deployer.deploy(registration);
        await deployer.deploy(BaseofVoting, registration.address);
        // const a=await registration.deployed();
        // const b=await BaseofVoting.deployed();
        // VotingFactory: b.address
        
    });
    
    
    
//   deployer.deploy(registration).then(() => deployer.deploy(BaseofVoting,registration.address))

}
// fs.writeFileSync('MY-PROJECT/build/contracts/addresses.js', JSON.stringify({ registration: registration.address,baseofvotings:BaseofVoting.address }))
